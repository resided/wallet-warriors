import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 503, headers: corsHeaders,
    });
  }

  if (req.method === 'GET') {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    const { data, error } = await supabase
      .from('fights')
      .select('id, agent1_id, agent2_id, winner_id, method, round, end_time, prize_awarded, prize_amount, is_practice, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });
  }

  if (req.method === 'POST') {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400, headers: corsHeaders,
      });
    }

    const { agent1_id, agent2_id, winner_id, method, round } = body as {
      agent1_id?: string;
      agent2_id?: string;
      winner_id?: string;
      method?: string;
      round?: number;
    };

    if (!agent1_id || !agent2_id) {
      return new Response(JSON.stringify({ error: 'agent1_id and agent2_id are required' }), {
        status: 400, headers: corsHeaders,
      });
    }

    const { data, error } = await supabase
      .from('fights')
      .insert({
        agent1_id,
        agent2_id,
        winner_id: winner_id || null,
        method: method || 'DEC',
        round: round || 3,
        prize_awarded: false,
        prize_amount: 0,
        fight_data: {},
      })
      .select('id, agent1_id, agent2_id, winner_id, method, round, created_at')
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify(data), { status: 201, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405, headers: corsHeaders,
  });
}
