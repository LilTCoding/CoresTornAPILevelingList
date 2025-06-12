import { useEffect, useState } from "react";
import { useStore } from "../store";

interface NotificationPanelProps {
	notifications: string[];
	onClear: () => void;
}

export default function NotificationPanel({
	notifications,
	onClear,
}: NotificationPanelProps) {
	if (notifications.length === 0) return null;

	return (
		<div className="fixed right-4 bottom-4 max-w-md rounded-lg bg-gray-800 p-4 shadow-lg">
			<div className="mb-2 flex items-center justify-between">
				<h3 className="font-semibold text-lg">Notifications</h3>
				<button
					type="button"
					onClick={onClear}
					className="text-gray-400 text-sm hover:text-white"
				>
					Clear All
				</button>
			</div>
			<div className="max-h-60 overflow-y-auto">
				{notifications.map((notification, index) => (
					<div
						key={`notification-${index}-${notification.substring(0, 10)}`}
						className="mb-2 rounded bg-gray-700 p-2 text-sm text-white"
					>
						{notification}
					</div>
				))}
			</div>
		</div>
	);
}
