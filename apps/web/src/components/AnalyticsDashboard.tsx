import { useStore } from "../store";

const AnalyticsDashboard = () => {
	const { statuses } = useStore();

	const calculateInsights = () => {
		const hospitalCount = statuses.filter(
			(s) => s.status === "Hospital",
		).length;
		const attackableCount = statuses.filter((s) => s.status === "Okay").length;
		const averageLevel =
			statuses.reduce((sum, s) => sum + (s.level || 0), 0) /
			(statuses.length || 1);
		return { hospitalCount, attackableCount, averageLevel };
	};

	const { hospitalCount, attackableCount, averageLevel } = calculateInsights();

	return (
		<div className="rounded-lg bg-gray-800 p-4 shadow-lg">
			<h2 className="mb-4 font-bold text-2xl text-cyan-400">
				Analytics Dashboard
			</h2>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div className="rounded-md bg-gray-700 p-4">
					<p className="font-semibold text-lg">In Hospital</p>
					<p className="text-2xl">{hospitalCount}</p>
				</div>
				<div className="rounded-md bg-gray-700 p-4">
					<p className="font-semibold text-lg">Attackable</p>
					<p className="text-2xl">{attackableCount}</p>
				</div>
				<div className="rounded-md bg-gray-700 p-4">
					<p className="font-semibold text-lg">Average Level</p>
					<p className="text-2xl">{averageLevel.toFixed(1)}</p>
				</div>
			</div>
		</div>
	);
};

export default AnalyticsDashboard;
