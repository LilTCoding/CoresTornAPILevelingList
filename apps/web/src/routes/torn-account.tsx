import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/torn-account")({
	component: TornAccountComponent,
});

interface TornBars {
	energy: { current: number; maximum: number };
	nerve: { current: number; maximum: number };
	happy: { current: number; maximum: number };
	life: { current: number; maximum: number };
}

interface TornStat {
	[key: string]: number;
}

interface TornItem {
	ID: string;
	name: string;
	quantity: number;
	type: string;
}

interface TornCooldowns {
	[key: string]: number; // unix timestamp (seconds) or 0 if not active
}

interface TornApiResponse {
	name: string;
	level: number;
	bars: TornBars;
	stats: TornStat;
	inventory: TornItem[];
	cooldowns?: TornCooldowns;
}

function formatCooldownTime(unix: number) {
	if (!unix || unix < Date.now() / 1000) return "Ready";
	const seconds = unix - Math.floor(Date.now() / 1000);
	if (seconds <= 0) return "Ready";
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	return `${h}h ${m}m ${s}s`;
}

function TornAccountComponent() {
	const [data, setData] = useState<TornApiResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Hardcoded API key as requested
	const apiKey = "ogcHDmImSiJGc2rZ";

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(
					`https://api.torn.com/user/?selections=bars,profile,stats,inventory,cooldowns&key=${apiKey}`,
				);
				const json = await res.json();
				if (json.error) {
					setError(json.error.message);
					setLoading(false);
					return;
				}
				setData(json);
			} catch (e) {
				setError("Failed to fetch Torn API");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
		const interval = setInterval(fetchData, 5 * 60 * 1000); // refresh every 5 min
		return () => clearInterval(interval);
	}, []);

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">Loading...</div>
		);
	}
	if (error) {
		return <div className="py-8 text-center text-red-500">{error}</div>;
	}
	if (!data) return null;

	const { name, level, bars, stats, inventory, cooldowns } = data;

	return (
		<div className="mx-auto max-w-3xl space-y-8 py-8">
			<Card>
				<CardHeader>
					<CardTitle>
						Torn Account: {name} (Level {level})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<strong>Energy:</strong> {bars.energy.current} /{" "}
							{bars.energy.maximum}
						</div>
						<div>
							<strong>Nerve:</strong> {bars.nerve.current} /{" "}
							{bars.nerve.maximum}
						</div>
						<div>
							<strong>Happy:</strong> {bars.happy.current} /{" "}
							{bars.happy.maximum}
						</div>
						<div>
							<strong>Life:</strong> {bars.life.current} / {bars.life.maximum}
						</div>
					</div>
				</CardContent>
			</Card>
			{cooldowns && (
				<Card>
					<CardHeader>
						<CardTitle>Cooldowns</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead>
									<tr>
										<th className="pr-4 text-left">Type</th>
										<th className="text-left">Time Remaining</th>
									</tr>
								</thead>
								<tbody>
									{Object.entries(cooldowns).map(([key, value]) => (
										<tr key={key}>
											<td className="pr-4 font-medium">
												{key.replace(/_/g, " ")}
											</td>
											<td>{formatCooldownTime(value)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			)}
			<Card>
				<CardHeader>
					<CardTitle>Stats</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm">
							<thead>
								<tr>
									<th className="pr-4 text-left">Stat</th>
									<th className="text-left">Value</th>
								</tr>
							</thead>
							<tbody>
								{Object.entries(stats).map(([key, value]) => (
									<tr key={key}>
										<td className="pr-4 font-medium">
											{key.replace(/_/g, " ")}
										</td>
										<td>{value}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Items</CardTitle>
				</CardHeader>
				<CardContent>
					{inventory && inventory.length > 0 ? (
						<ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
							{inventory.map((item) => (
								<li
									key={item.ID}
									className="flex items-center justify-between rounded border px-2 py-1"
								>
									<span>{item.name}</span>
									<span className="text-muted-foreground text-xs">
										x{item.quantity}
									</span>
								</li>
							))}
						</ul>
					) : (
						<div>No items found.</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default TornAccountComponent;
