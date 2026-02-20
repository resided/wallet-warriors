import { useState } from 'react';
import { Upload, Swords, Trash2, Edit2, User, Trophy } from 'lucide-react';
import type { CompleteAgent } from '@/types/agent';
import { calculateOverallRating, detectArchetype } from '@/types/agent';

interface TerminalRosterProps {
  agents: CompleteAgent[];
  currentAgent: CompleteAgent | null;
  onCreate: () => void;
  onEdit: (agent: CompleteAgent) => void;
  onDelete: (id: string) => void;
  onSelect: (agent: CompleteAgent) => void;
  onFight: (agent1: CompleteAgent, agent2: CompleteAgent) => void;
  onImport: (content: string) => void;
}

export default function TerminalRoster({
  agents,
  currentAgent,
  onCreate,
  onEdit,
  onDelete,
  onSelect,
  onFight,
  onImport,
}: TerminalRosterProps) {
  const [selectedForFight, setSelectedForFight] = useState<CompleteAgent | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const handleSelectForFight = (agent: CompleteAgent) => {
    if (selectedForFight?.metadata.id === agent.metadata.id) {
      setSelectedForFight(null);
    } else if (selectedForFight) {
      onFight(selectedForFight, agent);
      setSelectedForFight(null);
    } else {
      setSelectedForFight(agent);
    }
  };

  const handleImport = () => {
    if (importText.trim()) {
      onImport(importText);
      setImportText('');
      setShowImport(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onImport(content);
      };
      reader.readAsText(file);
    }
  };

  if (agents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-20 border border-zinc-800 rounded-sm">
          <div className="text-zinc-600 mb-4">No agents found</div>
          <div className="text-sm text-zinc-500 mb-6">
            Create your first AI fighter or import from skills.md
          </div>
          <div className="flex items-center justify-center gap-3">
            <button 
              onClick={onCreate}
              className="btn-minimal text-orange-500 border-orange-500/50"
            >
              create agent
            </button>
            <label className="btn-minimal cursor-pointer">
              <Upload className="w-4 h-4 inline mr-2" />
              import skills.md
              <input 
                type="file" 
                accept=".md,.txt" 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* Quick Start Template */}
        <div className="border border-zinc-800 rounded-sm">
          <div className="terminal-header">
            <span className="text-xs text-zinc-500">quick_start_template.md</span>
          </div>
          <div className="terminal-body text-xs">
            <pre className="text-zinc-400">
{`# Copy this, save as skills.md, and import

name: "My Fighter"
nickname: "The Destroyer"

# Striking
striking: 75
punch_speed: 80
kick_power: 70
head_movement: 65

# Grappling
wrestling: 60
takedown_defense: 70
submissions: 45

# Physical
cardio: 80
chin: 75

# Mental
aggression: 0.7
fight_iq: 70`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="text-zinc-500 text-sm">
          {agents.length} fighter{agents.length !== 1 ? 's' : ''} in roster
        </div>
        <div className="flex items-center gap-2">
          {selectedForFight && (
            <span className="text-sm text-orange-500">
              Select opponent for <strong>{selectedForFight.skills.name}</strong>
            </span>
          )}
          <button 
            onClick={() => setShowImport(!showImport)}
            className="btn-minimal text-zinc-400"
          >
            <Upload className="w-4 h-4 inline mr-2" />
            import
          </button>
          <button 
            onClick={onCreate}
            className="btn-minimal text-orange-500"
          >
            + new agent
          </button>
        </div>
      </div>

      {/* Import Panel */}
      {showImport && (
        <div className="border border-zinc-800 rounded-sm p-4 animate-fade-in">
          <div className="text-sm text-zinc-500 mb-3">
            Paste skills.md content or upload file
          </div>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="# Paste your skills.md here..."
            className="w-full h-32 bg-black border border-zinc-800 rounded-sm p-3 text-sm font-mono resize-none mb-3"
          />
          <div className="flex items-center gap-2">
            <button 
              onClick={handleImport}
              disabled={!importText.trim()}
              className="btn-minimal text-orange-500 disabled:opacity-50"
            >
              import
            </button>
            <label className="btn-minimal cursor-pointer">
              upload file
              <input 
                type="file" 
                accept=".md,.txt" 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </label>
            <button 
              onClick={() => setShowImport(false)}
              className="btn-minimal text-zinc-500"
            >
              cancel
            </button>
          </div>
        </div>
      )}

      {/* Agent List */}
      <div className="border border-zinc-800 rounded-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-zinc-900 text-xs text-zinc-500 uppercase tracking-wider">
          <div className="col-span-4">Agent</div>
          <div className="col-span-2">Record</div>
          <div className="col-span-2">Rating</div>
          <div className="col-span-2">Archetype</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {agents.map((agent) => {
          const isCurrent = currentAgent?.metadata.id === agent.metadata.id;
          const isSelected = selectedForFight?.metadata.id === agent.metadata.id;
          const record = `${agent.metadata.wins}-${agent.metadata.losses}-${agent.metadata.draws}`;
          const rating = calculateOverallRating(agent.skills);
          const archetype = detectArchetype(agent.skills);

          return (
            <div 
              key={agent.metadata.id}
              className={`grid grid-cols-12 gap-4 px-4 py-3 border-t border-zinc-800 items-center hover:bg-zinc-900/30 transition-colors ${
                isSelected ? 'bg-orange-500/10 border-orange-500/30' : ''
              }`}
            >
              {/* Agent Name */}
              <div className="col-span-4">
                <div className="flex items-center gap-2">
                  {isCurrent && (
                    <span className="text-orange-500" title="Active">●</span>
                  )}
                  <div>
                    <div className="font-medium">{agent.skills.name}</div>
                    <div className="text-xs text-zinc-500">
                      "{agent.skills.nickname}"
                    </div>
                  </div>
                </div>
              </div>

              {/* Record */}
              <div className="col-span-2 font-mono text-sm">
                <span className="text-green-500">{agent.metadata.wins}</span>
                <span className="text-zinc-600">-</span>
                <span className="text-red-500">{agent.metadata.losses}</span>
                <span className="text-zinc-600">-</span>
                <span className="text-zinc-500">{agent.metadata.draws}</span>
              </div>

              {/* Rating */}
              <div className="col-span-2 font-mono text-sm">
                {rating}
              </div>

              {/* Archetype */}
              <div className="col-span-2">
                <span className="text-xs text-zinc-400 capitalize">{archetype}</span>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-1">
                <button
                  onClick={() => onSelect(agent)}
                  className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                  title="Set Active"
                >
                  <User className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSelectForFight(agent)}
                  className={`p-1.5 transition-colors ${
                    isSelected ? 'text-orange-500' : 'text-zinc-500 hover:text-white'
                  }`}
                  title={isSelected ? 'Cancel' : 'Select for Fight'}
                >
                  <Swords className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(agent)}
                  className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(agent.metadata.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Commands */}
      <div className="text-xs text-zinc-600 pt-4 border-t border-zinc-800">
        <span className="text-zinc-500">Commands:</span>
        {' '}Click <Swords className="w-3 h-3 inline" /> on two agents to start a fight
        {' '}|{' '}
        <span className="text-orange-500">●</span> marks your active agent
      </div>
    </div>
  );
}
