// FightBook - Visual Rankings / Leaderboard

import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  win_count: number;
  total_fights: number;
  losses: number;
}

export default function VisualLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/leaderboard?limit=25')
      .then(r => r.json())
      .then(data => { setEntries(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError('Failed to load rankings'); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-black flex items-center justify-center font-mono">
        <span className="text-zinc-600 animate-pulse text-sm">Loading rankings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-black flex items-center justify-center font-mono">
        <span className="status-error text-sm">{error}</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex-1 bg-black flex flex-col items-center justify-center font-mono text-center p-8">
        <div className="text-zinc-800 text-5xl mb-4 font-black">—</div>
        <div className="text-zinc-400 uppercase tracking-[0.2em] text-sm mb-2">No Fighters Ranked</div>
        <div className="text-zinc-600 text-xs">Fight results will populate the rankings automatically.</div>
      </div>
    );
  }

  const champion = entries[0];
  const contenders = entries.slice(1);

  return (
    <div className="flex-1 bg-black overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-600 mb-1">Official</div>
              <h1 className="text-4xl font-black uppercase tracking-[0.1em] text-white">Rankings</h1>
            </div>
            <div className="text-right font-mono text-xs text-zinc-600 pb-1">
              <div>{entries.length} ranked</div>
              <div className="flex items-center gap-1.5 justify-end mt-1">
                <span className="status-online">●</span>
                <span>Live</span>
              </div>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-orange-500 via-orange-500/30 to-transparent" />
        </div>

        {/* Champion */}
        <div className="mb-10">
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-amber-500/70 mb-4">
            ★ Undisputed Champion
          </div>
          <div className="relative border border-amber-500/40 bg-gradient-to-r from-amber-500/8 to-transparent overflow-hidden">
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />

            <div className="px-6 py-6 ml-1">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-baseline gap-5 min-w-0">
                  <span className="text-6xl font-black text-amber-500/15 font-mono leading-none shrink-0">#1</span>
                  <div className="min-w-0">
                    <div
                      className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-white truncate"
                      style={{ textShadow: '0 0 30px rgba(245, 158, 11, 0.25)' }}
                    >
                      {champion.name}
                    </div>
                    <div className="text-xs font-mono text-amber-500/50 uppercase tracking-widest mt-1">
                      {champion.total_fights > 0 ? `${champion.total_fights} professional fights` : 'Undefeated'}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono shrink-0">
                  <div className="flex items-baseline gap-2 justify-end">
                    <span className="text-4xl font-black text-green-400 leading-none">{champion.win_count}</span>
                    <span className="text-sm text-zinc-600 self-end pb-1">W</span>
                    <span className="text-4xl font-black text-red-500/80 leading-none">{champion.losses}</span>
                    <span className="text-sm text-zinc-600 self-end pb-1">L</span>
                  </div>
                  {champion.total_fights > 0 && (
                    <div className="text-xs text-amber-500/50 mt-1">
                      {Math.round((champion.win_count / champion.total_fights) * 100)}% finish rate
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenders */}
        {contenders.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-600">Contenders</div>
              <div className="flex-1 h-px bg-zinc-900" />
            </div>

            <div className="border border-zinc-900">
              {contenders.map((f, idx) => (
                <div
                  key={f.id}
                  className={`flex items-center justify-between px-5 py-3.5 group transition-colors hover:bg-zinc-900/60 ${
                    idx < contenders.length - 1 ? 'border-b border-zinc-900' : ''
                  }`}
                >
                  <div className="flex items-center gap-5 min-w-0">
                    {/* Rank */}
                    <span className="text-zinc-700 font-mono text-sm w-6 text-right shrink-0 group-hover:text-zinc-500 transition-colors">
                      {f.rank}
                    </span>

                    {/* Name + fights */}
                    <div className="min-w-0">
                      <div className="font-bold uppercase tracking-wide text-zinc-200 group-hover:text-white transition-colors truncate">
                        {f.name}
                      </div>
                      {f.total_fights > 0 && (
                        <div className="text-xs font-mono text-zinc-700 mt-0.5">{f.total_fights} fights</div>
                      )}
                    </div>
                  </div>

                  {/* Record */}
                  <div className="flex items-center gap-3 font-mono text-sm shrink-0 ml-4">
                    <span className="text-green-400 font-bold">{f.win_count}W</span>
                    <span className="text-zinc-800">·</span>
                    <span className="text-red-500/80">{f.losses}L</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
