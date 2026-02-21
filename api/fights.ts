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
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// Simple fight engine (inlined to avoid import issues)
interface Fighter {
  id: string;
  name: string;
  stats: Record<string, number>;
}

interface FightState {
  round: number;
  position: 'standing' | 'clinch' | 'ground';
  groundPosition?: 'top' | 'bottom';
  f1: FighterState;
  f2: FighterState;
  log: string[];
  winner: string | null;
  method: 'KO' | 'TKO' | 'SUB' | 'DEC' | null;
}

interface FighterState {
  name: string;
  health: number;
  headHealth: number;
  stamina: number;
  isStunned: boolean;
  stats: Record<string, number>;
}

function simulateFight(f1: Fighter, f2: Fighter): FightState {
  const state: FightState = {
    round: 1,
    position: 'standing',
    f1: {
      name: f1.name,
      health: 100,
      headHealth: 100,
      stamina: 100,
      isStunned: false,
      stats: f1.stats,
    },
    f2: {
      name: f2.name,
      health: 100,
      headHealth: 100,
      stamina: 100,
      isStunned: false,
      stats: f2.stats,
    },
    log: [],
    winner: null,
    method: null,
  };
  
  // Run 3 rounds or until finish
  for (let round = 1; round <= 3 && !state.winner; round++) {
    state.round = round;
    state.log.push(`\n═══ ROUND ${round} ═══`);
    state.log.push(`🥊 ${f1.name} vs ${f2.name}`);
    state.log.push('');
    
    // 8-14 actions per round
    const actions = 8 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < actions && !state.winner; i++) {
      const attacker = Math.random() > 0.5 ? state.f1 : state.f2;
      const defender = attacker === state.f1 ? state.f2 : state.f1;
      
      // Process based on position
      if (state.position === 'standing') {
        processStanding(state, attacker, defender);
      } else if (state.position === 'clinch') {
        processClinch(state, attacker, defender);
      } else {
        processGround(state, attacker, defender);
      }
      
      // Check for finish
      if (defender.headHealth <= 0 || defender.health <= 15) {
        state.winner = attacker.name;
        state.method = defender.headHealth <= 0 ? 'KO' : 'TKO';
        state.log.push(`\n💥 ${attacker.name} finishes ${defender.name}!`);
        if (state.method === 'KO') {
          state.log.push(`🫨 ${defender.name} is OUT COLD!`);
        } else {
          state.log.push(`🛑 The referee steps in to stop the fight!`);
        }
        break;
      }
    }
    
    if (!state.winner) {
      state.log.push(`\n⏱ End of Round ${round}`);
      // Recover stamina
      state.f1.stamina = Math.min(100, state.f1.stamina + 15);
      state.f2.stamina = Math.min(100, state.f2.stamina + 15);
    }
  }
  
  // Decision if no finish
  if (!state.winner) {
    const f1Score = state.f1.health + state.f1.headHealth * 0.5;
    const f2Score = state.f2.health + state.f2.headHealth * 0.5;
    
    if (Math.abs(f1Score - f2Score) < 5) {
      state.winner = 'DRAW';
      state.method = 'DEC';
      state.log.push(`\n📊 After 3 rounds, we go to the judges' scorecards...`);
      state.log.push(`😐 It's a DRAW!`);
    } else {
      state.winner = f1Score > f2Score ? state.f1.name : state.f2.name;
      state.method = 'DEC';
      state.log.push(`\n📊 After 3 rounds, we go to the judges' scorecards...`);
      state.log.push(`🏆 ${state.winner} wins by decision!`);
    }
  }
  
  return state;
}

