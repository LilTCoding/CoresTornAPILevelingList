import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import './ai-monitor.css'
import { toast } from 'sonner'

interface AIPlayer {
	id: string
	name: string
	level: number
	status: string
	timeLeft: number
	xid: string
}

export function AIMonitor() {
	const { apiKey } = useStore()
	const [aiPlayers, setAIPlayers] = useState<AIPlayer[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
	const [autoUpdate, setAutoUpdate] = useState(true)
	const [scanning, setScanning] = useState(false)
	const [scanProgress, setScanProgress] = useState(0)

	const fetchAIStatus = async () => {
		if (!apiKey) {
			setError('API key is required')
			setLoading(false)
			return
		}

		try {
			setLoading(true)
			setError(null)

			const response = await fetch(`https://api.torn.com/user/?selections=profile&key=${apiKey}`)
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const contentType = response.headers.get('content-type')
			if (!contentType || !contentType.includes('application/json')) {
				throw new Error('Server did not return JSON')
			}

			const data = await response.json()

			if (data.error) {
				throw new Error(data.error.message || data.error)
			}

			let players: AIPlayer[] = []
			if (data && typeof data === 'object' && data.player_id) {
				if (data.status?.state === 'Abroad') {
					players = [{
						id: String(data.player_id),
						name: data.name || 'Unknown',
						level: data.level || 0,
						status: data.status.state,
						timeLeft: data.status.until - Math.floor(Date.now() / 1000),
						xid: String(data.player_id)
					}]
				}
			} else if (data && typeof data === 'object') {
				players = Object.entries(data)
				.filter(([_, player]: [string, any]) => 
					player && 
					typeof player === 'object' && 
					player.status?.state === 'Abroad'
				)
				.map(([id, player]: [string, any]) => ({
					id,
					name: player.name || 'Unknown',
					level: player.level || 0,
					status: player.status.state,
					timeLeft: player.status.until - Math.floor(Date.now() / 1000),
					xid: player.player_id || id
				}))
			}

			setAIPlayers(players)
			setLastUpdate(new Date())
		} catch (err) {
			console.error('Error fetching AI status:', err)
			setError(err instanceof Error ? err.message : 'Failed to fetch AI status')
		} finally {
			setLoading(false)
		}
	}

	const scanHallOfFame = async () => {
		if (!apiKey) return
		setScanning(true)
		setScanProgress(0)
		setError(null)
		setAIPlayers([])
		const startPage = 525850
		const endPage = 688880
		let allPlayers: any[] = []
		let totalPages = endPage - startPage + 1
		try {
			for (let page = startPage; page <= endPage; page++) {
				const response = await fetch(`https://api.torn.com/halloffame/?selections=ranked&key=${apiKey}&page=${page}`)
				const data = await response.json()
				if (data.error) continue
				const pagePlayers = Object.entries(data)
					.filter(([_, player]: [string, any]) => player && typeof player === 'object' && [4,5,6].includes(player.level))
					.map(([id, player]: [string, any]) => ({
						id,
						name: player.name || 'Unknown',
						level: player.level || 0,
						xid: player.player_id || id
					}))
				allPlayers = allPlayers.concat(pagePlayers)
				setScanProgress(Math.round(((page - startPage + 1) / totalPages) * 100))
				// To avoid rate limits, pause every 10 pages
				if ((page - startPage + 1) % 10 === 0) await new Promise(res => setTimeout(res, 1000))
			}
			// Now fetch live status for each player (batch in 10s)
			let aiResults: AIPlayer[] = []
			for (let i = 0; i < allPlayers.length; i += 10) {
				const batch = allPlayers.slice(i, i + 10)
				const statuses = await Promise.all(batch.map(async player => {
					try {
						const resp = await fetch(`https://api.torn.com/user/${player.xid}?selections=profile&key=${apiKey}`)
						const d = await resp.json()
						return {
							...player,
							status: d.status?.state || 'Unknown',
							timeLeft: d.status?.until ? d.status.until - Math.floor(Date.now() / 1000) : 0,
							xid: player.xid
						}
					} catch {
						return { ...player, status: 'Unknown', timeLeft: 0, xid: player.xid }
					}
				}))
				aiResults = aiResults.concat(statuses)
				setAIPlayers([...aiResults])
				setScanProgress(100)
				await new Promise(res => setTimeout(res, 500))
			}
			setLastUpdate(new Date())
			// After scan, add all unique XIDs to Leveling List
			const newXids = aiResults.map(p => Number(p.xid)).filter(xid => !isNaN(xid))
			const existing = JSON.parse(localStorage.getItem('torn-leveling-xids') || '[]')
			const merged = Array.from(new Set([...existing, ...newXids]))
			const addedCount = merged.length - existing.length
			localStorage.setItem('torn-leveling-xids', JSON.stringify(merged))
			if (addedCount > 0) toast.success(`AI added ${addedCount} new low-level players to the Leveling List!`)
			else toast.info('No new low-level players to add.')
		} catch (err) {
			setError('Error scanning Hall of Fame')
		} finally {
			setScanning(false)
			setScanProgress(0)
		}
	}

	useEffect(() => {
		fetchAIStatus()

		let intervalId: number | undefined
		if (autoUpdate) {
			intervalId = window.setInterval(fetchAIStatus, 30000) // Update every 30 seconds
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId)
			}
		}
	}, [apiKey, autoUpdate])

	const formatTimeLeft = (seconds: number) => {
		if (seconds <= 0) return 'Returned'
		
		const hours = Math.floor(seconds / 3600)
		const minutes = Math.floor((seconds % 3600) / 60)
		const remainingSeconds = seconds % 60

		return `${hours}h ${minutes}m ${remainingSeconds}s`
	}

	if (loading && !aiPlayers.length) {
		return <div className="loading">Loading AI status...</div>
	}

	if (error) {
		return <div className="error">Error: {error}</div>
	}

	if (!aiPlayers.length && !loading && !error) {
		return <div className="no-data">No players currently abroad or no data available.</div>
	}

	return (
		<div className="ai-monitor">
			<div className="monitor-header">
				<h2>AI Monitor</h2>
				<div className="monitor-controls">
					<button onClick={fetchAIStatus} disabled={loading}>
						{loading ? 'Updating...' : 'Refresh'}
					</button>
					<button onClick={scanHallOfFame} disabled={scanning || loading} style={{ background: '#e67e22' }}>
						{scanning ? `Scanning... (${scanProgress}%)` : 'Scan Hall of Fame'}
					</button>
					<button onClick={() => {
						const newXids = aiPlayers.map(p => Number(p.xid)).filter(xid => !isNaN(xid))
						const existing = JSON.parse(localStorage.getItem('torn-leveling-xids') || '[]')
						const merged = Array.from(new Set([...existing, ...newXids]))
						const addedCount = merged.length - existing.length
						localStorage.setItem('torn-leveling-xids', JSON.stringify(merged))
						if (addedCount > 0) toast.success(`Manually added ${addedCount} players to Leveling List!`)
						else toast.info('No new players to add.')
					}} disabled={aiPlayers.length === 0} style={{ background: '#00ff9d', color: '#181818', marginLeft: 8 }}>
						Add All to Leveling List
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

			<div className="ai-grid">
				{aiPlayers.map((player) => (
					<div key={player.id} className="ai-card">
						<div className="player-info">
							<h3>{player.name}</h3>
							<span className="level">Level {player.level}</span>
							<span className={player.status === 'hospital' ? 'hospital-status led-green' : 'hospital-status chrome-red'}>
								{player.status === 'hospital' ? 'In Hospital' : 'Not in Hospital'}
							</span>
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
							{player.status !== 'hospital' && player.status !== 'traveling' && player.status !== 'federal' && (
								<a 
									href={`https://www.torn.com/loader.php?sid=attack&user2ID=${player.xid}`}
									target="_blank"
									rel="noopener noreferrer"
									className="action-button message-button"
								>
									Attack
								</a>
							)}
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

export const Route = createFileRoute('/ai-monitor')()
