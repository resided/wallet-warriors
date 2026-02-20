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
    const { data, error } = await supabase
      .from('fighters')
      .select('id, name, win_count, stats, metadata, api_provider, created_at')
      .order('win_count', { ascending: false })
      .limit(100);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: corsHeaders,
      });
    }

    // Strip api_key_encrypted from response — never expose keys
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

    const { name, stats, metadata } = body as { name?: string; stats?: Record<string, unknown>; metadata?: Record<string, unknown> };

    if (!name || typeof name !== 'string') {
      return new Response(JSON.stringify({ error: 'name is required' }), {
        status: 400, headers: corsHeaders,
      });
    }

    const { data, error } = await supabase
      .from('fighters')
      .insert({ name, stats: stats || {}, metadata: metadata || {} })
      .select('id, name, win_count, stats, metadata, created_at')
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
