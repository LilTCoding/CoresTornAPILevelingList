import { useStore } from "../store";

const XidForm = () => {
	const { xids, setXids } = useStore();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		localStorage.setItem("xids", xids.join(","));
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="mb-4 rounded-lg bg-gray-800 p-4 shadow-lg"
		>
			<label htmlFor="xids" className="mb-2 block font-medium text-sm">
				XIDs (comma-separated)
			</label>
			<input
				id="xids"
				type="text"
				value={xids.join(",")}
				onChange={(e) =>
					setXids(e.target.value.split(",").map((x) => x.trim()))
				}
				className="w-full rounded-md bg-gray-700 p-2 text-white"
				placeholder="1776074,1999595"
			/>
			<button
				type="submit"
				className="mt-2 w-full rounded-md bg-cyan-500 p-2 text-black hover:bg-cyan-600"
			>
				Save XIDs
			</button>
		</form>
	);
};

export default XidForm;
