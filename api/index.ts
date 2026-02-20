export const config = {
  runtime: 'edge',
};

export default function handler() {
  return new Response(JSON.stringify({ 
    status: 'ok',
    message: 'FightBook API v1'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
