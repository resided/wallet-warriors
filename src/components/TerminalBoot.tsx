// FightBook - Terminal Boot Sequence

import { useState, useEffect, useRef } from 'react';
import { Swords, ChevronRight } from 'lucide-react';

interface TerminalBootProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  { text: 'Initializing FightBook kernel...', delay: 420 },
  { text: 'Loading AI combat modules...', delay: 380 },
  { text: 'Mounting skills.md parser...', delay: 340 },
  { text: 'Connecting to fight arena...', delay: 420 },
  { text: 'Loading fighter database...', delay: 300 },
  { text: 'Calibrating damage algorithms...', delay: 360 },
  { text: 'Syncing leaderboard data...', delay: 240 },
  { text: 'All systems operational.', delay: 200 },
];

const BANNER = [
  '╔══════════════════════════════════════════════════════════════╗',
  '║                                                            ║',
  '║         ███████╗██╗ ██████╗ ██╗  ██╗████████╗            ║',
  '║         ██╔════╝██║██╔════╝ ██║  ██║╚══██╔══╝            ║',
  '║         █████╗  ██║██║  ███╗███████║   ██║               ║',
  '║         ██╔══╝  ██║██║   ██║██╔══██║   ██║               ║',
  '║         ██║     ██║╚██████╔╝██║  ██║   ██║               ║',
  '║         ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝               ║',
  '║                                                            ║',
  '║         ██████╗  ██████╗  ██████╗ ██╗  ██╗               ║',
  '║         ██╔══██╗██╔═══██╗██╔═══██╗██║ ██╔╝               ║',
  '║         ██████╔╝██║   ██║██║   ██║█████╔╝                ║',
  '║         ██╔══██╗██║   ██║██║   ██║██╔═██╗                ║',
  '║         ██████╔╝╚██████╔╝╚██████╔╝██║  ██╗               ║',
  '║         ╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝               ║',
  '║                                                            ║',
  '╚══════════════════════════════════════════════════════════════╝',
];

export default function TerminalBoot({ onComplete }: TerminalBootProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'booting' | 'banner' | 'ready'>('booting');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, phase]);

  // Boot lines
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let idx = 0;

    const addNext = () => {
      if (idx >= BOOT_LINES.length) {
        setPhase('banner');
        return;
      }
      const entry = BOOT_LINES[idx];
      setLines(prev => [...prev, entry.text]);
      setProgress(Math.round(((idx + 1) / BOOT_LINES.length) * 75));
      idx++;
      timeout = setTimeout(addNext, entry.delay);
    };

    timeout = setTimeout(addNext, 300);
    return () => clearTimeout(timeout);
  }, []);

  // Banner reveal
  useEffect(() => {
    if (phase !== 'banner') return;

    let i = 0;
    const interval = setInterval(() => {
      setProgress(75 + Math.round((i / BANNER.length) * 25));
      i++;
      if (i > BANNER.length) {
        clearInterval(interval);
        setProgress(100);
        setPhase('ready');
      }
    }, 55);

    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center px-4 scanline-overlay crt-flicker">
      <div className="w-full max-w-2xl">
        <div className="border border-zinc-800 rounded-sm overflow-hidden shadow-2xl">

          {/* Title bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-sm">❯_</span>
              <span className="text-sm text-zinc-300 font-mono">fightbook_boot.sh</span>
            </div>
            <button
              onClick={onComplete}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              [skip]
            </button>
          </div>

          {/* Terminal body */}
          <div
            ref={scrollRef}
            className="p-4 sm:p-6 font-mono text-sm min-h-[300px] max-h-[60vh] overflow-y-auto bg-black"
          >
            {/* Boot lines */}
            {lines.map((line, i) => (
              <div key={i} className="text-zinc-500 mb-1">{line}</div>
            ))}

            {/* Progress bar */}
            {progress > 0 && (
              <div className="my-4">
                <div className="h-px bg-zinc-900 rounded-full overflow-hidden progress-glow">
                  <div
                    className="h-full bg-orange-500 transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* ASCII banner */}
            {phase !== 'booting' && (
              <div className="mt-2 overflow-x-auto">
                {BANNER.map((line, i) => (
                  <div
                    key={i}
                    className="text-xs leading-none text-orange-500 terminal-glow-strong whitespace-pre"
                  >
                    {line}
                  </div>
                ))}
              </div>
            )}

            {/* Blinking cursor while loading */}
            {phase !== 'ready' && (
              <span className="inline-block w-2 h-3.5 bg-orange-500 cursor-blink-block mt-2 ml-1" />
            )}

            {/* Enter prompt */}
            {phase === 'ready' && (
              <div className="mt-6">
                <div className="text-zinc-500 mb-3 text-xs">System ready. Enter arena.</div>
                <button
                  onClick={onComplete}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black text-sm font-bold transition-colors"
                >
                  <Swords className="w-4 h-4" />
                  ENTER ARENA
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900 border-t border-zinc-800 text-xs text-zinc-600">
            <div className="flex items-center gap-3">
              <span>v1.1.17</span>
              <span className="text-zinc-700">|</span>
              <span className="flex items-center gap-1">
                <span className="status-online">●</span>
                <span>Online</span>
              </span>
            </div>
            <span>{progress}% loaded</span>
          </div>

        </div>
      </div>
    </div>
  );
}
