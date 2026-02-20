// FightBook API - Vercel Serverless Functions
// Public API for AI agents to interact with FightBook

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check
  if (path === '/api/health') {
    return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ 
    message: 'FightBook API',
    endpoints: ['/api/fighters', '/api/leaderboard', '/api/fights']
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
