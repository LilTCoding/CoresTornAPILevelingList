import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore } from "@/store";

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
				`https://api.torn.com/user/?selections=profile,basic,education,workstats,stocks,bazaar,display&key=${apiKey}`
			);
			const data = await response.json();

			if (data.error) {
				throw new Error(data.error.message);
			}

			setUserData(data);
			setLastUpdate(new Date());
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch user data");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
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

	if (loading && !userData) {
		return <div className="loading">Loading account data...</div>;
	}

	if (error) {
		return <div className="error">Error: {error}</div>;
	}

	if (!userData) {
		return <div className="no-data">No account data available</div>;
	}

	return (
		<div className="torn-account">
			<div className="account-header">
				<h2>{userData.name}'s Account</h2>
				<div className="account-controls">
					<button onClick={fetchUserData} disabled={loading}>
						{loading ? "Updating..." : "Refresh"}
					</button>
					<label>
						<input
							type="checkbox"
							checked={autoUpdate}
							onChange={(e) => setAutoUpdate(e.target.checked)}
						/>
						Auto-update
					</label>
				</div>
				{lastUpdate && (
					<div className="last-update">
						Last updated: {lastUpdate.toLocaleTimeString()}
					</div>
				)}
			</div>

			<div className="account-grid">
				<div className="account-card basic-info">
					<h3>Basic Information</h3>
					<div className="info-grid">
						<div className="info-item">
							<span className="label">Level:</span>
							<span className="value">{userData.level}</span>
						</div>
						<div className="info-item">
							<span className="label">Status:</span>
							<span className={`value status-${userData.status.state.toLowerCase()}`}>
								{userData.status.state}
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
				</div>

				<div className="account-card resources">
					<h3>Resources</h3>
					<div className="resource-grid">
						<div className="resource-item">
							<div className="resource-header">
								<span className="label">Energy</span>
								<span className="value">{userData.energy.current}/{userData.energy.maximum}</span>
							</div>
							<div className="progress-bar">
								<div 
									className="progress" 
									style={{ width: `${(userData.energy.current / userData.energy.maximum) * 100}%` }}
								/>
							</div>
							<div className="resource-details">
								<span>Full in: {calculateTimeUntilFull(
									userData.energy.current,
									userData.energy.maximum,
									userData.energy.increment,
									userData.energy.interval
								)}</span>
							</div>
						</div>

						<div className="resource-item">
							<div className="resource-header">
								<span className="label">Nerve</span>
								<span className="value">{userData.nerve.current}/{userData.nerve.maximum}</span>
							</div>
							<div className="progress-bar">
								<div 
									className="progress" 
									style={{ width: `${(userData.nerve.current / userData.nerve.maximum) * 100}%` }}
								/>
							</div>
							<div className="resource-details">
								<span>Full in: {calculateTimeUntilFull(
									userData.nerve.current,
									userData.nerve.maximum,
									userData.nerve.increment,
									userData.nerve.interval
								)}</span>
							</div>
						</div>

						<div className="resource-item">
							<div className="resource-header">
								<span className="label">Happy</span>
								<span className="value">{userData.happy.current}/{userData.happy.maximum}</span>
							</div>
							<div className="progress-bar">
								<div 
									className="progress" 
									style={{ width: `${(userData.happy.current / userData.happy.maximum) * 100}%` }}
								/>
							</div>
							<div className="resource-details">
								<span>Full in: {calculateTimeUntilFull(
									userData.happy.current,
									userData.happy.maximum,
									userData.happy.increment,
									userData.happy.interval
								)}</span>
							</div>
						</div>

						<div className="resource-item">
							<div className="resource-header">
								<span className="label">Life</span>
								<span className="value">{userData.life.current}/{userData.life.maximum}</span>
							</div>
							<div className="progress-bar">
								<div 
									className="progress" 
									style={{ width: `${(userData.life.current / userData.life.maximum) * 100}%` }}
								/>
							</div>
							<div className="resource-details">
								<span>Full in: {calculateTimeUntilFull(
									userData.life.current,
									userData.life.maximum,
									userData.life.increment,
									userData.life.interval
								)}</span>
							</div>
						</div>
					</div>
				</div>

				<div className="account-card stats">
					<h3>Stats</h3>
					<div className="stats-grid">
						<div className="stat-item">
							<span className="label">Strength</span>
							<span className="value">{userData.stats.strength.toLocaleString()}</span>
						</div>
						<div className="stat-item">
							<span className="label">Defense</span>
							<span className="value">{userData.stats.defense.toLocaleString()}</span>
						</div>
						<div className="stat-item">
							<span className="label">Speed</span>
							<span className="value">{userData.stats.speed.toLocaleString()}</span>
						</div>
						<div className="stat-item">
							<span className="label">Dexterity</span>
							<span className="value">{userData.stats.dexterity.toLocaleString()}</span>
						</div>
						<div className="stat-item total">
							<span className="label">Total</span>
							<span className="value">{userData.stats.total.toLocaleString()}</span>
						</div>
					</div>
				</div>

				<div className="account-card finances">
					<h3>Finances</h3>
					<div className="finance-grid">
						<div className="finance-item">
							<span className="label">Money</span>
							<span className="value">{formatMoney(userData.money)}</span>
						</div>
						<div className="finance-item">
							<span className="label">Bank</span>
							<span className="value">{formatMoney(userData.bank)}</span>
						</div>
						<div className="finance-item">
							<span className="label">Points</span>
							<span className="value">{userData.points}</span>
						</div>
						<div className="finance-item">
							<span className="label">Networth</span>
							<span className="value">{formatMoney(userData.networth)}</span>
						</div>
					</div>
				</div>

				<div className="account-card social">
					<h3>Social</h3>
					<div className="social-grid">
						<div className="social-item">
							<span className="label">Faction</span>
							<span className="value">{userData.faction.faction_name}</span>
							<span className="sub-value">{userData.faction.position}</span>
						</div>
						<div className="social-item">
							<span className="label">Job</span>
							<span className="value">{userData.job.company_name}</span>
							<span className="sub-value">{userData.job.position}</span>
						</div>
						<div className="social-item">
							<span className="label">Education</span>
							<span className="value">{userData.education.current}</span>
							{userData.education.time_left > 0 && (
								<span className="sub-value">
									{Math.floor(userData.education.time_left / 60)}m {userData.education.time_left % 60}s left
								</span>
							)}
						</div>
					</div>
				</div>

				<div className="account-card achievements">
					<h3>Achievements</h3>
					<div className="achievement-grid">
						<div className="achievement-item">
							<span className="label">Merits</span>
							<span className="value">{userData.merits}</span>
						</div>
						<div className="achievement-item">
							<span className="label">Awards</span>
							<span className="value">{userData.awards}</span>
						</div>
						<div className="achievement-item">
							<span className="label">Friends</span>
							<span className="value">{userData.friends}</span>
						</div>
						<div className="achievement-item">
							<span className="label">Enemies</span>
							<span className="value">{userData.enemies}</span>
						</div>
						<div className="achievement-item">
							<span className="label">Forum Posts</span>
							<span className="value">{userData.forum_posts}</span>
						</div>
						<div className="achievement-item">
							<span className="label">Karma</span>
							<span className="value">{userData.karma}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TornAccount;
