import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function executeScript(scriptName: string) {
    try {
        // Validate script name to prevent command injection
        if (!/^[a-zA-Z0-9-_]+$/.test(scriptName)) {
            return {
                success: false,
                message: 'Invalid script name'
            };
        }

        // Construct the path to the script
        const scriptPath = path.join(process.cwd(), 'torn_userscripts', scriptName, `${scriptName.replace(/-/g, '_')}.js`);

        // Execute the script
        const { stdout, stderr } = await execAsync(`node "${scriptPath}"`);

        if (stderr) {
            console.error(`Script execution error: ${stderr}`);
            return {
                success: false,
                message: 'Script execution failed',
                output: stderr
            };
        }

        return {
            success: true,
            message: 'Script executed successfully',
            output: stdout
        };
    } catch (error) {
        console.error('Error executing script:', error);
        return {
            success: false,
            message: 'Failed to execute script'
        };
    }
} 