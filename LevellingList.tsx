import React from "react";
import { useEffect, useState } from "react";
import HospitalMonitor from "./HospitalMonitor";
import TornAccount from "./TornAccount";
import NotificationBubble from "./NotificationBubble";

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
	const [profileUrl, setProfileUrl] = useState<string>("");
	const [savedXids, setSavedXids] = useState<number[]>(XIDS);

	useEffect(() => {
		// Load API key and saved XIDs from localStorage
		const savedApiKey = localStorage.getItem("apiKey");
		const savedXidsStr = localStorage.getItem("savedXids");
		if (savedApiKey) setApiKey(savedApiKey);
		if (savedXidsStr) {
			setSavedXids(JSON.parse(savedXidsStr));
		}
	}, []);

	const saveApiKey = () => {
		localStorage.setItem("apiKey", apiKey);
	};

	const addProfile = async () => {
		try {
			// Extract XID from profile URL
			const xidMatch = profileUrl.match(/XID=(\d+)/);
			if (!xidMatch) {
				alert("Invalid Torn profile URL. Please enter a valid profile URL.");
				return;
			}

			const xid = parseInt(xidMatch[1]);
			
			// Check if XID already exists
			if (savedXids.includes(xid)) {
				alert("This profile is already in the list.");
				return;
			}

			// Verify the profile exists and get their name
			const response = await fetch(
				`https://api.torn.com/user/${xid}?selections=basic&key=${apiKey}`
			);
			const data = await response.json();

			if (data.error) {
				alert("Error: " + data.error.message);
				return;
			}

			// Add the new XID to the list
			const newXids = [...savedXids, xid];
			setSavedXids(newXids);
			localStorage.setItem("savedXids", JSON.stringify(newXids));
			
			// Clear the input
			setProfileUrl("");
			
			// Refresh the statuses
			fetchStatuses();
		} catch (err) {
			alert("Error adding profile. Please try again.");
		}
	};

	const removeProfile = (xidToRemove: number) => {
		const newXids = savedXids.filter(xid => xid !== xidToRemove);
		setSavedXids(newXids);
		localStorage.setItem("savedXids", JSON.stringify(newXids));
		fetchStatuses();
	};

	const fetchStatuses = async () => {
		setLoading(true);
		const promises = savedXids.map(async (xid) => {
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
			<TornAccount />
			<div className="add-profile">
				<label>
					Add Profile:
					<input
						type="text"
						value={profileUrl}
						onChange={(e) => setProfileUrl(e.target.value)}
						placeholder="Enter Torn profile URL (e.g., https://www.torn.com/profiles.php?XID=123456)"
					/>
				</label>
				<button onClick={addProfile} disabled={loading}>
					Add
				</button>
			</div>
			<HospitalMonitor apiKey={apiKey} xids={savedXids} />
			<div className="profiles-grid">
				{statuses.map((status) => (
					<div
						key={status.xid}
						className={`profile-card ${getStatusColor(status.status)}`}
					>
						<div className="profile-header">
							<h3>{status.name}</h3>
							<span className="level">Level {status.level || "?"}</span>
							<button 
								className="remove-profile"
								onClick={() => removeProfile(status.xid)}
								title="Remove from list"
							>
								×
							</button>
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
								className="action-button profile-button"
							>
								Profile
							</a>
							<a
								href={`https://www.torn.com/messages.php#/p=compose&XID=${status.xid}`}
								target="_blank"
								rel="noopener noreferrer"
								className="action-button message-button"
							>
								Message
							</a>
							<a
								href={`https://www.torn.com/trade.php#step=start&userID=${status.xid}`}
								target="_blank"
								rel="noopener noreferrer"
								className="action-button trade-button"
							>
								Trade
							</a>
							<a
								href={`https://www.torn.com/sendcash.php#/XID=${status.xid}`}
								target="_blank"
								rel="noopener noreferrer"
								className="action-button money-button"
							>
								Send Money
							</a>
							{status.status.toLowerCase() === "okay" && (
								<a
									href={`https://www.torn.com/attack.php?XID=${status.xid}`}
									target="_blank"
									rel="noopener noreferrer"
									className="action-button attack-button"
								>
									Attack
								</a>
							)}
						</div>
					</div>
				))}
			</div>
			<NotificationBubble />
		</div>
	);
};

export default LevellingList;
