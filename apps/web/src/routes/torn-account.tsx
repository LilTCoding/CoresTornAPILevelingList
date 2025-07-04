import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore } from "@/store";
import { toast } from "sonner";
import "./torn-account.css";

export const Route = createFileRoute("/torn-account")({
	component: TornAccount,
});

interface TornUserData {
	name: string;
	level: number;
	status: {
		state: string;
		until: number;
		description?: string;
	};
	last_action: {
		status: string;
		timestamp: number;
	};
	faction: {
		position: string;
		faction_name: string;
	};
	travel: {
		destination: string;
		timestamp: number;
	};
	energy: {
		current: number;
		maximum: number;
		increment: number;
		interval: number;
		ticktime: number;
		fulltime: number;
	};
	nerve: {
		current: number;
		maximum: number;
		increment: number;
		interval: number;
		ticktime: number;
		fulltime: number;
	};
	happy: {
		current: number;
		maximum: number;
		increment: number;
		interval: number;
		ticktime: number;
		fulltime: number;
	};
	life: {
		current: number;
		maximum: number;
		increment: number;
		interval: number;
		ticktime: number;
		fulltime: number;
	};
	stats: {
		strength: number;
		defense: number;
		speed: number;
		dexterity: number;
		total: number;
	};
	money: number;
	bank: number;
	points: number;
	networth: number;
	rank: string;
	respect: number;
	job: {
		position: string;
		company_name: string;
	};
	education: {
		current: string;
		time_left: number;
	};
	merits: number;
	awards: number;
	friends: number;
	enemies: number;
	forum_posts: number;
	karma: number;
	age: number;
	role: string;
	donator: boolean;
	property: string;
	stock: {
		[key: string]: {
			shares: number;
			value: number;
		};
	};
	bazaar: {
		[key: string]: {
			quantity: number;
			price: number;
		};
	};
	display: {
		[key: string]: string;
	};
}

