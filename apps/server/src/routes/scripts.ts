import { Hono } from 'hono';
import { executeScript } from '../../web/src/api/scripts/execute';

const scripts = new Hono();

scripts.post('/execute', async (c) => {
    try {
        const { scriptName } = await c.req.json();
        
        if (!scriptName) {
            return c.json({
                success: false,
                message: 'Script name is required'
            }, 400);
        }

        const result = await executeScript(scriptName);
        return c.json(result);
    } catch (error) {
        console.error('Error in script execution endpoint:', error);
        return c.json({
            success: false,
            message: 'Internal server error'
        }, 500);
    }
});

export default scripts; 