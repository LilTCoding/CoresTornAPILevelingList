import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import "./LevellingList.css";

interface UserStatus {
	xid: number;
	name: string;
	status: string;
	hosp_out?: number;
	error?: string;
	level?: number;
	faction?: {
		position: string;
		faction_name: string;
	};
	last_action?: {
		status: string;
		timestamp: number;
	};
	hospital_reason?: string;
	travel?: {
		destination: string;
		timestamp: number;
	};
}

interface TornApiResponse {
	error?: {
		code: number;
		message: string;
	};
	name?: string;
	level?: number;
	status?: {
		state: string;
		until: number;
		description?: string;
	};
	last_action?: {
		status: string;
		timestamp: number;
	};
	travel?: {
		destination: string;
		timestamp: number;
	};
	faction?: {
		position: string;
		faction_name: string;
	};
}

const XIDS = [
	3105330, 2660513, 3522824, 3389005, 3517639, 2096673, 3743639, 3733824,
	2425315, 3645256, 2094561, 2094477, 2066063, 2102491, 2185272, 3757648,
	3724222, 3713792, 3705514, 3410749, 3364229, 2761462, 3509086,
];

const LevellingList: React.FC = () => {
	const [apiKey, setApiKey] = useState<string>("");
	const [statuses, setStatuses] = useState<UserStatus[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [savedXids, setSavedXids] = useState<number[]>(XIDS);

	useEffect(() => {
		const savedApiKey = localStorage.getItem("apiKey");
		const savedXidsStr = localStorage.getItem("savedXids");
		if (savedApiKey) setApiKey(savedApiKey);
		if (savedXidsStr) {
			setSavedXids(JSON.parse(savedXidsStr));
		}
	}, []);

	const saveApiKey = () => {
		localStorage.setItem("apiKey", apiKey);
		toast.success("API key saved successfully");
	};

	const fetchStatuses = useCallback(async () => {
		if (!apiKey) {
			toast.error("Please enter your API key first");
			return;
		}
		setLoading(true);
		try {
			const results = await Promise.all(
				savedXids.map(async (xid: number) => {
					try {
						const response = await fetch(
							`https://api.torn.com/user/${xid}?selections=profile,basic&key=${apiKey}`,
						);
						const data: TornApiResponse = await response.json();
						if (data.error) {
							return {
								xid,
								name: "Unknown",
								status: "Error",
								error: data.error.message
							};
						}
						return {
							xid,
							name: data.name || "Unknown",
							level: data.level,
							status: data.status?.state || "Unknown",
							last_action: data.last_action,
							faction: data.faction,
							hospital_reason: data.status?.description,
							hosp_out: data.status?.until,
							travel: data.travel
						};
					} catch (err) {
						return {
							xid,
							name: "Unknown",
							status: "Error",
							error: "Fetch error"
						};
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
	}, [apiKey, savedXids]);

	useEffect(() => {
		if (apiKey) {
			fetchStatuses();
			const interval = setInterval(fetchStatuses, 5 * 60 * 1000);
			return () => clearInterval(interval);
		}
	}, [apiKey, fetchStatuses]);

	const groupByExactLevel = (statuses: UserStatus[]) => {
		const groups: { [key: string]: UserStatus[] } = {};
		statuses.forEach((status) => {
			const level = status.level?.toString() || "Unknown Level";
			if (!groups[level]) {
				groups[level] = [];
			}
			groups[level].push(status);
		});
		return groups;
	};

	const levelGroups = groupByExactLevel(statuses);

	return (
		<div className="cyberpunk-container">
			<div className="cyberpunk-header">
				<h1>Levelling List</h1>
			</div>

			<div className="controls-section">
				<div className="api-key-control">
					<input
						type="password"
						value={apiKey}
						onChange={(e) => setApiKey(e.target.value)}
						placeholder="Enter your Torn API key"
						className="cyberpunk-input"
					/>
					<button onClick={saveApiKey} className="cyberpunk-button save-btn">
						Save Key
					</button>
					<button
						onClick={fetchStatuses}
						disabled={loading}
						className="cyberpunk-button refresh-btn"
					>
						{loading ? "Loading..." : "Refresh"}
					</button>
				</div>
			</div>

			<div className="level-groups-container">
				{Object.keys(levelGroups)
					.sort((a, b) => {
						if (a === "Unknown Level") return 1;
						if (b === "Unknown Level") return -1;
						return parseInt(a) - parseInt(b);
					})
					.map((group) => (
						<div key={group} className="level-group-section">
							<h2 className="level-group-heading">Level {group}</h2>
							<div className="level-group-row">
								{levelGroups[group].map((user) => (
									<div key={user.xid} className="profile-card">
										<div className="profile-header">
											<h3>{user.name || user.xid}</h3>
										</div>
										<div className="profile-level">
											Level: {user.level || "Unknown"}
										</div>
										<div className="profile-actions">
											<button
												className="action-btn message-btn"
												onClick={() => window.open(`https://www.torn.com/messages.php#/p=compose&XID=${user.xid}`, '_blank')}
											>
												Message
											</button>
											<button
												className="action-btn trade-btn"
												onClick={() => window.open(`https://www.torn.com/trade.php#step=start&userID=${user.xid}`, '_blank')}
											>
												Trade
											</button>
											<button
												className="action-btn sendmoney-btn"
												onClick={() => window.open(`https://www.torn.com/sendcash.php#/XID=${user.xid}`, '_blank')}
											>
												Send Money
											</button>
											{user.status?.toLowerCase() !== "hospital" && (
												<button
													className="action-btn attack-btn"
													onClick={() => window.open(`https://www.torn.com/loader.php?sid=attack&user2ID=${user.xid}`, '_blank')}
												>
													Attack
												</button>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					))}
			</div>
		</div>
	);
};

export default LevellingList;