function TornAccount() {
	const { apiKey } = useStore();
	const [userData, setUserData] = useState<TornUserData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
	const [autoUpdate, setAutoUpdate] = useState(true);

	const fetchUserData = async () => {
		if (!apiKey) {
			setError("API key is required");
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			setError(null);
			const response = await fetch(
				`https://api.torn.com/user/?selections=profile,basic,education,workstats,personalstats,stocks,bazaar,display&key=${apiKey}`
			);
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (data.error) {
				throw new Error(data.error.message);
			}

			// Do not throw if stats is missing; just set the data
			setUserData(data);
			setLastUpdate(new Date());
			toast.success('Account data updated');
		} catch (err) {
			console.error('Error fetching user data:', err);
			setError(err instanceof Error ? err.message : "Failed to fetch user data");
			toast.error('Failed to fetch account data');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (apiKey) {
			fetchUserData();
			let interval: number | undefined;

			if (autoUpdate) {
				interval = window.setInterval(fetchUserData, 30000); // Update every 30 seconds
			}

			return () => {
				if (interval) {
					clearInterval(interval);
				}
			};
		}
	}, [apiKey, autoUpdate]);

	const formatTime = (timestamp: number): string => {
		return new Date(timestamp * 1000).toLocaleString();
	};

	const formatMoney = (amount: number): string => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	};

	const calculateTimeUntilFull = (current: number, maximum: number, increment: number, interval: number): string => {
		const pointsNeeded = maximum - current;
		const timeNeeded = (pointsNeeded / increment) * interval;
		const minutes = Math.floor(timeNeeded / 60);
		const seconds = Math.floor(timeNeeded % 60);
		return `${minutes}m ${seconds}s`;
	};

	if (!apiKey) {
		return (
			<div className="torn-account">
				<div className="error">
					Please set your API key in the settings to view your account data
				</div>
			</div>
		);
	}

	if (loading && !userData) {
		return (
			<div className="torn-account">
				<div className="loading">Loading account data...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="torn-account">
				<div className="error">Error: {error}</div>
			</div>
		);
	}

	if (!userData) {
		return (
			<div className="torn-account">
				<div className="no-data">No account data available</div>
			</div>
		);
	}

	return (
		<div className="torn-account">
			{/* Owner/Admin Banner */}
			<div className="owner-banner">
				<strong>Owner/Admin:</strong> LilTorey [3544082]
			</div>
			<div className="account-header">
				<h2>
					<a
						href={`https://www.torn.com/profiles.php?XID=${3544082}`}
						target="_blank"
						rel="noopener noreferrer"
						className="profile-link"
					>
						{userData.name}
					</a>
					's Account
				</h2>
				<div className="account-controls">
					<button onClick={fetchUserData} disabled={loading} className="refresh-button">
						{loading ? "Updating..." : "Refresh"}
					</button>
					<label className="auto-update">
						<input
							type="checkbox"
							checked={autoUpdate}
							onChange={(e) => setAutoUpdate(e.target.checked)}
						/>
						Auto-update
					</label>
					{lastUpdate && (
						<div className="last-update">
							Last updated: {lastUpdate.toLocaleTimeString()}
						</div>
					)}
				</div>
			</div>
			<div className="account-info-box">
				<div className="info-row">
					<span className="label">Name:</span>
					<span className="value">
						<a
							href={`https://www.torn.com/profiles.php?XID=${3544082}`}
							target="_blank"
							rel="noopener noreferrer"
							className="profile-link"
						>
							{userData.name}
						</a>
					</span>
				</div>
				<div className="info-row">
					<span className="label">Money:</span>
					<span className="value" style={{ color: '#1bc900', fontWeight: 600 }}>
						{formatMoney(userData.money)}
					</span>
				</div>
				<div className="info-row">
					<span className="label">Level:</span>
					<span className="value">{userData.level}</span>
				</div>
				<div className="info-row">
					<span className="label">Points:</span>
					<span className="value">{userData.points}</span>
				</div>
				<div className="info-row">
					<span className="label">Merits:</span>
					<span className="value">
						{userData.merits} {userData.merits > 0 && (
							<a
								href="https://www.torn.com/merits.php"
								target="_blank"
								rel="noopener noreferrer"
								className="merit-use-link"
								style={{ color: '#1bc900', marginLeft: 4 }}
							>
								[use]
							</a>
						)}
					</span>
				</div>
			</div>
			{/* Resource Bars */}
			<div className="resource-bars">
				{/* Energy */}
				<div className="resource-row">
					<span className="label">Energy:</span>
					<div className="bar-container">
						<div
							className="bar energy-bar"
							style={{ width: `${(userData.energy.current / userData.energy.maximum) * 100}%` }}
						/>
						<span className="bar-text">
							{userData.energy && typeof userData.energy.current === 'number' && typeof userData.energy.maximum === 'number' ? (
								<>
									{userData.energy.current}/{userData.energy.maximum}
									{userData.energy.current < userData.energy.maximum && (
										<span className="bar-timer">
											{calculateTimeUntilFull(
												userData.energy.current,
												userData.energy.maximum,
												userData.energy.increment ?? 1,
												userData.energy.interval ?? 60
											)}
										</span>
									)}
								</>
							) : (
								<span>Not available</span>
							)}
						</span>
					</div>
				</div>
				{/* Nerve */}
				<div className="resource-row">
					<span className="label">Nerve:</span>
					<div className="bar-container">
						<div
							className="bar nerve-bar"
							style={{ width: `${(userData.nerve.current / userData.nerve.maximum) * 100}%` }}
						/>
						<span className="bar-text">
							{userData.nerve && typeof userData.nerve.current === 'number' && typeof userData.nerve.maximum === 'number' ? (
								<>
									{userData.nerve.current}/{userData.nerve.maximum}
									{userData.nerve.current < userData.nerve.maximum && (
										<span className="bar-timer">
											{calculateTimeUntilFull(
												userData.nerve.current,
												userData.nerve.maximum,
												userData.nerve.increment ?? 1,
												userData.nerve.interval ?? 60
											)}
										</span>
									)}
								</>
							) : (
								<span>Not available</span>
							)}
						</span>
					</div>
				</div>
				{/* Happy */}
				<div className="resource-row">
					<span className="label">Happy:</span>
					<div className="bar-container">
						<div
							className="bar happy-bar"
							style={{ width: `${userData.happy.maximum === 0 ? 0 : (userData.happy.current / userData.happy.maximum) * 100}%` }}
						/>
						<span className="bar-text">
							{userData.happy && typeof userData.happy.current === 'number' && typeof userData.happy.maximum === 'number' ? (
								<>
									{userData.happy.current}/{userData.happy.maximum}
									{userData.happy.current < userData.happy.maximum && (
										<span className="bar-timer">
											{calculateTimeUntilFull(
												userData.happy.current,
												userData.happy.maximum,
												userData.happy.increment ?? 1,
												userData.happy.interval ?? 60
											)}
										</span>
									)}
								</>
							) : (
								<span>Not available</span>
							)}
						</span>
					</div>
				</div>
				{/* Life */}
				<div className="resource-row">
					<span className="label">Life:</span>
					<div className="bar-container">
						<div
							className="bar life-bar"
							style={{ width: `${(userData.life.current / userData.life.maximum) * 100}%` }}
						/>
						<span className="bar-text">
							{userData.life && typeof userData.life.current === 'number' && typeof userData.life.maximum === 'number' ? (
								<>
									{userData.life.current}/{userData.life.maximum}
									{userData.life.current < userData.life.maximum && (
										<span className="bar-timer">
											{calculateTimeUntilFull(
												userData.life.current,
												userData.life.maximum,
												userData.life.increment ?? 1,
												userData.life.interval ?? 60
											)}
										</span>
									)}
								</>
							) : (
								<span>Not available</span>
							)}
						</span>
					</div>
				</div>
			</div>
			<div className="account-grid">
				<Card className="account-card basic-info">
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="info-grid">
							<div className="info-item">
								<span className="label">Status:</span>
								<span className={`value status-${userData.status.state.toLowerCase()}`}>
									{userData.status.state}
									{userData.status.description && ` (${userData.status.description})`}
								</span>
							</div>
							<div className="info-item">
								<span className="label">Rank:</span>
								<span className="value">{userData.rank}</span>
							</div>
							<div className="info-item">
								<span className="label">Age:</span>
								<span className="value">{userData.age} days</span>
							</div>
							<div className="info-item">
								<span className="label">Role:</span>
								<span className="value">{userData.role}</span>
							</div>
							<div className="info-item">
								<span className="label">Donator:</span>
								<span className="value">{userData.donator ? "Yes" : "No"}</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="account-card stats">
					<CardHeader>
						<CardTitle>Stats</CardTitle>
					</CardHeader>
					<CardContent>
						{userData.stats ? (
							<div className="info-grid">
								<div className="info-item">
									<span className="label">Strength:</span>
									<span className="value">{userData.stats.strength.toLocaleString()}</span>
								</div>
								<div className="info-item">
									<span className="label">Defense:</span>
									<span className="value">{userData.stats.defense.toLocaleString()}</span>
								</div>
								<div className="info-item">
									<span className="label">Speed:</span>
									<span className="value">{userData.stats.speed.toLocaleString()}</span>
								</div>
								<div className="info-item">
									<span className="label">Dexterity:</span>
									<span className="value">{userData.stats.dexterity.toLocaleString()}</span>
								</div>
								<div className="info-item">
									<span className="label">Total:</span>
									<span className="value">{userData.stats.total.toLocaleString()}</span>
								</div>
							</div>
						) : (
							<div className="info-grid">
								<div className="info-item">
									<span className="label">Stats:</span>
									<span className="value">Not available for this account or API key.</span>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="account-card finances">
					<CardHeader>
						<CardTitle>Finances</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="info-grid">
							<div className="info-item">
								<span className="label">Bank:</span>
								<span className="value">{formatMoney(userData.bank)}</span>
							</div>
							<div className="info-item">
								<span className="label">Networth:</span>
								<span className="value">{formatMoney(userData.networth)}</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="account-card faction">
					<CardHeader>
						<CardTitle>Faction</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="info-grid">
							<div className="info-item">
								<span className="label">Position:</span>
								<span className="value">{userData.faction.position}</span>
							</div>
							<div className="info-item">
								<span className="label">Faction:</span>
								<span className="value">{userData.faction.faction_name}</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="account-card job">
					<CardHeader>
						<CardTitle>Job</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="info-grid">
							<div className="info-item">
								<span className="label">Position:</span>
								<span className="value">{userData.job.position}</span>
							</div>
							<div className="info-item">
								<span className="label">Company:</span>
								<span className="value">{userData.job.company_name}</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="account-card education">
					<CardHeader>
						<CardTitle>Education</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="info-grid">
							<div className="info-item">
								<span className="label">Current Course:</span>
								<span className="value">{userData.education.current}</span>
							</div>
							<div className="info-item">
								<span className="label">Time Left:</span>
								<span className="value">
									{Math.floor(userData.education.time_left / 60)}m {userData.education.time_left % 60}s
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="account-card achievements">
					<CardHeader>
						<CardTitle>Achievements</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="info-grid">
							<div className="info-item">
								<span className="label">Awards:</span>
								<span className="value">{userData.awards}</span>
							</div>
							<div className="info-item">
								<span className="label">Friends:</span>
								<span className="value">{userData.friends}</span>
							</div>
							<div className="info-item">
								<span className="label">Enemies:</span>
								<span className="value">{userData.enemies}</span>
							</div>
							<div className="info-item">
								<span className="label">Forum Posts:</span>
								<span className="value">{userData.forum_posts}</span>
							</div>
							<div className="info-item">
								<span className="label">Karma:</span>
								<span className="value">{userData.karma}</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default TornAccount;
