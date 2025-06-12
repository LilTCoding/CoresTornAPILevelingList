import React, { useEffect, useState } from "react";

interface TornUserData {
    name: string;
    level: number;
    rank: string;
    faction: {
        position: string;
        faction_name: string;
    };
    status: {
        state: string;
        until: number;
        description?: string;
    };
    last_action: {
        status: string;
        timestamp: number;
    };
    money: number;
    points: number;
    networth: number;
    strength: number;
    defense: number;
    speed: number;
    dexterity: number;
    total: number;
    energy: number;
    nerve: number;
    happy: number;
    life: {
        current: number;
        maximum: number;
    };
    travel: {
        destination: string;
        timestamp: number;
    };
    job: {
        position: string;
        company_name: string;
    };
    education: {
        current: number;
        timeleft: number;
        completed: string[];
    };
    merits: number;
    awards: number;
    friends: number;
    enemies: number;
    forum_posts: number;
    karma: number;
    age: number;
    gender: string;
    role: string;
    donator: boolean;
    player_id: number;
    property: string;
    signup: string;
    awards_hidden: number;
    last_action_status: string;
    last_action_timestamp: number;
    life_current: number;
    life_maximum: number;
    status_state: string;
    status_until: number;
    status_description: string;
    job_position: string;
    job_company_name: string;
    faction_position: string;
    faction_faction_name: string;
    travel_destination: string;
    travel_timestamp: number;
    education_current: number;
    education_timeleft: number;
    education_completed: string[];
}

