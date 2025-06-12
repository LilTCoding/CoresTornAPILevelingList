import type { Dispatch, SetStateAction } from "react";

interface ApiKeyFormProps {
	apiKey: string;
	onApiKeyChange: Dispatch<SetStateAction<string>>;
}

export default function ApiKeyForm({
	apiKey,
	onApiKeyChange,
}: ApiKeyFormProps) {
	return (
		<div className="mb-4">
			<label htmlFor="apiKey" className="mb-2 block font-medium text-sm">
				Torn API Key
			</label>
			<input
				type="password"
				id="apiKey"
				value={apiKey}
				onChange={(e) => onApiKeyChange(e.target.value)}
				className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
				placeholder="Enter your Torn API key"
			/>
		</div>
	);
}
