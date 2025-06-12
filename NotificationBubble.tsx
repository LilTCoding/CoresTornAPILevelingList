import React, { useEffect, useState } from "react";

interface Notification {
    id: number;
    type: "tron" | "deadpool";
    message: string;
    timestamp: number;
}

interface TornUserData {
    status: {
        state: string;
        until: number;
        description?: string;
    };
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
    last_action: {
        status: string;
        timestamp: number;
    };
}

const NotificationBubble: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [previousData, setPreviousData] = useState<TornUserData | null>(null);
    const API_KEY = "ogcHDmImSiJGc2rZ";

    const fetchUserData = async () => {
        try {
            const response = await fetch(
                `https://api.torn.com/user/?selections=profile,basic&key=${API_KEY}`
            );
            const data = await response.json();

            if (data.error) {
                return;
            }

            if (previousData) {
                // Check for status changes
                if (data.status.state !== previousData.status.state) {
                    addNotification(
                        "tron",
                        `Status changed to: ${data.status.state}`
                    );
                }

                // Check for energy changes
                if (data.energy > previousData.energy) {
                    addNotification(
                        "tron",
                        `Energy increased to ${data.energy}`
                    );
                }

                // Check for nerve changes
                if (data.nerve > previousData.nerve) {
                    addNotification(
                        "tron",
                        `Nerve increased to ${data.nerve}`
                    );
                }

                // Check for happy changes
                if (data.happy > previousData.happy) {
                    addNotification(
                        "tron",
                        `Happy increased to ${data.happy}`
                    );
                }

                // Check for life changes
                if (data.life.current > previousData.life.current) {
                    addNotification(
                        "tron",
                        `Life increased to ${data.life.current}/${data.life.maximum}`
                    );
                }

                // Check for travel changes
                if (data.travel && !previousData.travel) {
                    addNotification(
                        "deadpool",
                        `Traveling to ${data.travel.destination}`
                    );
                }

                // Check for last action changes
                if (data.last_action.timestamp > previousData.last_action.timestamp) {
                    addNotification(
                        "deadpool",
                        `New action: ${data.last_action.status}`
                    );
                }
            }

            setPreviousData(data);
        } catch (err) {
            console.error("Error fetching user data:", err);
        }
    };

    const addNotification = (type: "tron" | "deadpool", message: string) => {
        const newNotification: Notification = {
            id: Date.now(),
            type,
            message,
            timestamp: Date.now(),
        };

        setNotifications((prev) => [newNotification, ...prev].slice(0, 10));
    };

    useEffect(() => {
        fetchUserData();
        const interval = setInterval(fetchUserData, 30 * 1000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const formatTime = (timestamp: number): string => {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);

        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    return (
        <div className={`notification-bubble ${isExpanded ? "expanded" : ""}`}>
            <div className="notification-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="notification-icon">
                    <div className="tron-circle"></div>
                    <div className="deadpool-circle"></div>
                </div>
                <span className="notification-count">{notifications.length}</span>
            </div>
            <div className="notification-content">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`notification-item ${notification.type}`}
                    >
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">
                            {formatTime(notification.timestamp)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationBubble; 