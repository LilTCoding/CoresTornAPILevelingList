import React from "react";
import { useEffect, useState } from "react";

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

	useEffect(() => {
		// Load API key from localStorage
		const savedApiKey = localStorage.getItem("apiKey");
		if (savedApiKey) setApiKey(savedApiKey);
	}, []);

	const saveApiKey = () => {
		localStorage.setItem("apiKey", apiKey);
	};

	const fetchStatuses = async () => {
		setLoading(true);
		const promises = XIDS.map(async (xid) => {
			try {
				const response = await fetch(
					`https://api.torn.com/user/${xid}?selections=basic,profile&key=${apiKey}`,
				);
				const data: TornApiResponse = await response.json();
				if (data.error) {
					return {
						xid,
						name: "Unknown",
						status: "Error",
						error: data.error.message,
					};
				}
				return {
					xid,
					name: data.name || "Unknown",
					status: data.status?.state || "Unknown",
					hosp_out: data.status?.until,
					level: data.level,
					hospital_reason: data.status?.description,
					last_action: data.last_action,
					travel: data.travel,
					faction: data.faction,
				};
			} catch (err) {
				return {
					xid,
					name: "Unknown",
					status: "Error",
					error: "Fetch error",
				};
			}
		});
		const results = await Promise.all(promises);
		setStatuses(results);
		setLoading(false);
	};

	useEffect(() => {
		if (apiKey) {
			fetchStatuses();
			const interval = setInterval(fetchStatuses, 5 * 60 * 1000); // Every 5 minutes
			return () => clearInterval(interval);
		}
	}, [apiKey]);

	const getStatusColor = (status: string): string => {
		switch (status.toLowerCase()) {
			case "okay":
				return "status-okay";
			case "hospital":
				return "status-hospital";
			case "traveling":
				return "status-traveling";
			case "jail":
				return "status-jail";
			default:
				return "";
		}
	};

	const formatTime = (timestamp: number): string => {
		return new Date(timestamp * 1000).toLocaleString();
	};

	return (
		<div className="torn-monitor">
			<h1>Levelling List</h1>
			<div className="controls">
				<label>
					API Key:
					<input
						type="text"
						value={apiKey}
						onChange={(e) => setApiKey(e.target.value)}
						placeholder="Enter your Torn API key"
					/>
				</label>
				<button onClick={saveApiKey}>Save</button>
				<button
					onClick={fetchStatuses}
					disabled={loading}
					style={{ minWidth: 100 }}
				>
					{loading ? "Loading..." : "Refresh"}
				</button>
			</div>
			<div className="profiles-grid">
				{statuses.map((status) => (
					<div
						key={status.xid}
						className={`profile-card ${getStatusColor(status.status)}`}
					>
						<div className="profile-header">
							<h3>{status.name}</h3>
							<span className="level">Level {status.level || "?"}</span>
						</div>
						<div className="profile-status">
							<strong>Status:</strong> {status.status}
							{status.hospital_reason && (
								<div className="hospital-reason">
									Reason: {status.hospital_reason}
								</div>
							)}
							{status.hosp_out && (
								<div className="hospital-time">
									Until: {formatTime(status.hosp_out)}
								</div>
							)}
							{status.travel && (
								<div className="travel-info">
									Traveling to: {status.travel.destination}
									<br />
									Returns: {formatTime(status.travel.timestamp)}
								</div>
							)}
						</div>
						<div className="profile-faction">
							{status.faction && (
								<>
									<strong>{status.faction.faction_name}</strong>
									<br />
									{status.faction.position}
								</>
							)}
						</div>
						<div className="action-buttons">
							<a
								href={`https://www.torn.com/profiles.php?XID=${status.xid}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								Profile
							</a>
							<a
								href={`https://www.torn.com/messages.php#/p=compose&XID=${status.xid}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								Message
							</a>
							<a
								href={`https://www.torn.com/trade.php#step=start&userID=${status.xid}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								Trade
							</a>
							<a
								href={`https://www.torn.com/sendcash.php#/XID=${status.xid}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								Send Money
							</a>
							{status.status.toLowerCase() === "okay" && (
								<a
									href={`https://www.torn.com/attack.php?XID=${status.xid}`}
									target="_blank"
									rel="noopener noreferrer"
									className="attack-button"
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
};

export default LevellingList;
