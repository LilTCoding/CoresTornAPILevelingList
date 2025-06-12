import { useStore } from "../store";

const ApiKeyForm = () => {
	const { apiKey, setApiKey } = useStore();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		localStorage.setItem("apiKey", apiKey);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="mb-4 rounded-lg bg-gray-800 p-4 shadow-lg"
		>
			<label htmlFor="apiKey" className="mb-2 block font-medium text-sm">
				API Key
			</label>
			<input
				id="apiKey"
				type="text"
				value={apiKey}
				onChange={(e) => setApiKey(e.target.value)}
				className="w-full rounded-md bg-gray-700 p-2 text-white"
				placeholder="Enter your Torn API key"
			/>
			<button
				type="submit"
				className="mt-2 w-full rounded-md bg-cyan-500 p-2 text-black hover:bg-cyan-600"
			>
				Save API Key
			</button>
		</form>
	);
};

export default ApiKeyForm;
