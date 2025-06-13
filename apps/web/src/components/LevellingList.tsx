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

// Helper to group users by exact level
function groupByExactLevel(statuses: UserStatus[]) {
	const groups: Record<string, UserStatus[]> = {};
	statuses.forEach((user) => {
		if (user.level === undefined || user.level === null) {
			if (!groups['Unknown Level']) groups['Unknown Level'] = [];
			groups['Unknown Level'].push(user);
		} else {
			const label = `Level ${user.level}`;
			if (!groups[label]) groups[label] = [];
			groups[label].push(user);
		}
	});
	return groups;
}

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

	const levelGroups = groupByExactLevel(statuses);

	return (
		<div className="torn-monitor">
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

				<h1>Levelling List</h1>

				<div className="level-groups-container">
					{Object.keys(levelGroups).sort((a, b) => {
						if (a === 'Unknown Level') return 1;
						if (b === 'Unknown Level') return -1;
						// Extract level number for sorting
						const aLevel = parseInt(a.match(/\d+/)?.[0] || '0', 10);
						const bLevel = parseInt(b.match(/\d+/)?.[0] || '0', 10);
						return aLevel - bLevel;
					}).map((group) => (
						<div key={group} className="level-group-section">
							<h2 className="level-group-heading">{group}'s</h2>
							<div className="level-group-row">
								{levelGroups[group].map((user) => (
									<div key={user.xid} className="profile-card horizontal-profile-card">
										<div className="profile-header">
											<h3>{user.name || user.xid}</h3>
										</div>
										<div className="profile-actions">
											<a
												href={`https://www.torn.com/messages.php#/p=compose&XID=${user.xid}`}
												target="_blank"
												rel="noopener noreferrer"
												className="action-link"
											>
												Message
											</a>
											<a
												href={`https://www.torn.com/trade.php#step=start&userID=${user.xid}`}
												target="_blank"
												rel="noopener noreferrer"
												className="action-link"
											>
												Trade
											</a>
											<a
												href={`https://www.torn.com/sendcash.php#/XID=${user.xid}`}
												target="_blank"
												rel="noopener noreferrer"
												className="action-link"
											>
												Send Money
											</a>
											{user.status?.toLowerCase() !== "hospital" && (
												<a
													href={`https://www.torn.com/loader.php?sid=attack&user2ID=${user.xid}`}
													target="_blank"
													rel="noopener noreferrer"
													className="action-link attack-button"
												>
													Attack
												</a>
											)}
										</div>
										<div className="profile-level">Level: {user.level || "Unknown"}</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
