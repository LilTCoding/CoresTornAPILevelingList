import { useEffect, useState } from "react";
import { toast } from "sonner";
import "./NotificationBubble.css";

interface NotificationBubbleProps {
    message: string;
    type?: "success" | "error" | "info" | "warning";
    duration?: number;
    onClose?: () => void;
}

export default function NotificationBubble({
    message,
    type = "info",
    duration = 5000,
    onClose
}: NotificationBubbleProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    useEffect(() => {
        switch (type) {
            case "success":
                toast.success(message);
                break;
            case "error":
                toast.error(message);
                break;
            case "warning":
                toast.warning(message);
                break;
            default:
                toast(message);
        }
    }, [message, type]);

    if (!isVisible) return null;

    return (
        <div className={`notification-bubble ${type}`}>
            <div className="notification-content">
                <span className="notification-message">{message}</span>
                <button 
                    className="notification-close"
                    onClick={() => {
                        setIsVisible(false);
                        onClose?.();
                    }}
                >
                    ×
                </button>
            </div>
        </div>
    );
} 