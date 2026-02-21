import { useState } from 'react';
import { toast } from 'sonner';
import Landing from '@/pages/Landing';
import TerminalBoot from '@/components/TerminalBoot';
import TerminalCLI from '@/components/TerminalCLI';

type View = 'landing' | 'arena';

function App() {
  const [view, setView] = useState<View>('landing');
  const [showBoot, setShowBoot] = useState(() => {
    return !localStorage.getItem('fightbook_boot_complete');
  });

  const handleEnter = () => setView('arena');

  const handleBootComplete = () => {
    setShowBoot(false);
    localStorage.setItem('fightbook_boot_complete', 'true');
  };

  // Boot sequence (first visit only)
  if (showBoot) {
    return (
      <TerminalBoot
        onComplete={() => {
          handleBootComplete();
          setView('arena');
        }}
      />
    );
  }

  // Landing page
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col scanline-overlay crt-flicker">
        <div className="flex-1">
          <Landing onEnter={handleEnter} />
        </div>
        <footer className="border-t border-zinc-800">
          <div className="max-w-6xl mx-auto px-4 py-3 space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
              <span className="text-zinc-600">$FIGHT on Base:</span>
              <span className="font-mono text-zinc-400 hidden sm:inline">0xfC01A7760CfE6a3f4D2635f0BdCaB992DB2a1b07</span>
              <span className="font-mono text-zinc-400 sm:hidden">0xfC01…2a1b07</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('0xfC01A7760CfE6a3f4D2635f0BdCaB992DB2a1b07');
                  toast.success('Contract address copied');
                }}
                className="text-zinc-600 hover:text-zinc-300 transition-colors"
                title="Copy contract address"
              >
                [copy]
              </button>
            </div>
            <div className="flex items-center justify-end text-xs text-zinc-600 gap-4">
              <a href="https://x.com/0xreside" target="_blank" rel="noopener">@0xreside</a>
              <span className="text-zinc-700">|</span>
              <a href="https://github.com/resided/fightbook" target="_blank" rel="noopener">github</a>
              <span className="text-zinc-700">|</span>
              <span>skills.md powered</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Arena — full-screen terminal
  return <TerminalCLI />;
}

export default App;