function processStanding(state: FightState, attacker: FighterState, defender: FighterState) {
  const striking = attacker.stats.striking || 50;
  const wrestling = attacker.stats.wrestling || 50;
  const roll = Math.random() * 100;
  
  if (roll < 65) {
    // Strike
    const strikes = [
      { name: 'jab', power: 5, chance: 80 },
      { name: 'cross', power: 10, chance: 70 },
      { name: 'hook', power: 12, chance: 60 },
      { name: 'uppercut', power: 15, chance: 50 },
      { name: 'leg kick', power: 10, chance: 75 },
      { name: 'body kick', power: 14, chance: 65 },
      { name: 'head kick', power: 25, chance: 30 },
    ];
    
    const strike = strikes[Math.floor(Math.random() * strikes.length)];
    const accuracy = (striking + (attacker.stats.punchSpeed || 50)) / 2;
    const defense = (defender.stats.headMovement || 50) + (defender.isStunned ? 0 : 15);
    const lands = Math.random() * 100 < (accuracy - defense * 0.3);
    
    if (lands) {
      let damage = strike.power * (1 + (attacker.stats.strength || 50) / 100);
      
      // Critical hit
      if (Math.random() < 0.15) {
        damage *= 1.5;
        defender.isStunned = true;
      }
      
      defender.headHealth -= damage * 0.7;
      defender.health -= damage * 0.4;
      attacker.stamina -= 3;
      
      if (strike.name === 'head kick' && damage > 30) {
        state.log.push(`🦶 HEAD KICK! ${attacker.name} lands a devastating head kick on ${defender.name}!`);
      } else if (damage > 20) {
        state.log.push(`💥 ${attacker.name} lands a massive ${strike.name} and rocks ${defender.name}!`);
      } else {
        state.log.push(`${attacker.name} lands a ${strike.name}`);
      }
    } else {
      state.log.push(`${attacker.name} throws a ${strike.name} but misses`);
    }
  } else if (roll < 85) {
    // Takedown
    const tdSkill = (attacker.stats.wrestling || 50) + (attacker.stats.strength || 50);
    const tdDef = (defender.stats.takedownDefense || 50) + (defender.stats.footwork || 50);
    const success = Math.random() * 100 < (tdSkill - tdDef * 0.5);
    
    if (success) {
      state.position = 'ground';
      state.groundPosition = attacker === state.f1 ? 'top' : 'bottom';
      state.log.push(`🤼 ${attacker.name} secures a takedown!`);
    } else {
      state.log.push(`${attacker.name} shoots for a takedown but ${defender.name} defends`);
    }
    attacker.stamina -= 6;
  } else {
    // Clinch
    const clinchSkill = (attacker.stats.clinchControl || 50) + (attacker.stats.strength || 50);
    const success = Math.random() * 100 < clinchSkill;
    
    if (success) {
      state.position = 'clinch';
      state.log.push(`🤼 ${attacker.name} gets the clinch against the cage`);
    } else {
      state.log.push(`${attacker.name} attempts to clinch but ${defender.name} circles away`);
    }
  }
}

function processClinch(state: FightState, attacker: FighterState, defender: FighterState) {
  const roll = Math.random() * 100;
  
  if (roll < 50) {
    // Knee or elbow
    const knees = [
      { name: 'knee to body', power: 12 },
      { name: 'knee to head', power: 20 },
      { name: 'dirty boxing', power: 8 },
      { name: 'elbow', power: 15 },
    ];
    const strike = knees[Math.floor(Math.random() * knees.length)];
    
    defender.headHealth -= strike.power * 0.6;
    defender.health -= strike.power * 0.3;
    
    if (strike.name === 'knee to head') {
      state.log.push(`🦶 ${attacker.name} lands a nasty knee to the head in the clinch!`);
    } else {
      state.log.push(`${attacker.name} lands ${strike.name}`);
    }
  } else if (roll < 80) {
    // Takedown from clinch
    const success = Math.random() * 100 < ((attacker.stats.wrestling || 50) + 20);
    if (success) {
      state.position = 'ground';
      state.log.push(`🤼 ${attacker.name} executes a trip from the clinch!`);
    } else {
      state.log.push(`${attacker.name} attempts a trip but ${defender.name} stays upright`);
    }
  } else {
    // Separate
    state.position = 'standing';
    state.log.push(`👐 The fighters separate and return to striking range`);
  }
}

