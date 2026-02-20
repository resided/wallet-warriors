import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

interface FighterRow {
  id: string
  name: string
  api_key: string
  api_provider: string
  stats: Record<string, number>
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export async function getFighters(): Promise<FighterRow[]> {
  const { data, error } = await supabase
    .from('fighters')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getFighter(id: string): Promise<FighterRow | null> {
  const { data, error } = await supabase
    .from('fighters')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function saveFighter(fighter: Partial<FighterRow>): Promise<FighterRow> {
  const { data, error } = await supabase
    .from('fighters')
    .insert(fighter)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateFighter(id: string, data: Partial<FighterRow>): Promise<FighterRow> {
  const { data: fighter, error } = await supabase
    .from('fighters')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return fighter
}

export async function deleteFighter(id: string): Promise<void> {
  const { error } = await supabase
    .from('fighters')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end()
  }

  const { method } = request

  try {
    if (method === 'GET') {
      const { id } = request.query
      
      if (id) {
        const fighter = await getFighter(id as string)
        if (!fighter) {
          return response.status(404).json({ error: 'Fighter not found' })
        }
        // Don't expose API keys in responses
        const { api_key, ...safe } = fighter
        return response.json(safe)
      }
      
      const fighters = await getFighters()
      // Don't expose API keys
      const safe = fighters.map(f => {
        const { api_key, ...rest } = f
        return rest
      })
      return response.json(safe)
    }

    if (method === 'POST') {
      const fighter = request.body
      const saved = await saveFighter(fighter)
      const { api_key, ...safe } = saved
      return response.status(201).json(safe)
    }

    if (method === 'PUT') {
      const { id, ...data } = request.body
      if (!id) {
        return response.status(400).json({ error: 'Fighter ID required' })
      }
      const updated = await updateFighter(id, data)
      const { api_key, ...safe } = updated
      return response.json(safe)
    }

    if (method === 'DELETE') {
      const { id } = request.query
      if (!id) {
        return response.status(400).json({ error: 'Fighter ID required' })
      }
      await deleteFighter(id as string)
      return response.status(204).end()
    }

    return response.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('API Error:', error)
    return response.status(500).json({ error: 'Internal server error' })
  }
}
