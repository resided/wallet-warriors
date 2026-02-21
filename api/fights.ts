import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// Simple in-memory rate limiting
const rateLimits = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimits.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    rateLimits.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }
  
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }
  
  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
}

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  // Use service role key for server-side operations (bypasses RLS)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  if (req.method === 'GET') {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const { data, error } = await supabase
      .from('fights')
      .select('id, agent1_id, agent2_id, winner_id, method, round, end_time, prize_awarded, prize_amount, is_practice, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data || []);
  }

  if (req.method === 'POST') {
    // Rate limit: 10 fights per minute per IP
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const rateLimit = checkRateLimit(`fights:${clientIp}`, 10, 60000);
    
    if (!rateLimit.allowed) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Try again in a minute.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      });
    }

    const { fighter1_id, fighter2_id } = req.body || {};

    if (!fighter1_id || !fighter2_id) {
      return res.status(400).json({ error: 'fighter1_id and fighter2_id are required' });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(fighter1_id) || !uuidRegex.test(fighter2_id)) {
      return res.status(400).json({ error: 'Invalid fighter ID format' });
    }

    const [result1, result2] = await Promise.all([
      supabase.from('fighters').select('id, name, stats').eq('id', fighter1_id).single(),
      supabase.from('fighters').select('id, name, stats').eq('id', fighter2_id).single(),
    ]);

    if (result1.error || !result1.data) {
      return res.status(404).json({ error: 'Fighter not found', fighter_id: fighter1_id });
    }
    if (result2.error || !result2.data) {
      return res.status(404).json({ error: 'Fighter not found', fighter_id: fighter2_id });
    }

    const fighter1Row = result1.data;
    const fighter2Row = result2.data;

    // Generate fight simulation with play-by-play
    const f1Stats = fighter1Row.stats || {};
    const f2Stats = fighter2Row.stats || {};
    
    // Calculate fighter advantages
    const f1Striking = (f1Stats.striking || 50) + (f1Stats.punchSpeed || 50);
    const f2Striking = (f2Stats.striking || 50) + (f2Stats.punchSpeed || 50);
    const f1Grappling = (f1Stats.wrestling || 50) + (f1Stats.submissions || 50);
    const f2Grappling = (f2Stats.wrestling || 50) + (f2Stats.submissions || 50);
    const f1Cardio = f1Stats.cardio || 50;
    const f2Cardio = f2Stats.cardio || 50;
    
    // Determine winner based on stats (with some randomness)
    const f1Score = f1Striking * 0.4 + f1Grappling * 0.4 + f1Cardio * 0.2 + Math.random() * 20;
    const f2Score = f2Striking * 0.4 + f2Grappling * 0.4 + f2Cardio * 0.2 + Math.random() * 20;
    
    const winnerId = f1Score > f2Score ? fighter1Row.id : fighter2Row.id;
    const winnerName = f1Score > f2Score ? fighter1Row.name : fighter2Row.name;
    const loserName = f1Score > f2Score ? fighter2Row.name : fighter1Row.name;
    
    // Determine method and round
    const strikingDiff = Math.abs(f1Striking - f2Striking);
    const grapplingDiff = Math.abs(f1Grappling - f2Grappling);
    
    let method: string;
    if (strikingDiff > 30 && Math.random() > 0.5) {
      method = Math.random() > 0.5 ? 'KO' : 'TKO';
    } else if (grapplingDiff > 30 && Math.random() > 0.5) {
      method = 'SUB';
    } else {
      method = 'DEC';
    }
    
    const round = method === 'DEC' ? 3 : Math.floor(Math.random() * 3) + 1;
    
    // Generate play-by-play commentary
    const fightLog: string[] = [];
    const rounds = ['Round 1', 'Round 2', 'Round 3'];
    
    for (let r = 0; r < (method === 'DEC' ? 3 : round); r++) {
      fightLog.push(`\n═══ ${rounds[r]} ═══`);
      
      // Generate 3-5 actions per round
      const actions = Math.floor(Math.random() * 3) + 3;
      for (let a = 0; a < actions; a++) {
        const isF1 = Math.random() > 0.5;
        const attacker = isF1 ? fighter1Row.name : fighter2Row.name;
        const defender = isF1 ? fighter2Row.name : fighter1Row.name;
        
        const strikes = [
          `${attacker} lands a crisp jab`,
          `${attacker} connects with a right hand`,
          `${attacker} throws a leg kick`,
          `${attacker} lands a body shot`,
          `${attacker} misses with a wild hook`,
          `${attacker} tags ${defender} with a straight`,
          `${attacker} lands a devastating uppercut`,
          `${attacker} connects with a head kick`,
        ];
        
        const grapples = [
          `${attacker} shoots for a takedown`,
          `${attacker} gets the clinch against the cage`,
          `${attacker} attempts a trip`,
          `${attacker} secures a single leg`,
          `${attacker} gets top position`,
          `${attacker} passes to half guard`,
          `${attacker} locks in a choke`,
          `${attacker} works from the bottom`,
        ];
        
        const isStrike = Math.random() > 0.4;
        const actions = isStrike ? strikes : grapples;
        fightLog.push(actions[Math.floor(Math.random() * actions.length)]);
      }
      
      // End of round commentary
      if (r === 2 || (method !== 'DEC' && r === round - 1)) {
        if (method === 'KO') {
          fightLog.push(`\n💥 ${winnerName} lands a CRUSHING blow! ${loserName} goes down!`);
          fightLog.push(`🏆 ${winnerName} wins by KO in Round ${round}!`);
        } else if (method === 'TKO') {
          fightLog.push(`\n💥 ${winnerName} unleashes a flurry of punches!`);
          fightLog.push(`🛑 The ref steps in! ${loserName} can't continue!`);
          fightLog.push(`🏆 ${winnerName} wins by TKO in Round ${round}!`);
        } else if (method === 'SUB') {
          fightLog.push(`\n🔗 ${winnerName} locks in a tight submission!`);
          fightLog.push(`📢 ${loserName} taps out!`);
          fightLog.push(`🏆 ${winnerName} wins by submission in Round ${round}!`);
        }
      } else if (method === 'DEC') {
        fightLog.push(`\n⏱ End of Round ${r + 1}`);
      }
    }
    
    if (method === 'DEC') {
      fightLog.push(`\n📊 After 3 rounds, the judges score it for ${winnerName}!`);
      fightLog.push(`🏆 ${winnerName} wins by decision!`);
    }

    const { data: fightRecord, error: insertError } = await supabase
      .from('fights')
      .insert({
        agent1_id: fighter1_id,
        agent2_id: fighter2_id,
        winner_id: winnerId,
        method: method,
        round: round,
        prize_awarded: false,
        prize_amount: 0,
        fight_data: {
          fighter1: fighter1Row.name,
          fighter2: fighter2Row.name,
          winner: winnerName,
          method: method,
          round: round,
          log: fightLog,
          simulated: true
        }
      })
      .select('id, agent1_id, agent2_id, winner_id, method, round, created_at')
      .single();

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    // Update winner's win count
    const { data: winnerRow } = await supabase
      .from('fighters')
      .select('win_count')
      .eq('id', winnerId)
      .single();
    if (winnerRow) {
      await supabase
        .from('fighters')
        .update({ win_count: (winnerRow.win_count || 0) + 1 })
        .eq('id', winnerId);
    }

    return res.status(201).json({
      id: fightRecord.id,
      fighter1: fighter1Row.name,
      fighter2: fighter2Row.name,
      winner: winnerName,
      winner_id: winnerId,
      method: method,
      round: round,
      fight_log: fightLog,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
