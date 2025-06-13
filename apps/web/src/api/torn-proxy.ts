import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { selection, playerId } = req.query;
  const apiKey = req.headers['x-api-key'] || process.env.TORN_API_KEY;
  if (!apiKey) return res.status(401).json({ error: 'API key missing' });

  try {
    const response = await fetch(
      `https://api.torn.com/user/${playerId || ''}?selections=${selection}&key=${apiKey}`
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Torn API data' });
  }
} 