const TornAccount: React.FC = () => {
    const [userData, setUserData] = useState<TornUserData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const API_KEY = "ogcHDmImSiJGc2rZ";

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://api.torn.com/user/?selections=profile,basic,education,workstats,personalstats&key=${API_KEY}`
            );
            const data = await response.json();

            if (data.error) {
                setError(data.error.message);
                return;
            }

            setUserData(data);
        } catch (err) {
            setError("Failed to fetch user data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
        const interval = setInterval(fetchUserData, 5 * 60 * 1000); // Update every 5 minutes
        return () => clearInterval(interval);
    }, []);

    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat().format(num);
    };

    const formatTime = (timestamp: number): string => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    if (loading) {
        return <div className="torn-account loading">Loading account data...</div>;
    }

    if (error) {
        return <div className="torn-account error">Error: {error}</div>;
    }

    if (!userData) {
        return <div className="torn-account error">No data available</div>;
    }

    return (
        <div className="torn-account">
            <h2>My Torn Account</h2>
            <div className="account-grid">
                <div className="account-card basic-info">
                    <h3>Basic Information</h3>
                    <div className="info-row">
                        <span>Name:</span>
                        <span>{userData.name}</span>
                    </div>
                    <div className="info-row">
                        <span>Level:</span>
                        <span>{userData.level}</span>
                    </div>
                    <div className="info-row">
                        <span>Rank:</span>
                        <span>{userData.rank}</span>
                    </div>
                    <div className="info-row">
                        <span>Age:</span>
                        <span>{userData.age} days</span>
                    </div>
                    <div className="info-row">
                        <span>Gender:</span>
                        <span>{userData.gender}</span>
                    </div>
                </div>

                <div className="account-card stats">
                    <h3>Stats</h3>
                    <div className="info-row">
                        <span>Strength:</span>
                        <span>{formatNumber(userData.strength)}</span>
                    </div>
                    <div className="info-row">
                        <span>Defense:</span>
                        <span>{formatNumber(userData.defense)}</span>
                    </div>
                    <div className="info-row">
                        <span>Speed:</span>
                        <span>{formatNumber(userData.speed)}</span>
                    </div>
                    <div className="info-row">
                        <span>Dexterity:</span>
                        <span>{formatNumber(userData.dexterity)}</span>
                    </div>
                    <div className="info-row total">
                        <span>Total:</span>
                        <span>{formatNumber(userData.total)}</span>
                    </div>
                </div>

                <div className="account-card resources">
                    <h3>Resources</h3>
                    <div className="info-row">
                        <span>Money:</span>
                        <span>${formatNumber(userData.money)}</span>
                    </div>
                    <div className="info-row">
                        <span>Points:</span>
                        <span>{formatNumber(userData.points)}</span>
                    </div>
                    <div className="info-row">
                        <span>Networth:</span>
                        <span>${formatNumber(userData.networth)}</span>
                    </div>
                    <div className="info-row">
                        <span>Energy:</span>
                        <span>{userData.energy}</span>
                    </div>
                    <div className="info-row">
                        <span>Nerve:</span>
                        <span>{userData.nerve}</span>
                    </div>
                    <div className="info-row">
                        <span>Happy:</span>
                        <span>{userData.happy}</span>
                    </div>
                    <div className="info-row">
                        <span>Life:</span>
                        <span>{userData.life.current}/{userData.life.maximum}</span>
                    </div>
                </div>

                <div className="account-card status">
                    <h3>Status</h3>
                    <div className="info-row">
                        <span>State:</span>
                        <span>{userData.status.state}</span>
                    </div>
                    {userData.status.description && (
                        <div className="info-row">
                            <span>Reason:</span>
                            <span>{userData.status.description}</span>
                        </div>
                    )}
                    {userData.status.until > 0 && (
                        <div className="info-row">
                            <span>Until:</span>
                            <span>{formatTime(userData.status.until)}</span>
                        </div>
                    )}
                    {userData.travel && (
                        <div className="info-row">
                            <span>Traveling to:</span>
                            <span>{userData.travel.destination}</span>
                        </div>
                    )}
                </div>

                <div className="account-card faction">
                    <h3>Faction</h3>
                    {userData.faction ? (
                        <>
                            <div className="info-row">
                                <span>Name:</span>
                                <span>{userData.faction.faction_name}</span>
                            </div>
                            <div className="info-row">
                                <span>Position:</span>
                                <span>{userData.faction.position}</span>
                            </div>
                        </>
                    ) : (
                        <div className="info-row">No faction</div>
                    )}
                </div>

                <div className="account-card job">
                    <h3>Job</h3>
                    {userData.job ? (
                        <>
                            <div className="info-row">
                                <span>Company:</span>
                                <span>{userData.job.company_name}</span>
                            </div>
                            <div className="info-row">
                                <span>Position:</span>
                                <span>{userData.job.position}</span>
                            </div>
                        </>
                    ) : (
                        <div className="info-row">No job</div>
                    )}
                </div>

                <div className="account-card education">
                    <h3>Education</h3>
                    {userData.education.current > 0 ? (
                        <>
                            <div className="info-row">
                                <span>Current Course:</span>
                                <span>{userData.education.current}</span>
                            </div>
                            <div className="info-row">
                                <span>Time Left:</span>
                                <span>{userData.education.timeleft} minutes</span>
                            </div>
                        </>
                    ) : (
                        <div className="info-row">No active course</div>
                    )}
                    {userData.education.completed.length > 0 && (
                        <div className="info-row">
                            <span>Completed:</span>
                            <span>{userData.education.completed.join(", ")}</span>
                        </div>
                    )}
                </div>

                <div className="account-card achievements">
                    <h3>Achievements</h3>
                    <div className="info-row">
                        <span>Merits:</span>
                        <span>{userData.merits}</span>
                    </div>
                    <div className="info-row">
                        <span>Awards:</span>
                        <span>{userData.awards}</span>
                    </div>
                    <div className="info-row">
                        <span>Karma:</span>
                        <span>{userData.karma}</span>
                    </div>
                </div>

                <div className="account-card social">
                    <h3>Social</h3>
                    <div className="info-row">
                        <span>Friends:</span>
                        <span>{userData.friends}</span>
                    </div>
                    <div className="info-row">
                        <span>Enemies:</span>
                        <span>{userData.enemies}</span>
                    </div>
                    <div className="info-row">
                        <span>Forum Posts:</span>
                        <span>{userData.forum_posts}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TornAccount; 