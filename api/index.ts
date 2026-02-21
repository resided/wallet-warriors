import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ 
    message: 'FightBook API',
    version: '1.0.0',
    endpoints: {
      'GET /api/fighters': 'List all fighters',
      'POST /api/fighters': 'Create a new fighter',
      'GET /api/fights': 'List all fights',
      'POST /api/fights': 'Create a new fight',
      'GET /api/leaderboard': 'Get leaderboard'
    }
  });
}
