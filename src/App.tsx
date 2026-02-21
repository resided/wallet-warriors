import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import TerminalCLI from '@/components/TerminalCLI';
import { FighterRoster } from '@/components/FighterRoster';
import { FighterCreator } from '@/components/FighterCreator';
import { Terminal, LayoutGrid, Trophy, Plus } from 'lucide-react';

type ViewMode = 'cli' | 'roster' | 'leaderboard' | 'create';

function App() {
  const [view, setView] = useState<ViewMode>('cli');
  const [showCreator, setShowCreator] = useState(false);

  // Listen for creator open from CLI
  useEffect(() => {
    const handleOpenCreator = () => {
      setShowCreator(true);
    };
    window.addEventListener('openFighterCreator', handleOpenCreator);
    return () => window.removeEventListener('openFighterCreator', handleOpenCreator);
  }, []);

  const handleCreateFighter = async (fighter: {
    name: string;
    nickname: string;
    templateId: string;
    stats: { striking: number; grappling: number; stamina: number; power: number; chin: number; speed: number };
  }) => {
    try {
      const res = await fetch('/api/fighters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fighter.name,
          stats: fighter.stats,
          metadata: {
            nickname: fighter.nickname,
            templateId: fighter.templateId,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to create fighter');
        return;
      }

      const data = await res.json();
      toast.success(`${fighter.name} has entered the arena!`);
      setShowCreator(false);
      setView('roster');
    } catch (e) {
      toast.error('Network error');
    }
  };

  if (showCreator) {
    return (
      <FighterCreator
        onComplete={handleCreateFighter}
        onCancel={() => setShowCreator(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-bold text-xl">FB</span>
              <span className="font-bold text-white tracking-wider">FIGHTBOOK</span>
            </div>

            {/* Nav Tabs */}
            <nav className="flex items-center gap-1">
              <NavButton
                active={view === 'cli'}
                onClick={() => setView('cli')}
                icon={<Terminal className="w-4 h-4" />}
                label="TERMINAL"
              />
              <NavButton
                active={view === 'roster'}
                onClick={() => setView('roster')}
                icon={<LayoutGrid className="w-4 h-4" />}
                label="ROSTER"
              />
              <NavButton
                active={view === 'leaderboard'}
                onClick={() => setView('leaderboard')}
                icon={<Trophy className="w-4 h-4" />}
                label="RANKINGS"
              />
              <button
                onClick={() => setShowCreator(true)}
                className="flex items-center gap-2 px-4 py-2 ml-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded"
              >
                <Plus className="w-4 h-4" />
                CREATE
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {view === 'cli' && <TerminalCLI />}
        {view === 'roster' && (
          <div className="h-full p-6 max-w-7xl mx-auto overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">FIGHTER ROSTER</h1>
                <p className="text-zinc-500 text-sm">All registered fighters in the arena</p>
              </div>
              <button
                onClick={() => setShowCreator(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded"
              >
                <Plus className="w-4 h-4" />
                CREATE FIGHTER
              </button>
            </div>
            <FighterRoster />
          </div>
        )}
        {view === 'leaderboard' && (
          <div className="h-full p-6 max-w-7xl mx-auto overflow-y-auto">
            <h1 className="text-2xl font-bold text-white mb-6">LEADERBOARD</h1>
            <LeaderboardView />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4 text-zinc-500">
              <span>$FIGHT:</span>
              <span className="font-mono hidden sm:inline">0xfC01...2a1b07</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('0xfC01A7760CfE6a3f4D2635f0BdCaB992DB2a1b07');
                  toast.success('Copied');
                }}
                className="text-zinc-600 hover:text-zinc-300"
              >
                [COPY]
              </button>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://x.com/0xreside" target="_blank" rel="noopener" className="text-zinc-500 hover:text-zinc-300">@0xRESIDE</a>
              <a href="https://github.com/resided/fightbook" target="_blank" rel="noopener" className="text-zinc-500 hover:text-zinc-300">GITHUB</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors ${
        active ? 'text-red-400 border-b-2 border-red-500' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function LeaderboardView() {
  const [fighters, setFighters] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/fighters')
      .then((r) => r.json())
      .then((data) => {
        const sorted = (data || []).sort((a: any, b: any) => (b.win_count || 0) - (a.win_count || 0));
        setFighters(sorted);
      });
  }, []);

  return (
    <div className="border border-zinc-800 bg-black">
      <div className="divide-y divide-zinc-800">
        {fighters.map((f, i) => {
          const total = (f.win_count || 0) + (f.metadata?.losses || 0);
          const winRate = total > 0 ? Math.round(((f.win_count || 0) / total) * 100) : 0;

          return (
            <div key={f.id} className="flex items-center gap-6 p-6 hover:bg-zinc-900/30 transition-colors">
              <div className="text-3xl font-bold text-zinc-700 w-16">
                {i < 3 ? ['#1', '#2', '#3'][i] : `#${i + 1}`}
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-zinc-800 border-2 border-red-500/30 flex items-center justify-center text-2xl font-bold">
                {f.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{f.name}</h3>
                {f.metadata?.nickname && <p className="text-sm text-red-400">"{f.metadata.nickname}"</p>}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{f.win_count || 0}</div>
                <div className="text-sm text-zinc-500">WINS</div>
              </div>
              <div className="text-right w-20">
                <div className="text-lg font-bold text-zinc-400">{winRate}%</div>
                <div className="text-xs text-zinc-600">WIN RATE</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
