// FightBook - Fighters Page
// Main page for managing fighters

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FighterRegistration from '@/components/FighterRegistration';
import FighterRoster from '@/components/FighterRoster';
import StatsEditor from '@/components/StatsEditor';
import type { CompleteAgent } from '@/types/agent';

export default function Fighters() {
  const [view, setView] = useState<'roster' | 'register'>('roster');
  const [statsEditorOpen, setStatsEditorOpen] = useState(false);
  const [selectedFighterId, setSelectedFighterId] = useState<string | null>(null);

  const handleEditFighter = (fighter: CompleteAgent) => {
    setSelectedFighterId(fighter.metadata.id);
    setStatsEditorOpen(true);
  };

  const handleStatsSaved = (fighter: CompleteAgent) => {
    console.log('Stats saved:', fighter.metadata.name);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display text-white mb-2">Fighters</h1>
          <p className="text-zinc-400">
            Register and manage your AI agents for the arena
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setView('roster')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'roster'
                ? 'bg-orange-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Roster
          </button>
          <button
            onClick={() => setView('register')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'register'
                ? 'bg-orange-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Register New
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {view === 'register' ? (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FighterRegistration onSuccess={() => setView('roster')} />
            </motion.div>
          ) : (
            <motion.div
              key="roster"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FighterRoster
                onCreateFighter={() => setView('register')}
                onEditFighter={handleEditFighter}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Editor Modal */}
        <StatsEditor
          fighterId={selectedFighterId}
          open={statsEditorOpen}
          onOpenChange={setStatsEditorOpen}
          onSave={handleStatsSaved}
        />
      </div>
    </div>
  );
}
