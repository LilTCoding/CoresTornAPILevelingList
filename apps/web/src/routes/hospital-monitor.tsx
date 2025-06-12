import { useCallback, useEffect, useState } from "react";
import ApiKeyForm from "../components/ApiKeyForm";
import NotificationPanel from "../components/NotificationPanel";
import XidForm from "../components/XidForm";
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

function HospitalMonitor() {
	const [apiKey, setApiKey] = useState<string>("");
	const [xids, setXids] = useState<string[]>([]);
	const [statuses, setStatuses] = useState<UserStatus[]>([]);
	const [loading, setLoading] = useState(false);
	const [notifications, setNotifications] = useState<string[]>([]);

	useEffect(() => {
		const savedApiKey = localStorage.getItem("tornApiKey");
		const savedXids = localStorage.getItem("hospitalXids");
		if (savedApiKey) setApiKey(savedApiKey);
		if (savedXids) setXids(JSON.parse(savedXids));
	}, []);

	const saveToLocalStorage = () => {
		localStorage.setItem("tornApiKey", apiKey);
		localStorage.setItem("hospitalXids", JSON.stringify(xids));
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
			setStatuses(results);

			// Check for hospital status changes
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
	}, [apiKey, xids, notifications]);

	useEffect(() => {
		if (apiKey && xids.length > 0) {
			fetchStatuses();
			const interval = setInterval(fetchStatuses, 5 * 60 * 1000); // Every 5 minutes
			return () => clearInterval(interval);
		}
	}, [apiKey, xids, fetchStatuses]);

	return (
		<div className="container mx-auto p-4">
			<div className="mb-4 rounded-lg bg-gray-800 p-4 shadow-lg">
				<ApiKeyForm apiKey={apiKey} onApiKeyChange={setApiKey} />
				<XidForm xids={xids} onXidsChange={setXids} />
				<div className="mt-4 flex gap-2">
					<button
						type="button"
						onClick={saveToLocalStorage}
						className="rounded bg-blue-500 px-4 py-2 font-semibold text-white"
					>
						Save
					</button>
					<button
						type="button"
						onClick={fetchStatuses}
						disabled={loading}
						className="rounded bg-green-500 px-4 py-2 font-semibold text-white disabled:opacity-50"
					>
						{loading ? "Loading..." : "Refresh"}
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{statuses.map((status) => (
					<div
						key={status.xid}
						className={`rounded-lg p-4 shadow-lg ${
							status.status?.state === "hospital"
								? "bg-red-500"
								: status.status?.state === "jail"
									? "bg-yellow-500"
									: "bg-green-500"
						}`}
					>
						<h3 className="mb-2 font-semibold text-lg">{status.name}</h3>
						<p>Status: {status.status?.state || "Unknown"}</p>
						{status.status?.until && (
							<p>
								Until: {new Date(status.status.until * 1000).toLocaleString()}
							</p>
						)}
						{status.error && <p className="text-red-500">{status.error}</p>}
					</div>
				))}
			</div>

			<NotificationPanel
				notifications={notifications}
				onClear={() => setNotifications([])}
			/>
		</div>
	);
}

export const Route = createFileRoute('/hospital-monitor')({
	component: HospitalMonitor,
});
