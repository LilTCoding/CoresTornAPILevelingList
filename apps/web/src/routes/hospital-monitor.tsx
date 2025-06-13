import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { toast } from 'sonner'
import './hospital-monitor.css'

interface HospitalizedPlayer {
	id: string
	name: string
	level: number
	status: string
	timeLeft: number
	xid: string
	hospital_reason?: string
	faction?: {
		position: string
		faction_name: string
	}
}

export function HospitalMonitor() {
	const { apiKey, xids } = useStore()
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

			const promises = xids.map(async (xid: string) => {
				try {
					const response = await fetch(
						`https://api.torn.com/user/${xid}?selections=profile,basic&key=${apiKey}`
					)
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const data = await response.json()

			if (data.error) {
						throw new Error(data.error.message)
			}

					if (data.status?.state === 'hospital') {
						return {
							id: xid,
							name: data.name || 'Unknown',
							level: data.level || 0,
							status: data.status.state,
							timeLeft: data.status.until - Math.floor(Date.now() / 1000),
							xid: xid,
							hospital_reason: data.status.description,
							faction: data.faction
						}
					}
					return null
				} catch (err) {
					console.error(`Error fetching data for XID ${xid}:`, err)
					return null
				}
			})

			const results = await Promise.all(promises)
			const hospitalized = results.filter((player: HospitalizedPlayer | null): player is HospitalizedPlayer => 
				player !== null && 
					typeof player === 'object' && 
				'id' in player && 
				'name' in player && 
				'level' in player && 
				'status' in player && 
				'timeLeft' in player && 
				'xid' in player
			)

			setHospitalizedPlayers(hospitalized)
			setLastUpdate(new Date())
			toast.success('Hospital status updated')
		} catch (err) {
			console.error('Error fetching hospital status:', err)
			setError(err instanceof Error ? err.message : 'Failed to fetch hospital status')
			toast.error('Failed to fetch hospital status')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (apiKey) {
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
		}
	}, [apiKey, autoUpdate, xids])

	const formatTimeLeft = (seconds: number) => {
		if (seconds <= 0) return 'Released'
		
		const hours = Math.floor(seconds / 3600)
		const minutes = Math.floor((seconds % 3600) / 60)
		const remainingSeconds = seconds % 60

		return `${hours}h ${minutes}m ${remainingSeconds}s`
	}

	if (!apiKey) {
		return (
			<div className="hospital-monitor">
				<div className="error">
					Please set your API key in the settings to use the Hospital Monitor
				</div>
			</div>
		)
	}

	if (loading && !hospitalizedPlayers.length) {
		return (
			<div className="hospital-monitor">
				<div className="loading">Loading hospital status...</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="hospital-monitor">
				<div className="error">Error: {error}</div>
			</div>
		)
	}

	return (
		<div className="hospital-monitor">
			<div className="monitor-header">
				<h2>Hospital Monitor</h2>
				<div className="monitor-controls">
					<button 
						onClick={fetchHospitalStatus} 
						disabled={loading}
						className="refresh-button"
					>
						{loading ? 'Updating...' : 'Refresh'}
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
						<span className="last-update">
							Last updated: {lastUpdate.toLocaleTimeString()}
						</span>
					)}
				</div>
			</div>

			{hospitalizedPlayers.length === 0 ? (
				<div className="no-patients">No players currently hospitalized</div>
			) : (
				<div className="hospital-list">
				{hospitalizedPlayers.map((player) => (
					<div key={player.id} className="hospital-card">
						<div className="player-info">
							<h3>{player.name}</h3>
							<span className="level">Level {player.level}</span>
						</div>
						
							<div className="hospital-details">
								{player.hospital_reason && (
									<div className="reason">
										<strong>Reason:</strong> {player.hospital_reason}
									</div>
								)}
							<div className="time-left">
									<strong>Time Left:</strong> {formatTimeLeft(player.timeLeft)}
								</div>
								{player.faction && (
									<div className="faction-info">
										<strong>{player.faction.faction_name}</strong>
										<br />
										{player.faction.position}
							</div>
								)}
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
			)}
		</div>
	)
}

export const Route = createFileRoute('/hospital-monitor')({
	component: HospitalMonitor
})
