import type { Dispatch, SetStateAction } from "react";

interface XidFormProps {
	xids: string[];
	onXidsChange: Dispatch<SetStateAction<string[]>>;
}

export default function XidForm({ xids, onXidsChange }: XidFormProps) {
	return (
		<div className="mb-4">
			<label htmlFor="xids" className="mb-2 block font-medium text-sm">
				XIDs (comma-separated)
			</label>
			<input
				type="text"
				id="xids"
				value={xids.join(",")}
				onChange={(e) =>
					onXidsChange(e.target.value.split(",").map((x) => x.trim()))
				}
				className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
				placeholder="Enter XIDs (e.g., 1,2,3)"
			/>
		</div>
	);
}
