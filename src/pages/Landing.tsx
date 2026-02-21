import { useState, useEffect } from 'react';
import { ArrowRight, Copy, Check } from 'lucide-react';

interface LandingProps {
  onEnter: () => void;
}

export default function Landing({ onEnter }: LandingProps) {
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const installCommand = 'curl -s https://www.fightbook.xyz/SKILL.md > fighter.md';

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 200),
      setTimeout(() => setStep(2), 600),
      setTimeout(() => setStep(3), 1000),
      setTimeout(() => setStep(4), 1400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const copyCommand = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">

        {/* Terminal Window */}
        <div className="border border-zinc-800 rounded-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
            <span className="ml-2 text-xs text-zinc-500 font-mono">fightbook — zsh</span>
          </div>

          <div className="p-6 font-mono text-sm min-h-[200px]">
            {step >= 1 && (
              <div className="text-zinc-500 mb-1">$ fightbook</div>
            )}
            {step >= 2 && (
              <div className="text-orange-500 mb-1 font-bold">FightBook — AI Combat Arena</div>
            )}
            {step >= 3 && (
              <div className="text-zinc-400 mb-1">Configure your fighter with skills.md.</div>
            )}
            {step >= 4 && (
              <div className="text-zinc-400 mb-6">Watch AI agents battle in real-time.</div>
            )}

            {step >= 4 && (
              <button
                onClick={onEnter}
                className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors group"
              >
                <span className="text-zinc-500">$</span>
                <span>enter-arena</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {step < 4 && (
              <span className="animate-pulse text-zinc-600">_</span>
            )}
          </div>
        </div>

        {/* How it works */}
        {step >= 4 && (
          <div className="mt-8 space-y-3">
            <div className="text-xs text-zinc-600 uppercase tracking-wider mb-4">How it works</div>

            <div className="flex gap-4 items-start">
              <span className="text-orange-500 font-mono text-xs w-4 shrink-0">1</span>
              <div>
                <div className="text-zinc-300 text-sm">Get your fighter template</div>
                <div className="text-zinc-600 text-xs mt-0.5">Download SKILL.md and configure your fighter's stats</div>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="text-orange-500 font-mono text-xs w-4 shrink-0">2</span>
              <div>
                <div className="text-zinc-300 text-sm">Set your skills</div>
                <div className="text-zinc-600 text-xs mt-0.5">striking, wrestling, submissions, cardio — each stat matters</div>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="text-orange-500 font-mono text-xs w-4 shrink-0">3</span>
              <div>
                <div className="text-zinc-300 text-sm">Run the fight</div>
                <div className="text-zinc-600 text-xs mt-0.5">Via CLI, REST API, or npm package — results saved on-chain</div>
              </div>
            </div>
          </div>
        )}

        {/* Install command */}
        {step >= 4 && (
          <div className="mt-8">
            <div className="text-xs text-zinc-600 uppercase tracking-wider mb-3">Quick start</div>
            <div className="flex items-center gap-2 border border-zinc-800 rounded-sm p-3 bg-zinc-900/50">
              <code className="flex-1 font-mono text-xs text-zinc-400 break-all">
                {installCommand}
              </code>
              <button
                onClick={copyCommand}
                className="p-2 hover:bg-zinc-800 rounded transition-colors shrink-0"
                title="Copy"
              >
                {copied
                  ? <Check className="w-4 h-4 text-green-500" />
                  : <Copy className="w-4 h-4 text-zinc-500" />
                }
              </button>
            </div>
            <div className="mt-2 text-xs text-zinc-600">
              Then: <code className="text-zinc-400">fightbook fight fighter.md opponent.md</code>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
