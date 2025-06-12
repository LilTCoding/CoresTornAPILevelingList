import type React from "react";
import { useCallback, useEffect, useState } from "react";

interface UserStatus {
	xid: number;
	name?: string;
	level?: number;
	status?: string;
	lastAction?: number;
	error?: string;
}

interface TornApiResponse {
	error?: { message: string };
	name: string;
	level: number;
	status: {
		state: string;
		until: number;
	};
	last_action: {
		timestamp: number;
	};
}

const XIDS = [1, 2, 3, 4, 5]; // Replace with actual XIDs

export default function LevellingList() {
	const [apiKey, setApiKey] = useState<string>("");
	const [statuses, setStatuses] = useState<UserStatus[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const savedApiKey = localStorage.getItem("tornApiKey");
		if (savedApiKey) setApiKey(savedApiKey);
	}, []);

	const saveApiKey = () => {
		localStorage.setItem("tornApiKey", apiKey);
	};

	const fetchStatuses = useCallback(async () => {
		if (!apiKey) return;
		setLoading(true);
		try {
			const results = await Promise.all(
				XIDS.map(async (xid) => {
					try {
						const response = await fetch(
							`https://api.torn.com/user/${xid}?selections=profile&key=${apiKey}`,
						);
						const data: TornApiResponse = await response.json();
						if (data.error) {
							return { xid, error: data.error.message };
						}
						return {
							xid,
							name: data.name,
							level: data.level,
							status: data.status.state,
							lastAction: data.last_action.timestamp,
						};
					} catch (err) {
						return { xid, error: "Fetch error" };
					}
				}),
			);
			setStatuses(results);
		} catch (err) {
			console.error("Error fetching statuses:", err);
		} finally {
			setLoading(false);
		}
	}, [apiKey]);

	useEffect(() => {
		if (apiKey) {
			fetchStatuses();
			const interval = setInterval(fetchStatuses, 5 * 60 * 1000); // Every 5 minutes
			return () => clearInterval(interval);
		}
	}, [apiKey, fetchStatuses]);

	const getStatusColor = (status?: string) => {
		switch (status) {
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

	return (
		<div className="container mx-auto p-4">
			<div className="mb-4 rounded-lg bg-gray-800 p-4 shadow-lg">
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
						className="rounded bg-blue-500 px-4 py-2 font-semibold text-white"
					>
						Save
					</button>
					<button
						type="button"
						onClick={fetchStatuses}
						disabled={loading}
						className="rounded bg-green-500 px-4 py-2 font-semibold text-white disabled:opacity-50"
					>
						{loading ? "Loading..." : "Refresh"}
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{statuses.map((status) => (
					<div
						key={status.xid}
						className={`rounded-lg p-4 shadow-lg ${getStatusColor(status.status)}`}
					>
						<h3 className="mb-2 text-lg font-semibold">{status.name}</h3>
						<p>Level: {status.level || "Unknown"}</p>
						<p>Status: {status.status || "Unknown"}</p>
						<p>Last Action: {formatTime(status.lastAction)}</p>
						{status.error && <p className="text-red-500">{status.error}</p>}
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
							<a
								href={`https://www.torn.com/loader.php?sid=attack&user2ID=${status.xid}`}
								target="_blank"
								rel="noopener noreferrer"
								className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
							>
								Attack
							</a>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
