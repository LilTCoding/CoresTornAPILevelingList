import React from "react";
import { useEffect, useState } from "react";

interface HospitalizedPlayer {
    xid: number;
    name: string;
    level: number;
    hospital_reason: string;
    hosp_out: number;
    faction?: {
        position: string;
        faction_name: string;
    };
}

interface HospitalMonitorProps {
    apiKey: string;
    xids: number[];
}

const HospitalMonitor: React.FC<HospitalMonitorProps> = ({ apiKey, xids }) => {
    const [hospitalizedPlayers, setHospitalizedPlayers] = useState<HospitalizedPlayer[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchHospitalStatus = async () => {
        setLoading(true);
        const promises = xids.map(async (xid) => {
            try {
                const response = await fetch(
                    `https://api.torn.com/user/${xid}?selections=basic,profile&key=${apiKey}`
                );
                const data = await response.json();
                
                if (data.error) {
                    return null;
                }

                if (data.status?.state === "hospital") {
                    return {
                        xid,
                        name: data.name || "Unknown",
                        level: data.level || 0,
                        hospital_reason: data.status.description || "Unknown reason",
                        hosp_out: data.status.until,
                        faction: data.faction
                    };
                }
                return null;
            } catch (err) {
                return null;
            }
        });

        const results = await Promise.all(promises);
        const hospitalized = results.filter((player): player is HospitalizedPlayer => player !== null);
        setHospitalizedPlayers(hospitalized);
        setLoading(false);
    };

    useEffect(() => {
        if (apiKey) {
            fetchHospitalStatus();
            const interval = setInterval(fetchHospitalStatus, 60 * 1000); // Update every minute
            return () => clearInterval(interval);
        }
    }, [apiKey]);

    const formatTime = (timestamp: number): string => {
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = timestamp - now;
        
        if (timeLeft <= 0) return "Released";
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        return `${minutes}m ${seconds}s`;
    };

    return (
        <div className="hospital-monitor">
            <h2>Hospital Monitor</h2>
            <div className="controls">
                <button onClick={fetchHospitalStatus} disabled={loading}>
                    {loading ? "Loading..." : "Refresh"}
                </button>
            </div>
            <div className="hospital-list">
                {hospitalizedPlayers.length === 0 ? (
                    <p>No players currently hospitalized</p>
                ) : (
                    hospitalizedPlayers.map((player) => (
                        <div key={player.xid} className="hospital-card">
                            <div className="player-info">
                                <h3>{player.name}</h3>
                                <span className="level">Level {player.level}</span>
                            </div>
                            <div className="hospital-details">
                                <div className="reason">
                                    <strong>Reason:</strong> {player.hospital_reason}
                                </div>
                                <div className="time-left">
                                    <strong>Time Left:</strong> {formatTime(player.hosp_out)}
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
                                >
                                    Profile
                                </a>
                                <a
                                    href={`https://www.torn.com/messages.php#/p=compose&XID=${player.xid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Message
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HospitalMonitor; 