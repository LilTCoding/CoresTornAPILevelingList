import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/store";
import { toast } from "sonner";

interface UserStatus {
	xid: number;
	name?: string;
	level?: number;
	status?: string;
	lastAction?: number;
	error?: string;
	faction?: {
		position: string;
		faction_name: string;
	};
	hospital_reason?: string;
	hosp_out?: number;
	travel?: {
		destination: string;
		timestamp: number;
	};
}

interface TornApiResponse {
	error?: { message: string };
	name: string;
	level: number;
	status: {
		state: string;
		until: number;
		description?: string;
	};
	last_action: {
		timestamp: number;
	};
	faction?: {
		position: string;
		faction_name: string;
	};
	travel?: {
		destination: string;
		timestamp: number;
	};
}

const DEFAULT_XIDS = [3105330, 2660513, 3522824, 3389005, 3517639, 2096673, 3743639, 3733824];

export default function LevellingList() {
	const { apiKey, setApiKey, xids, setXids } = useStore();
	const [statuses, setStatuses] = useState<UserStatus[]>([]);
	const [loading, setLoading] = useState(false);
	const [newXid, setNewXid] = useState("");

	useEffect(() => {
		if (apiKey) {
			fetchStatuses();
			const interval = setInterval(fetchStatuses, 5 * 60 * 1000); // Every 5 minutes
			return () => clearInterval(interval);
		}
	}, [apiKey]);

	const saveApiKey = () => {
		localStorage.setItem("tornApiKey", apiKey);
		toast.success("API key saved successfully");
	};

	const addXid = () => {
		const xid = parseInt(newXid);
		if (isNaN(xid)) {
			toast.error("Please enter a valid XID");
			return;
		}
		if (xids.includes(xid.toString())) {
			toast.error("This XID is already in the list");
			return;
		}
		const newXids = [...xids, xid.toString()];
		setXids(newXids);
		localStorage.setItem("xids", newXids.join(","));
		setNewXid("");
		toast.success("XID added successfully");
		fetchStatuses();
	};

	const removeXid = (xidToRemove: string) => {
		const newXids = xids.filter(xid => xid !== xidToRemove);
		setXids(newXids);
		localStorage.setItem("xids", newXids.join(","));
		toast.success("XID removed successfully");
		fetchStatuses();
	};

	const fetchStatuses = useCallback(async () => {
		if (!apiKey) return;
		setLoading(true);
		try {
			const results = await Promise.all(
				xids.map(async (xid: string) => {
					try {
						const response = await fetch(
							`https://api.torn.com/user/${xid}?selections=profile,basic&key=${apiKey}`,
						);
						const data: TornApiResponse = await response.json();
						if (data.error) {
							return { xid: parseInt(xid), error: data.error.message };
						}
						return {
							xid: parseInt(xid),
							name: data.name,
							level: data.level,
							status: data.status.state,
							lastAction: data.last_action.timestamp,
							faction: data.faction,
							hospital_reason: data.status.description,
							hosp_out: data.status.until,
							travel: data.travel
						};
					} catch (err) {
						return { xid: parseInt(xid), error: "Fetch error" };
					}
				}),
			);
			setStatuses(results);
		} catch (err) {
			console.error("Error fetching statuses:", err);
			toast.error("Failed to fetch statuses");
		} finally {
			setLoading(false);
		}
	}, [apiKey, xids]);

	const getStatusColor = (status?: string) => {
		switch (status?.toLowerCase()) {
			case "hospital":
				return "bg-red-500";
			case "jail":
				return "bg-yellow-500";
			case "traveling":
				return "bg-blue-500";
			default:
				return "bg-green-500";
		}
	};

	const formatTime = (timestamp?: number) => {
		if (!timestamp) return "Unknown";
		return new Date(timestamp * 1000).toLocaleString();
	};

	const formatTimeLeft = (timestamp?: number) => {
		if (!timestamp) return "Unknown";
		const now = Math.floor(Date.now() / 1000);
		const timeLeft = timestamp - now;
		if (timeLeft <= 0) return "Released";
		const minutes = Math.floor(timeLeft / 60);
		const seconds = timeLeft % 60;
		return `${minutes}m ${seconds}s`;
	};

	return (
		<div className="container mx-auto p-4">
			<div className="mb-4 rounded-lg bg-gray-800 p-4 shadow-lg">
				<div className="grid gap-4 md:grid-cols-2">
					<div>
						<label className="mb-2 block font-medium text-sm">
							Torn API Key
							<input
								type="password"
								value={apiKey}
								onChange={(e) => setApiKey(e.target.value)}
								className="mt-1 w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
								placeholder="Enter your Torn API key"
							/>
						</label>
						<div className="mt-4 flex gap-2">
							<button
								type="button"
								onClick={saveApiKey}
								className="rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
							>
								Save
							</button>
							<button
								type="button"
								onClick={fetchStatuses}
								disabled={loading}
								className="rounded bg-green-500 px-4 py-2 font-semibold text-white hover:bg-green-600 disabled:opacity-50"
							>
								{loading ? "Loading..." : "Refresh"}
							</button>
						</div>
					</div>
					<div>
						<label className="mb-2 block font-medium text-sm">
							Add XID
							<div className="mt-1 flex gap-2">
								<input
									type="text"
									value={newXid}
									onChange={(e) => setNewXid(e.target.value)}
									className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
									placeholder="Enter XID to add"
								/>
								<button
									type="button"
									onClick={addXid}
									className="rounded bg-purple-500 px-4 py-2 font-semibold text-white hover:bg-purple-600"
								>
									Add
								</button>
							</div>
						</label>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{statuses.map((status) => (
					<div
						key={status.xid}
						className="rounded-lg bg-gray-800 p-4 shadow-lg"
					>
						<div className="mb-4 flex items-center justify-between">
							<h3 className="text-lg font-semibold text-white">{status.name}</h3>
							<button
								onClick={() => removeXid(status.xid.toString())}
								className="text-red-500 hover:text-red-600"
							>
								×
							</button>
						</div>
						<div className="space-y-2">
							<p className="text-gray-300">Level: {status.level || "Unknown"}</p>
							<p className="text-gray-300">
								Status: <span className={getStatusColor(status.status)}>{status.status || "Unknown"}</span>
							</p>
							{status.hospital_reason && (
								<p className="text-gray-300">Reason: {status.hospital_reason}</p>
							)}
							{status.hosp_out && (
								<p className="text-gray-300">Time Left: {formatTimeLeft(status.hosp_out)}</p>
							)}
							{status.travel && (
								<p className="text-gray-300">
									Traveling to: {status.travel.destination}
									<br />
									Returns: {formatTime(status.travel.timestamp)}
								</p>
							)}
							{status.faction && (
								<p className="text-gray-300">
									Faction: {status.faction.faction_name}
									<br />
									Position: {status.faction.position}
								</p>
							)}
							<p className="text-gray-300">Last Action: {formatTime(status.lastAction)}</p>
							{status.error && <p className="text-red-500">{status.error}</p>}
						</div>
						<div className="mt-4 flex flex-wrap gap-2">
							<a
								href={`https://www.torn.com/profiles.php?XID=${status.xid}`}
								target="_blank"
								rel="noopener noreferrer"
								className="rounded bg-gray-700 px-3 py-1 text-white hover:bg-gray-600"
							>
								Profile
							</a>
							<a
								href={`https://www.torn.com/messages.php#/p=compose&XID=${status.xid}`}
								target="_blank"
								rel="noopener noreferrer"
								className="rounded bg-gray-700 px-3 py-1 text-white hover:bg-gray-600"
							>
								Message
							</a>
							<a
								href={`https://www.torn.com/trade.php#step=start&userID=${status.xid}`}
								target="_blank"
								rel="noopener noreferrer"
								className="rounded bg-gray-700 px-3 py-1 text-white hover:bg-gray-600"
							>
								Trade
							</a>
							<a
								href={`https://www.torn.com/sendcash.php#/XID=${status.xid}`}
								target="_blank"
								rel="noopener noreferrer"
								className="rounded bg-gray-700 px-3 py-1 text-white hover:bg-gray-600"
							>
								Send Money
							</a>
							{status.status?.toLowerCase() !== "hospital" && (
								<a
									href={`https://www.torn.com/loader.php?sid=attack&user2ID=${status.xid}`}
									target="_blank"
									rel="noopener noreferrer"
									className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
								>
									Attack
								</a>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
