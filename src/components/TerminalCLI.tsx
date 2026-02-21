// FightBook - Full Terminal CLI
// Adapted from fightbook-live visual design, wired to FightBook backend

import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const API = '/api';

const WELCOME = [
  '',
  '  [FIGHTBOOK v1.1.17]',
  '  AI Combat Arena - Create fighters and watch them battle',
  '',
  '  QUICK START:',
  '  • Click [CREATE] at the top to make your first fighter',
  '  • Go to ROSTER to see all fighters',
  '  • Type: fight <name> vs <name>',
  '  • Check RANKS for the leaderboard',
  '',
  '  OR TYPE:',
  "  'register'  - Create fighter (opens visual creator)",
  "  'help'      - List all commands",
  "  'about'     - How FightBook works",
  "  'faq'       - Common questions",
  '',
];

const ARCHETYPES: Record<string, Record<string, number>> = {
  striker: {
    striking: 88, punchSpeed: 85, kickPower: 80, headMovement: 78,
    footwork: 72, combinations: 80, wrestling: 30, takedownDefense: 65,
    clinchControl: 50, trips: 30, throws: 30, submissions: 20,
    submissionDefense: 50, groundAndPound: 50, guardPassing: 40,
    sweeps: 30, topControl: 40, bottomGame: 30, cardio: 78,
    chin: 75, recovery: 70, strength: 65, flexibility: 55,
  },
  grappler: {
    striking: 45, punchSpeed: 45, kickPower: 40, headMovement: 55,
    footwork: 55, combinations: 40, wrestling: 90, takedownDefense: 85,
    clinchControl: 78, trips: 72, throws: 68, submissions: 82,
    submissionDefense: 80, groundAndPound: 70, guardPassing: 75,
    sweeps: 65, topControl: 85, bottomGame: 70, cardio: 85,
    chin: 70, recovery: 75, strength: 80, flexibility: 75,
  },
  balanced: {
    striking: 72, punchSpeed: 70, kickPower: 65, headMovement: 68,
    footwork: 65, combinations: 68, wrestling: 70, takedownDefense: 72,
    clinchControl: 62, trips: 55, throws: 52, submissions: 58,
    submissionDefense: 65, groundAndPound: 62, guardPassing: 58,
    sweeps: 50, topControl: 65, bottomGame: 55, cardio: 78,
    chin: 72, recovery: 70, strength: 68, flexibility: 62,
  },
  pressure: {
    striking: 80, punchSpeed: 78, kickPower: 72, headMovement: 55,
    footwork: 68, combinations: 82, wrestling: 68, takedownDefense: 62,
    clinchControl: 75, trips: 60, throws: 55, submissions: 45,
    submissionDefense: 55, groundAndPound: 68, guardPassing: 55,
    sweeps: 45, topControl: 65, bottomGame: 45, cardio: 92,
    chin: 80, recovery: 80, strength: 72, flexibility: 55,
  },
  counter: {
    striking: 75, punchSpeed: 72, kickPower: 65, headMovement: 88,
    footwork: 85, combinations: 65, wrestling: 55, takedownDefense: 80,
    clinchControl: 55, trips: 45, throws: 45, submissions: 50,
    submissionDefense: 70, groundAndPound: 52, guardPassing: 52,
    sweeps: 55, topControl: 52, bottomGame: 60, cardio: 75,
    chin: 70, recovery: 72, strength: 60, flexibility: 70,
  },
};

const bar = (val: number): string => {
  const filled = Math.round(val / 5);
  return '█'.repeat(filled) + '░'.repeat(20 - filled);
};

interface Entry {
  type: 'input' | 'output' | 'system' | 'fight' | 'error' | 'loading';
  text: string;
}

interface Fighter {
  id: string;
  name: string;
  win_count: number;
  stats: Record<string, number>;
  metadata?: Record<string, any>;
  created_at?: string;
}

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  win_count: number;
  total_fights: number;
  losses: number;
}

