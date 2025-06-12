import { useEffect, useState } from "react";
import { useStore } from "../store";

const NotificationPanel = () => {
	const { statuses } = useStore();
	const [notifications, setNotifications] = useState<string[]>([]);

	useEffect(() => {
		const newNotifications = statuses
			.filter((s) => s.status === "Okay" && !s.error)
			.map(
				(s) => `User ${s.xid} (${s.name}) is out of hospital and attackable!`,
			);
		setNotifications((prev) =>
			[...new Set([...prev, ...newNotifications])].slice(-5),
		);
	}, [statuses]);

	return (
		<div className="rounded-lg bg-gray-800 p-4 shadow-lg">
			<h2 className="mb-4 font-bold text-2xl text-cyan-400">Notifications</h2>
			{notifications.length === 0 ? (
				<p>No new notifications.</p>
			) : (
				<ul className="space-y-2">
					{notifications.map((note, index) => (
						<li
							key={`notification-${index}-${note.substring(0, 10)}`}
							className="rounded-md bg-gray-700 p-2"
						>
							{note}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default NotificationPanel;
