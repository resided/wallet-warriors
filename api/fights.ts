import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getFightHistory, saveFight, getFight } from '../../src/lib/fightStorage'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end()
  }

  const { method } = request

  try {
    if (method === 'GET') {
      const { id } = request.query
      
      if (id) {
        const fight = await getFight(id as string)
        if (!fight) {
          return response.status(404).json({ error: 'Fight not found' })
        }
        return response.json(fight)
      }
      
      const fights = await getFightHistory()
      return response.json(fights)
    }

    if (method === 'POST') {
      const fight = request.body
      const saved = await saveFight(fight)
      return response.status(201).json(saved)
    }

    return response.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('API Error:', error)
    return response.status(500).json({ error: 'Internal server error' })
  }
}
