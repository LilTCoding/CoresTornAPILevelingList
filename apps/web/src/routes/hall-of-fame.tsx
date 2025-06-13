import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import './hall-of-fame.css'

interface HallOfFamePlayer {
  id: string
  name: string
  level: number
  rank: number
  xid: string
}

export function HallOfFame() {
  const { apiKey } = useStore()
  const [players, setPlayers] = useState<HallOfFamePlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [currentPage, setCurrentPage] = useState(525850)
  const [totalPages, setTotalPages] = useState(688880)
  const [loadingAll, setLoadingAll] = useState(false)

  const fetchHallOfFamePlayers = async (page: number) => {
    if (!apiKey) {
      setError('API key is required')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`https://api.torn.com/halloffame/?selections=ranked&key=${apiKey}&page=${page}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON')
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid data format received from server')
      }

      const newPlayers = Object.entries(data)
        .filter(([_, player]: [string, any]) => 
          player && 
          typeof player === 'object'
        )
        .map(([id, player]: [string, any]) => ({
          id,
          name: player.name || 'Unknown',
          level: player.level || 0,
          rank: player.rank || 0,
          xid: player.player_id || id
        }))

      setPlayers(prevPlayers => [...prevPlayers, ...newPlayers])
      setLastUpdate(new Date())
      setCurrentPage(prev => prev + 1)
    } catch (err) {
      console.error('Error fetching Hall of Fame players:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch Hall of Fame players')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentPage <= totalPages) {
      fetchHallOfFamePlayers(currentPage)
    }
  }, [currentPage, apiKey])

  const handleLoadMore = () => {
    if (currentPage <= totalPages) {
      fetchHallOfFamePlayers(currentPage)
    }
  }

  const handleLoadAll = async () => {
    if (!apiKey) return
    setLoadingAll(true)
    let page = currentPage
    try {
      while (page <= totalPages) {
        await fetchHallOfFamePlayers(page)
        page++
      }
    } catch (err) {
      setError('Error loading all pages')
    } finally {
      setLoadingAll(false)
    }
  }

  if (loading && !players.length) {
    return <div className="loading">Loading Hall of Fame players...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  return (
    <div className="hall-of-fame">
      <div className="monitor-header">
        <h2>Hall of Fame Players</h2>
        <div className="monitor-controls">
          <button onClick={handleLoadMore} disabled={loading || currentPage > totalPages}>
            {loading ? 'Loading...' : currentPage > totalPages ? 'All Pages Loaded' : 'Load More'}
          </button>
          <button onClick={handleLoadAll} disabled={loadingAll || currentPage > totalPages} style={{ marginLeft: 8 }}>
            {loadingAll ? 'Loading All...' : 'Load All'}
          </button>
          {lastUpdate && (
            <span className="last-update">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="players-grid">
        {players.map((player) => (
          <div key={player.id} className="player-card">
            <div className="player-info">
              <h3>{player.name}</h3>
              <span className="level">Level {player.level}</span>
              <span className="rank">Rank #{player.rank}</span>
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

export const Route = createFileRoute('/hall-of-fame')() 