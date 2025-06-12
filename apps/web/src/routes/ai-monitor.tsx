import { useCallback, useEffect, useState } from "react";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import ApiKeyForm from "../components/ApiKeyForm";
import NotificationPanel from "../components/NotificationPanel";
import StatusDisplay from "../components/StatusDisplay";
import XidForm from "../components/XidForm";
import { useStore } from "../store";
import { createFileRoute } from "@tanstack/react-router";

interface UserStatus {
	xid: number;
	name?: string;
	status?: {
		state: string;
		until: number;
	};
	error?: string;
}

function AIMonitor() {
	const { apiKey, xids, setStatuses, setLoading, setApiKey, setXids } = useStore();
	const [statuses, setStatusesState] = useState<UserStatus[]>([]);
	const [notifications, setNotifications] = useState<string[]>([]);

	useEffect(() => {
		const savedApiKey = localStorage.getItem("tornApiKey");
		const savedXids = localStorage.getItem("aiXids");
		if (savedApiKey) setApiKey(savedApiKey);
		if (savedXids) setXids(JSON.parse(savedXids));
	}, [setApiKey, setXids]);

	const saveToLocalStorage = () => {
		localStorage.setItem("tornApiKey", apiKey);
		localStorage.setItem("aiXids", JSON.stringify(xids));
	};

	const fetchStatuses = useCallback(async () => {
		if (!apiKey || xids.length === 0) return;
		setLoading(true);
		try {
			const results = await Promise.all(
				xids.map(async (xid: string) => {
					try {
						const response = await fetch(
							`https://api.torn.com/user/${xid}?selections=profile&key=${apiKey}`,
						);
						const data = await response.json();
						if (data.error) {
							return { xid: Number.parseInt(xid), error: data.error.message };
						}
						return {
							xid: Number.parseInt(xid),
							name: data.name,
							status: data.status,
						};
					} catch (err) {
						return { xid: Number.parseInt(xid), error: "Fetch error" };
					}
				}),
			);
			setStatusesState(results);

			// Check for status changes
			for (const status of results) {
				if (status.status?.state === "hospital") {
					const notification = `${status.name} is in hospital until ${new Date(
						status.status.until * 1000,
					).toLocaleString()}`;
					if (!notifications.includes(notification)) {
						setNotifications((prev) => [...prev, notification]);
					}
				}
			}
		} catch (err) {
			console.error("Error fetching statuses:", err);
		} finally {
			setLoading(false);
		}
	}, [apiKey, xids, notifications, setLoading]);

	useEffect(() => {
		if (apiKey && xids.length > 0) {
			fetchStatuses();
			const interval = setInterval(fetchStatuses, 5 * 60 * 1000); // Every 5 minutes
			return () => clearInterval(interval);
		}
	}, [apiKey, xids, fetchStatuses]);

	return (
		<div className="min-h-screen bg-gray-900 p-6 text-white">
			<h1 className="mb-6 font-bold text-4xl text-cyan-400">
				Torn City AI Monitor
			</h1>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<div className="md:col-span-1">
					<ApiKeyForm apiKey={apiKey} onApiKeyChange={setApiKey} />
					<XidForm xids={xids} onXidsChange={setXids} />
					<NotificationPanel notifications={notifications} onClear={() => setNotifications([])} />
				</div>
				<div className="md:col-span-2">
					<StatusDisplay />
					<AnalyticsDashboard />
				</div>
			</div>
		</div>
	);
}

export const Route = createFileRoute('/ai-monitor')({
	component: AIMonitor,
});