export default function TerminalCLI() {
  const [history, setHistory] = useState<Entry[]>(
    WELCOME.map(t => ({ type: 'system' as const, text: t }))
  );
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [processing, setProcessing] = useState(false);
  const [registerMode, setRegisterMode] = useState<null | { step: string; data: Record<string, any> }>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [history]);

  const add = useCallback((entries: Entry[]) => {
    setHistory(prev => [...prev, ...entries]);
  }, []);

  const process = useCallback(async (cmd: string) => {
    const lower = cmd.trim().toLowerCase();
    const raw = cmd.trim();

    if (lower === 'help') {
      add([
        { type: 'fight', text: '  [COMMANDS]' },
        { type: 'output', text: '' },
        { type: 'system', text: '  NAVIGATION:' },
        { type: 'output', text: '  Use the top menu: CLI | ROSTER | RANKS | CREATE' },
        { type: 'output', text: '' },
        { type: 'system', text: '  CLI COMMANDS:' },
        { type: 'output', text: '  register       Create a new fighter (opens visual creator)' },
        { type: 'output', text: '  fighters       List all fighters in the arena' },
        { type: 'output', text: '  fight a vs b   Run a fight between two fighters' },
        { type: 'output', text: '  random         Quick fight with random matchup' },
        { type: 'output', text: '  leaderboard    Show rankings by wins' },
        { type: 'output', text: '  stats <name>   View detailed fighter stats' },
        { type: 'output', text: '  history        Recent fight history' },
        { type: 'output', text: '  record <name>  Fighter\'s win/loss record' },
        { type: 'output', text: '' },
        { type: 'system', text: '  INFO:' },
        { type: 'output', text: '  about          What is FightBook and how it works' },
        { type: 'output', text: '  faq            Frequently asked questions' },
        { type: 'output', text: '  clear          Clear this terminal' },
        { type: 'output', text: '' },
        { type: 'output', text: '  Tip: Click [CREATE] at the top for the best experience.' },
      ]);
      return;
    }

    if (lower === 'about') {
      add([
        { type: 'fight', text: '  [ABOUT FIGHTBOOK]' },
        { type: 'output', text: '' },
        { type: 'output', text: '  FightBook is an AI-powered MMA combat simulator. Create fighters,' },
        { type: 'output', text: '  customize their stats, and watch them battle in realistic 3-round' },
        { type: 'output', text: '  fights with play-by-play commentary.' },
        { type: 'output', text: '' },
        { type: 'system', text: '  QUICK START:' },
        { type: 'output', text: '  1. Click [CREATE] or type "register" to make a fighter' },
        { type: 'output', text: '  2. Go to ROSTER to see all fighters' },
        { type: 'output', text: '  3. Type "fight <name> vs <name>" to run a fight' },
        { type: 'output', text: '  4. Check RANKS to see the leaderboard' },
        { type: 'output', text: '' },
        { type: 'system', text: '  THE ENGINE:' },
        { type: 'output', text: '  • Position-based combat (standing, clinch, ground)' },
        { type: 'output', text: '  • 6 core stats: Striking, Grappling, Stamina, Power, Chin, Speed' },
        { type: 'output', text: '  • Real fight outcomes: KO, TKO, Submission, or Decision' },
        { type: 'output', text: '  • Fighter templates based on MMA legends' },
        { type: 'output', text: '' },
        { type: 'system', text: '  INSTALL CLI VERSION:' },
        { type: 'output', text: '  npm install -g fightbook' },
        { type: 'output', text: '' },
        { type: 'output', text: '  Type "faq" for frequently asked questions.' },
      ]);
      return;
    }

    if (lower === 'faq') {
      add([
        { type: 'fight', text: '  [FREQUENTLY ASKED QUESTIONS]' },
        { type: 'output', text: '' },
        { type: 'system', text: '  Q: How do I create a fighter?' },
        { type: 'output', text: '  A: Click the red [CREATE] button at the top, or type "register" in' },
        { type: 'output', text: '     the terminal. Choose a template (like McGregor or Khabib) and' },
        { type: 'output', text: '     customize the stats.' },
        { type: 'output', text: '' },
        { type: 'system', text: '  Q: How do fights work?' },
        { type: 'output', text: '  A: Fights are simulated based on your fighter stats. Higher striking' },
        { type: 'output', text: '     = more/better punches. Higher wrestling = more takedowns. The AI' },
        { type: 'output', text: '     generates realistic play-by-play commentary for each exchange.' },
        { type: 'output', text: '' },
        { type: 'system', text: '  Q: What are the 6 stats?' },
        { type: 'output', text: '  • STRIKING: Punching technique and accuracy' },
        { type: 'output', text: '  • GRAPPLING: Wrestling, takedowns, ground control' },
        { type: 'output', text: '  • STAMINA: Cardio - affects late-round performance' },
        { type: 'output', text: '  • POWER: Knockout power and damage output' },
        { type: 'output', text: '  • CHIN: Ability to take punishment' },
        { type: 'output', text: '  • SPEED: Hand speed and footwork' },
        { type: 'output', text: '' },
        { type: 'system', text: '  Q: How do I win?' },
        { type: 'output', text: '  A: Win fights to climb the leaderboard. Outcomes are:' },
        { type: 'output', text: '     KO (knockout), TKO (ref stoppage), SUB (submission), or' },
        { type: 'output', text: '     DEC (judges decision after 3 rounds).' },
        { type: 'output', text: '' },
        { type: 'system', text: '  Q: What is the CLI version?' },
        { type: 'output', text: '  A: A command-line version you can install with npm. Good for' },
        { type: 'output', text: '     creating fighters locally and battling them.' },
        { type: 'output', text: '' },
        { type: 'system', text: '  Q: Is there a token?' },
        { type: 'output', text: '  A: Yes - $FIGHT on Base. Contract: 0xfC01...2a1b07' },
        { type: 'output', text: '' },
        { type: 'output', text: '  More questions? DM @0xreside on X.' },
      ]);
      return;
    }

    if (lower === 'clear') {
      setHistory([]);
      return;
    }

    if (lower === 'register') {
      add([
        { type: 'system', text: '  Opening Fighter Creator...' },
        { type: 'output', text: '  Use the visual interface to create your fighter.' },
      ]);
      // Dispatch event to open creator
      window.dispatchEvent(new CustomEvent('openFighterCreator'));
      return;
    }

    if (lower === 'fighters' || lower === 'roster') {
      setProcessing(true);
      try {
        const res = await fetch(`${API}/fighters`);
        const data: Fighter[] = await res.json();
        if (!data?.length) {
          add([{ type: 'output', text: '  No fighters registered. Type \'register\' to add one.' }]);
        } else {
          const lines: Entry[] = [
            { type: 'fight', text: '  ═══════════════════════════════════════════════════════════════' },
            { type: 'fight', text: '                         FIGHTER ROSTER' },
            { type: 'fight', text: '  ═══════════════════════════════════════════════════════════════' },
            { type: 'output', text: '' },
          ];
          data.forEach((f, i) => {
            const xHandle = (f.metadata?.xHandle as string) || '@unknown';
            const record = `${f.win_count || 0}W-${(f.metadata?.losses as number) || 0}L`;
            const archetype = Object.keys(ARCHETYPES).find(arch => 
              ARCHETYPES[arch].striking === (f.stats?.striking || 0)
            ) || 'custom';
            
            lines.push({ type: 'fight', text: `  ┌─── ${f.name.toUpperCase()} ${'─'.repeat(Math.max(0, 45 - f.name.length))}┐` });
            lines.push({ type: 'output', text: `  │  Creator: ${xHandle.padEnd(39)}│` });
            lines.push({ type: 'output', text: `  │  Record:  ${record.padEnd(39)}│` });
            lines.push({ type: 'output', text: `  │  Style:   ${archetype.padEnd(39)}│` });
            lines.push({ type: 'system', text: `  │  Type 'stats ${f.name}' for full profile │` });
            lines.push({ type: 'fight', text: `  └${'─'.repeat(48)}┘` });
            lines.push({ type: 'output', text: '' });
          });
          lines.push({ type: 'system', text: `  Total fighters: ${data.length}` });
          lines.push({ type: 'system', text: '  Type \'fight <name> vs <name>\' to match any two fighters' });
          add(lines);
        }
      } catch {
        add([{ type: 'error', text: '  Failed to fetch fighters.' }]);
      }
      setProcessing(false);
      return;
    }

    if (lower === 'leaderboard') {
      setProcessing(true);
      try {
        const res = await fetch(`${API}/fighters`);
        const fighters: Fighter[] = await res.json();
        if (!fighters?.length) {
          add([{ type: 'output', text: '  No fighters ranked yet.' }]);
        } else {
          // Sort by wins
          const sorted = [...fighters].sort((a, b) => (b.win_count || 0) - (a.win_count || 0));
          
          const lines: Entry[] = [
            { type: 'fight', text: '  ═══════════════════════════════════════════════════════════════' },
            { type: 'fight', text: '                         🏆 LEADERBOARD 🏆                      ' },
            { type: 'fight', text: '  ═══════════════════════════════════════════════════════════════' },
            { type: 'output', text: '' },
          ];
          sorted.forEach((f, i) => {
            const xHandle = (f.metadata?.xHandle as string) || '@unknown';
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${String(i + 1).padStart(2)}.`;
            const wins = f.win_count || 0;
            const losses = (f.metadata?.losses as number) || 0;
            const total = wins + losses;
            const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
            
            lines.push({ 
              type: i < 3 ? 'fight' : 'output', 
              text: `   ${medal} ${f.name}` 
            });
            lines.push({ 
              type: 'system', 
              text: `      Creator: ${xHandle} | ${wins}W-${losses}L (${winRate}%)` 
            });
          });
          lines.push({ type: 'output', text: '' });
          lines.push({ type: 'fight', text: '  ═══════════════════════════════════════════════════════════════' });
          add(lines);
        }
      } catch {
        add([{ type: 'error', text: '  Failed to fetch leaderboard.' }]);
      }
      setProcessing(false);
      return;
    }

    if (lower === 'history') {
      setProcessing(true);
      try {
        const res = await fetch(`${API}/fights?limit=15`);
        const data = await res.json();
        if (!data?.length) {
          add([{ type: 'output', text: '  No fights recorded yet.' }]);
        } else {
          // Fetch fighter names from IDs
          const ids = new Set<string>();
          data.forEach((f: any) => {
            if (f.agent1_id) ids.add(f.agent1_id);
            if (f.agent2_id) ids.add(f.agent2_id);
          });
          let nameMap: Record<string, string> = {};
          if (supabase && ids.size > 0) {
            const { data: fighters } = await supabase.from('fighters').select('id, name').in('id', [...ids]);
            fighters?.forEach((f: any) => { nameMap[f.id] = f.name; });
          }

          const lines: Entry[] = [
            { type: 'fight', text: '  ═══════════════════════════════════════════════' },
            { type: 'fight', text: '                  FIGHT HISTORY                  ' },
            { type: 'fight', text: '  ═══════════════════════════════════════════════' },
          ];
          data.forEach((f: any) => {
            const a = nameMap[f.agent1_id] || 'Unknown';
            const b = nameMap[f.agent2_id] || 'Unknown';
            const winner = f.winner_id ? (nameMap[f.winner_id] || 'Unknown') : 'DRAW';
            const date = new Date(f.created_at).toLocaleDateString();
            lines.push({ type: 'output', text: `  ${a} vs ${b}` });
            lines.push({ type: 'fight', text: `  Winner: ${winner} via ${f.method} R${f.round}  —  ${date}` });
            lines.push({ type: 'system', text: '  ─────────────────────────────────────────────' });
          });
          add(lines);
        }
      } catch {
        add([{ type: 'error', text: '  Failed to fetch fight history.' }]);
      }
      setProcessing(false);
      return;
    }

    if (lower.startsWith('stats ')) {
      const name = raw.slice(6).trim();
      setProcessing(true);
      try {
        const res = await fetch(`${API}/fighters`);
        const all: Fighter[] = await res.json();
        const f = all.find(x => x.name.toLowerCase().includes(name.toLowerCase()));
        if (!f) {
          add([{ type: 'error', text: `  Fighter "${name}" not found. Check spelling or type 'fighters'.` }]);
        } else {
          const s = f.stats || {};
          const wins = f.win_count || 0;
          const total = f.metadata?.totalFights || 0;
          const losses = f.metadata?.losses || 0;
          const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
          add([
            { type: 'fight', text: `  ╔═══ ${f.name.toUpperCase()} ${'═'.repeat(Math.max(0, 38 - f.name.length))}╗` },
            { type: 'output', text: `  Record:   ${wins}W - ${losses}L  (${winRate}% win rate)` },
            { type: 'output', text: `  Fights:   ${total}` },
            { type: 'system', text: `  ─── STRIKING ─────────────────────────────────` },
            { type: 'output', text: `  Striking:  ${bar(s.striking || 50)} ${s.striking || 50}` },
            { type: 'output', text: `  Pch Speed: ${bar(s.punchSpeed || 50)} ${s.punchSpeed || 50}` },
            { type: 'output', text: `  Kick Pwr:  ${bar(s.kickPower || 50)} ${s.kickPower || 50}` },
            { type: 'output', text: `  Head Mov:  ${bar(s.headMovement || 50)} ${s.headMovement || 50}` },
            { type: 'system', text: `  ─── GRAPPLING ────────────────────────────────` },
            { type: 'output', text: `  Wrestling: ${bar(s.wrestling || 50)} ${s.wrestling || 50}` },
            { type: 'output', text: `  TDD:       ${bar(s.takedownDefense || 50)} ${s.takedownDefense || 50}` },
            { type: 'output', text: `  Subs:      ${bar(s.submissions || 50)} ${s.submissions || 50}` },
            { type: 'system', text: `  ─── PHYSICAL ─────────────────────────────────` },
            { type: 'output', text: `  Cardio:    ${bar(s.cardio || 50)} ${s.cardio || 50}` },
            { type: 'output', text: `  Chin:      ${bar(s.chin || 50)} ${s.chin || 50}` },
            { type: 'output', text: `  Recovery:  ${bar(s.recovery || 50)} ${s.recovery || 50}` },
            { type: 'fight', text: `  ╚${'═'.repeat(46)}╝` },
          ]);
        }
      } catch {
        add([{ type: 'error', text: '  Failed to fetch fighter stats.' }]);
      }
      setProcessing(false);
      return;
    }

    if (lower.startsWith('record ')) {
      const name = raw.slice(7).trim();
      setProcessing(true);
      try {
        const res = await fetch(`${API}/fighters`);
        const all: Fighter[] = await res.json();
        const fighter = all.find(x => x.name.toLowerCase().includes(name.toLowerCase()));
        if (!fighter) {
          add([{ type: 'error', text: `  Fighter "${name}" not found.` }]);
          setProcessing(false);
          return;
        }
        if (!supabase) {
          add([{ type: 'error', text: '  Database not connected.' }]);
          setProcessing(false);
          return;
        }
        const { data: fights } = await supabase
          .from('fights')
          .select('agent1_id, agent2_id, winner_id, method, round, created_at')
          .or(`agent1_id.eq.${fighter.id},agent2_id.eq.${fighter.id}`)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!fights?.length) {
          add([{ type: 'output', text: `  ${fighter.name} has no fights yet.` }]);
        } else {
          // Get opponent names
          const opponentIds = fights.map((f: any) =>
            f.agent1_id === fighter.id ? f.agent2_id : f.agent1_id
          ).filter(Boolean);
          const { data: opponents } = await supabase.from('fighters').select('id, name').in('id', opponentIds);
          const nameMap: Record<string, string> = {};
          opponents?.forEach((o: any) => { nameMap[o.id] = o.name; });

          const lines: Entry[] = [
            { type: 'fight', text: `  ═══ ${fighter.name.toUpperCase()} — FIGHT RECORD ═══` },
          ];
          fights.forEach((f: any) => {
            const oppId = f.agent1_id === fighter.id ? f.agent2_id : f.agent1_id;
            const opponent = nameMap[oppId] || 'Unknown';
            const won = f.winner_id === fighter.id;
            const isDraw = !f.winner_id;
            const result = isDraw ? 'D' : won ? 'W' : 'L';
            lines.push({
              type: won ? 'fight' : isDraw ? 'system' : 'error',
              text: `  [${result}] vs ${opponent} — ${f.method} R${f.round}`,
            });
          });
          add(lines);
        }
      } catch {
        add([{ type: 'error', text: '  Failed to fetch fight record.' }]);
      }
      setProcessing(false);
      return;
    }

    if (lower.startsWith('fight ') || lower === 'random') {
      let nameA: string, nameB: string;

      setProcessing(true);
      try {
        const res = await fetch(`${API}/fighters`);
        const all: Fighter[] = await res.json();

        if (lower === 'random') {
          if (all.length < 2) {
            add([{ type: 'error', text: '  Need at least 2 fighters. Type \'register\' to add more.' }]);
            setProcessing(false);
            return;
          }
          const shuffled = [...all].sort(() => Math.random() - 0.5);
          nameA = shuffled[0].name;
          nameB = shuffled[1].name;
        } else {
          const parts = raw.slice(6).trim().split(/\s+vs\s+|\s+v\s+|\s*,\s*/i);
          if (parts.length !== 2) {
            add([{ type: 'error', text: '  Usage: fight <name> vs <name>  OR  fight <name>, <name>' }]);
            setProcessing(false);
            return;
          }
          nameA = parts[0].trim();
          nameB = parts[1].trim();
        }

        const fA = all.find(x => x.name.toLowerCase().includes(nameA.toLowerCase()));
        const fB = all.find(x => x.name.toLowerCase().includes(nameB.toLowerCase()));

        if (!fA || !fB) {
          add([{ type: 'error', text: `  Could not find one or both fighters. Type 'fighters' to see roster.` }]);
          setProcessing(false);
          return;
        }
        if (fA.id === fB.id) {
          add([{ type: 'error', text: "  A fighter can't fight themselves!" }]);
          setProcessing(false);
          return;
        }

        add([
          { type: 'system', text: '' },
          { type: 'system', text: '  [MAIN EVENT]' },
          { type: 'fight', text: `  ${fA.name.toUpperCase()} VS ${fB.name.toUpperCase()}` },
          { type: 'system', text: '  [FIGHT STARTS]' },
          { type: 'output', text: '' },
        ]);

        const fightRes = await fetch(`${API}/fights`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fighter1_id: fA.id, fighter2_id: fB.id }),
        });
        const result = await fightRes.json();

        if (!fightRes.ok) {
          add([{ type: 'error', text: `  Fight failed: ${result.error || 'Unknown error'}` }]);
          setProcessing(false);
          return;
        }

        const lines: Entry[] = [];

        // Show fight log
        if (result.fight_log?.length) {
          result.fight_log.forEach((l: string) => {
            const isCritical = l.startsWith('>>');
            const isRound = l.startsWith('===');
            const isEnd = l.startsWith('--');
            
            if (isCritical) {
              lines.push({ type: 'fight', text: `  ${l}` });
            } else if (isRound || isEnd) {
              lines.push({ type: 'system', text: `  ${l}` });
            } else {
              lines.push({ type: 'output', text: `  ${l}` });
            }
          });
        }

        // Final result
        lines.push({ type: 'output', text: '' });
        lines.push({ type: 'system', text: '  [RESULT]' });
        lines.push({ type: 'fight', text: `  WINNER: ${result.winner || 'DRAW'}` });
        lines.push({ type: 'fight', text: `  METHOD: ${result.method}` });

        add(lines);
      } catch (e: any) {
        add([{ type: 'error', text: `  Fight error: ${e.message}` }]);
      }
      setProcessing(false);
      return;
    }

    add([{ type: 'error', text: `  Command not recognized: '${cmd}'. Type 'help'.` }]);
  }, [add]);

  const handleRegisterStep = useCallback(async (value: string) => {
    if (!registerMode) return;
    const { step, data } = registerMode;

    if (step === 'name') {
      if (value.length < 2 || value.length > 30) {
        add([{ type: 'error', text: '  Name must be 2-30 characters.' }]);
        return;
      }
      setRegisterMode({ step: 'xhandle', data: { ...data, name: value } });
      add([
        { type: 'output', text: `  Name: ${value}` },
        { type: 'output', text: '' },
        { type: 'output', text: '  Step 2/3: Enter your X (Twitter) handle:' },
        { type: 'output', text: '  (e.g., @elonmusk or elonmusk)' },
        { type: 'system', text: '  This links the fighter to you for the leaderboard.' },
      ]);
      return;
    }

    if (step === 'xhandle') {
      const xHandle = value.startsWith('@') ? value : `@${value}`;
      if (value.length < 2 || value.length > 20) {
        add([{ type: 'error', text: '  X handle must be 2-20 characters.' }]);
        return;
      }
      setRegisterMode({ step: 'archetype', data: { ...data, xHandle } });
      add([
        { type: 'output', text: `  X Handle: ${xHandle}` },
        { type: 'output', text: '' },
        { type: 'output', text: '  Step 3/3: Choose archetype:' },
        { type: 'output', text: '  [striker] [grappler] [balanced] [pressure] [counter]' },
        { type: 'system', text: '  Stats will be auto-assigned based on your choice.' },
      ]);
      return;
    }

    if (step === 'archetype') {
      const arch = value.toLowerCase();
      if (!ARCHETYPES[arch]) {
        add([{ type: 'error', text: `  Unknown archetype. Choose: striker, grappler, balanced, pressure, counter` }]);
        return;
      }

      const stats = ARCHETYPES[arch];
      setRegisterMode(null);
      add([
        { type: 'output', text: `  Archetype: ${arch}` },
        { type: 'system', text: '  Auto-assigned stats:' },
        { type: 'output', text: `    Striking: ${stats.striking} | Wrestling: ${stats.wrestling} | Cardio: ${stats.cardio}` },
        { type: 'output', text: `    Chin: ${stats.chin} | Recovery: ${stats.recovery} | Strength: ${stats.strength}` },
        { type: 'loading', text: '  Registering fighter...' },
      ]);

      try {
        const res = await fetch(`${API}/fighters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            stats: { ...stats, name: data.name },
            metadata: { xHandle: data.xHandle, totalFights: 0, losses: 0 },
          }),
        });
        const result = await res.json();

        if (!res.ok) {
          add([{ type: 'error', text: `  Registration failed: ${result.error}${result.details ? ' — ' + result.details.join(', ') : ''}` }]);
        } else {
          add([
            { type: 'fight', text: '' },
            { type: 'fight', text: `  ✅ ${data.name} has entered the arena!` },
            { type: 'output', text: `  Archetype: ${arch}` },
            { type: 'output', text: `  X Handle: ${data.xHandle}` },
            { type: 'output', text: `  ID: ${result.id}` },
            { type: 'output', text: '' },
            { type: 'system', text: '  📝 Stats were auto-assigned based on your archetype.' },
            { type: 'system', text: '  Type \'stats ' + data.name.toLowerCase() + '\' to see full breakdown.' },
            { type: 'output', text: '' },
            { type: 'output', text: `  Type 'fight ${data.name.toLowerCase()} vs <opponent>' to battle!` },
          ]);
        }
      } catch (e: any) {
        add([{ type: 'error', text: `  Registration error: ${e.message}` }]);
      }
    }
  }, [registerMode, add]);

  const handleSubmit = useCallback(() => {
    if (!input.trim() || processing) return;
    add([{ type: 'input', text: `❯ ${input}` }]);
    setCmdHistory(prev => [input, ...prev]);
    setHistoryIdx(-1);
    if (registerMode) {
      handleRegisterStep(input.trim());
    } else {
      process(input);
    }
    setInput('');
  }, [input, processing, registerMode, handleRegisterStep, process, add]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx < cmdHistory.length - 1) {
        const idx = historyIdx + 1;
        setHistoryIdx(idx);
        setInput(cmdHistory[idx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const idx = historyIdx - 1;
        setHistoryIdx(idx);
        setInput(cmdHistory[idx]);
      } else {
        setHistoryIdx(-1);
        setInput('');
      }
    } else if (e.key === 'Escape' && registerMode) {
      setRegisterMode(null);
      add([{ type: 'system', text: '  Registration cancelled.' }]);
    }
  };

  return (
    <div
      className="h-full bg-black flex flex-col scanline-overlay crt-flicker"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal body -- no header since App provides nav */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 pb-0 font-mono">
        {history.map((entry, i) => (
          <div
            key={i}
            className={`text-sm leading-relaxed whitespace-pre-wrap break-all ${
              entry.type === 'input'   ? 'text-orange-500 terminal-glow' :
              entry.type === 'fight'  ? 'text-orange-400 terminal-glow-strong' :
              entry.type === 'error'  ? 'status-error' :
              entry.type === 'loading'? 'text-zinc-500 animate-pulse' :
              entry.type === 'system' ? 'text-zinc-300' :
              'text-zinc-500'
            }`}
          >
            {entry.text}
          </div>
        ))}

        {/* Input line */}
        <div className="flex items-center gap-2 py-2 text-sm">
          <span className="text-orange-500 terminal-glow">
            {registerMode ? '»' : '❯'}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-orange-500 caret-orange-500 font-mono"
            autoFocus
            spellCheck={false}
            autoComplete="off"
            disabled={processing}
            placeholder={processing ? 'Processing...' : registerMode ? 'Type your answer...' : 'Type a command...'}
          />
        </div>
      </div>

      {/* Input hint */}
      <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-900 text-xs text-zinc-600 shrink-0">
        <span>Type 'help' for commands | 'about' for info | 'faq' for common questions</span>
      </div>
    </div>
  );
}
