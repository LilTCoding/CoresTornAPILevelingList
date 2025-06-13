import { toast } from "sonner";

interface ScriptExecutionResponse {
    success: boolean;
    message: string;
    output?: string;
}

export const executeScript = async (scriptName: string): Promise<ScriptExecutionResponse> => {
    try {
        const response = await fetch('/api/scripts/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ scriptName }),
        });

        if (!response.ok) {
            throw new Error('Failed to execute script');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error executing script:', error);
        toast.error('Failed to execute script');
        return {
            success: false,
            message: 'Failed to execute script',
        };
    }
}; 