function processGround(state: FightState, attacker: FighterState, defender: FighterState) {
  const isTop = (attacker === state.f1 && state.groundPosition === 'top') || 
                (attacker === state.f2 && state.groundPosition === 'bottom');
  
  const roll = Math.random() * 100;
  
  if (isTop) {
    // Top game
    if (roll < 50) {
      // Ground and pound
      const gnp = [
        { name: 'ground and pound', power: 15 },
        { name: 'elbow from top', power: 22 },
        { name: 'hammerfists', power: 12 },
      ];
      const strike = gnp[Math.floor(Math.random() * gnp.length)];
      
      defender.headHealth -= strike.power;
      defender.health -= strike.power * 0.5;
      
      if (strike.name === 'elbow from top') {
        state.log.push(`💥 ${attacker.name} cuts ${defender.name} with a vicious elbow from the top!`);
      } else {
        state.log.push(`${attacker.name} lands ${strike.name}`);
      }
      
      // TKO check
      if (defender.headHealth < 25 && Math.random() < 0.3) {
        state.winner = attacker.name;
        state.method = 'TKO';
        state.log.push(`\n🛑 The referee has seen enough! He stops the fight!`);
      }
    } else if (roll < 75) {
      // Submission attempt
      const subs = ['guillotine', 'armbar', 'triangle choke', 'kimura'];
      const sub = subs[Math.floor(Math.random() * subs.length)];
      const subSkill = (attacker.stats.submissions || 50);
      const subDef = (defender.stats.submissionDefense || 50);
      const success = Math.random() * 100 < (subSkill - subDef * 0.4);
      
      if (success) {
        state.winner = attacker.name;
        state.method = 'SUB';
        state.log.push(`\n🔗 ${attacker.name} locks in a ${sub.toUpperCase()}!`);
        state.log.push(`📢 ${defender.name} taps out! It's all over!`);
      } else {
        state.log.push(`${attacker.name} attempts a ${sub} but ${defender.name} escapes`);
      }
    } else {
      // Pass or maintain
      state.log.push(`${attacker.name} controls position on top`);
    }
  } else {
    // Bottom game
    if (roll < 40) {
      // Sweep
      const sweepSkill = (attacker.stats.sweeps || 50) + (attacker.stats.bottomGame || 50);
      const success = Math.random() * 100 < sweepSkill;
      if (success) {
        state.groundPosition = attacker === state.f1 ? 'top' : 'bottom';
        state.log.push(`🔄 ${attacker.name} executes a beautiful sweep and gets top position!`);
      } else {
        state.log.push(`${attacker.name} attempts a sweep but ${defender.name} maintains control`);
      }
    } else if (roll < 70) {
      // Submission from bottom
      const subs = ['triangle choke', 'armbar', 'omoplata'];
      const sub = subs[Math.floor(Math.random() * subs.length)];
      const subSkill = (attacker.stats.submissions || 50) + (attacker.stats.flexibility || 50);
      const success = Math.random() * 100 < subSkill * 0.7;
      
      if (success) {
        state.winner = attacker.name;
        state.method = 'SUB';
        state.log.push(`\n🔗 ${attacker.name} locks in a ${sub.toUpperCase()} from the bottom!`);
        state.log.push(`📢 ${defender.name} taps out! Incredible submission!`);
      } else {
        state.log.push(`${attacker.name} attempts a ${sub} from bottom but ${defender.name} defends`);
      }
    } else {
      // Try to stand
      const success = Math.random() * 100 < (attacker.stats.wrestling || 50);
      if (success) {
        state.position = 'standing';
        state.log.push(`⬆️ ${attacker.name} explodes to their feet!`);
      } else {
        state.log.push(`${attacker.name} tries to stand but ${defender.name} keeps them grounded`);
      }
    }
  }
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

    // Run the fight simulation
    const fightState = simulateFight(
      { id: result1.data.id, name: result1.data.name, stats: result1.data.stats || {} },
      { id: result2.data.id, name: result2.data.name, stats: result2.data.stats || {} }
    );

    const winnerId = fightState.winner === result1.data.name ? result1.data.id :
                     fightState.winner === result2.data.name ? result2.data.id : null;

    // Save to database
    const { data: fightRecord, error: insertError } = await supabase
      .from('fights')
      .insert({
        agent1_id: fighter1_id,
        agent2_id: fighter2_id,
        winner_id: winnerId,
        method: fightState.method,
        round: fightState.round,
        prize_awarded: false,
        prize_amount: 0,
        fight_data: {
          fighter1: result1.data.name,
          fighter2: result2.data.name,
          winner: fightState.winner,
          method: fightState.method,
          round: fightState.round,
          log: fightState.log,
        }
      })
      .select('id, agent1_id, agent2_id, winner_id, method, round, created_at')
      .single();

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    // Update winner's win count
    if (winnerId) {
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
    }

    return res.status(201).json({
      id: fightRecord.id,
      fighter1: result1.data.name,
      fighter2: result2.data.name,
      winner: fightState.winner,
      winner_id: winnerId,
      method: fightState.method,
      round: fightState.round,
      fight_log: fightState.log,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
