import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import './hospital-monitor.css'

interface HospitalizedPlayer {
	id: string
	name: string
	level: number
	status: string
	timeLeft: number
	xid: string
}

export function HospitalMonitor() {
	const { apiKey } = useStore()
	const [hospitalizedPlayers, setHospitalizedPlayers] = useState<HospitalizedPlayer[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
	const [autoUpdate, setAutoUpdate] = useState(true)

	const fetchHospitalStatus = async () => {
		if (!apiKey) {
			setError('API key is required')
			setLoading(false)
			return
		}

		try {
			setLoading(true)
			setError(null)

			const response = await fetch(`https://api.torn.com/user/?selections=profile&key=${apiKey}`)
			const data = await response.json()

			if (data.error) {
				throw new Error(data.error)
			}

			const players = Object.entries(data)
				.filter(([_, player]: [string, any]) => player.status?.state === 'Hospital')
				.map(([id, player]: [string, any]) => ({
					id,
					name: player.name,
					level: player.level,
					status: player.status.state,
					timeLeft: player.status.until - Math.floor(Date.now() / 1000),
					xid: player.player_id
				}))

			setHospitalizedPlayers(players)
			setLastUpdate(new Date())
		} catch (err) {
			console.error('Error fetching hospital status:', err)
			setError(err instanceof Error ? err.message : 'Failed to fetch hospital status')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchHospitalStatus()

		let intervalId: number | undefined
		if (autoUpdate) {
			intervalId = window.setInterval(fetchHospitalStatus, 30000) // Update every 30 seconds
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId)
			}
		}
	}, [apiKey, autoUpdate])

	const formatTimeLeft = (seconds: number) => {
		if (seconds <= 0) return 'Released'
		
		const hours = Math.floor(seconds / 3600)
		const minutes = Math.floor((seconds % 3600) / 60)
		const remainingSeconds = seconds % 60

		return `${hours}h ${minutes}m ${remainingSeconds}s`
	}

	if (loading && !hospitalizedPlayers.length) {
		return <div className="loading">Loading hospital status...</div>
	}

	if (error) {
		return <div className="error">Error: {error}</div>
	}

	if (!hospitalizedPlayers.length) {
		return <div className="no-data">No players currently hospitalized</div>
	}

	return (
		<div className="hospital-monitor">
			<div className="monitor-header">
				<h2>Hospital Monitor</h2>
				<div className="monitor-controls">
					<button onClick={fetchHospitalStatus} disabled={loading}>
						{loading ? 'Updating...' : 'Refresh'}
					</button>
					<label>
						<input
							type="checkbox"
							checked={autoUpdate}
							onChange={(e) => setAutoUpdate(e.target.checked)}
						/>
						Auto-update
					</label>
					{lastUpdate && (
						<span className="last-update">
							Last updated: {lastUpdate.toLocaleTimeString()}
						</span>
					)}
				</div>
			</div>

			<div className="hospital-grid">
				{hospitalizedPlayers.map((player) => (
					<div key={player.id} className="hospital-card">
						<div className="player-info">
							<h3>{player.name}</h3>
							<span className="level">Level {player.level}</span>
						</div>
						
						<div className="status-info">
							<div className="time-left">
								<span className="label">Time Left:</span>
								<span className="value">{formatTimeLeft(player.timeLeft)}</span>
							</div>
							<div className="progress-bar">
								<div 
									className="progress" 
									style={{ 
										width: `${Math.max(0, Math.min(100, (player.timeLeft / 3600) * 100))}%` 
									}}
								/>
							</div>
						</div>

						<div className="action-buttons">
							<a 
								href={`https://www.torn.com/profiles.php?XID=${player.xid}`}
								target="_blank"
								rel="noopener noreferrer"
								className="action-button profile-button"
							>
								Profile
							</a>
							<a 
								href={`https://www.torn.com/messages.php#/p=compose&XID=${player.xid}`}
								target="_blank"
								rel="noopener noreferrer"
								className="action-button message-button"
							>
								Message
							</a>
							<a 
								href={`https://www.torn.com/trade.php#step=start&userID=${player.xid}`}
								target="_blank"
								rel="noopener noreferrer"
								className="action-button trade-button"
							>
								Trade
							</a>
							<a 
								href={`https://www.torn.com/sendcash.php#/XID=${player.xid}`}
								target="_blank"
								rel="noopener noreferrer"
								className="action-button money-button"
							>
								Send Money
							</a>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export const Route = createFileRoute('/hospital-monitor')()
