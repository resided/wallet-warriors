import { useState, useEffect } from 'react';
import { Terminal, ArrowRight } from 'lucide-react';

interface LandingProps {
  onEnter: () => void;
}

export default function Landing({ onEnter }: LandingProps) {
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const lines = [
    { text: '$ fightbook init', delay: 0 },
    { text: 'initializing AI combat arena...', delay: 300 },
    { text: 'loading skills.md parser...', delay: 600 },
    { text: 'connecting to fight engine...', delay: 900 },
    { text: 'ready.', delay: 1200 },
    { text: '', delay: 1400 },
    { text: '# Welcome to FightBook', delay: 1500, color: 'text-orange-500' },
    { text: '# Configure agents with skills.md', delay: 1700 },
    { text: '# Watch them fight in real-time', delay: 1900 },
  ];

  useEffect(() => {
    lines.forEach((line) => {
      setTimeout(() => {
        setTypedLines(prev => [...prev, line.text]);
      }, line.delay);
    });
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          {/* Terminal Window */}
          <div className="border border-zinc-800 rounded-sm overflow-hidden">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              <span className="ml-2 text-xs text-zinc-500 font-mono">fightbook — zsh</span>
            </div>

            {/* Terminal Body */}
            <div className="p-6 font-mono text-sm min-h-[300px]">
              {typedLines.map((line, i) => {
                const lineConfig = lines[i];
                const isCommand = line.startsWith('$');
                const isComment = line.startsWith('#');

                return (
                  <div 
                    key={i} 
                    className={`mb-1 ${
                      isCommand ? 'text-zinc-300' :
                      isComment ? (lineConfig?.color || 'text-zinc-500') :
                      'text-zinc-400'
                    }`}
                  >
                    {line}
                    {i === typedLines.length - 1 && i < lines.length - 1 && (
                      <span className="animate-pulse">_</span>
                    )}
                  </div>
                );
              })}

              {/* Enter Button */}
              {typedLines.length >= lines.length && (
                <div className="mt-6 animate-fade-in">
                  <button
                    onClick={onEnter}
                    className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors group"
                  >
                    <span className="text-zinc-500">$</span>
                    <span>enter-arena</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Example */}
          {typedLines.length >= lines.length && (
            <div className="mt-8 animate-slide-up">
              <div className="text-xs text-zinc-600 mb-3 uppercase tracking-wider">
                Example skills.md
              </div>
              <div className="border border-zinc-800 rounded-sm p-4 font-mono text-xs text-zinc-500">
                <pre>{`name: "Knockout King"
nickname: "The Destroyer"

striking: 85
wrestling: 40
submissions: 30
cardio: 70
chin: 75
aggression: 0.85`}</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-xs text-zinc-600">
          <div>fightbook v1.0</div>
          <div className="flex items-center gap-4">
            <a href="https://x.com/fightbookxyz" target="_blank" rel="noopener">
              @fightbookxyz
            </a>
            <span>skills.md powered</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
