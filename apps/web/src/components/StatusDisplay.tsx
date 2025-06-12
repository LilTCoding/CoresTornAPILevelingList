import { useStore } from "../store";

const StatusDisplay = () => {
	const { statuses, loading } = useStore();

	return (
		<div className="mb-4 rounded-lg bg-gray-800 p-4 shadow-lg">
			<h2 className="mb-4 font-bold text-2xl text-cyan-400">User Statuses</h2>
			{loading ? (
				<p>Loading...</p>
			) : (
				<ul className="space-y-4">
					{statuses.map((status) => (
						<li key={status.xid} className="rounded-md bg-gray-700 p-4">
							<p>
								<strong>XID:</strong> {status.xid} ({status.name || "Unknown"})
							</p>
							<p>
								<strong>Level:</strong> {status.level || "N/A"}
							</p>
							{status.error ? (
								<p className="text-red-500">{status.error}</p>
							) : (
								<>
									<p>
										<strong>Status:</strong>{" "}
										{status.status === "Hospital"
											? `In hospital until ${
													status.hosp_out
														? new Date(status.hosp_out * 1000).toLocaleString()
														: "unknown"
												}`
											: "Out of hospital"}
									</p>
									{status.status === "Okay" && (
										<a
											href={`https://www.torn.com/attack.php?XID=${status.xid}`}
											target="_blank"
											rel="noopener noreferrer"
											className="mt-2 inline-block rounded-md bg-red-500 p-2 text-white hover:bg-red-600"
										>
											Attack
										</a>
									)}
								</>
							)}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default StatusDisplay;
