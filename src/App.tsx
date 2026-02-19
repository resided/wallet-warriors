import { useState, useEffect } from 'react';
import type { CompleteAgent } from '@/types/agent';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Loader2, Plus, Users } from 'lucide-react';
import OnboardingFlow from '@/components/OnboardingFlow';
import AgentRoster from '@/components/AgentRoster';
import TextFight from '@/components/TextFight';
import SkillsEditor from '@/components/SkillsEditor';
import Landing from '@/pages/Landing';
import { 
  isOnboardingComplete, 
  setOnboardingComplete,
  getAllAgents,
  getCurrentAgent,
  setCurrentAgent,
} from '@/lib/storage';

type View = 'landing' | 'roster' | 'create' | 'edit' | 'fight' | 'profile';

function App() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('landing');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [currentAgent, setCurrentAgentState] = useState<CompleteAgent | null>(null);
  const [editingAgent, setEditingAgent] = useState<CompleteAgent | null>(null);
  const [fightingAgents, setFightingAgents] = useState<[CompleteAgent, CompleteAgent] | null>(null);

  useEffect(() => {
    // Check if user has agents or has completed onboarding
    const agents = getAllAgents();
    const completed = isOnboardingComplete();
    const current = getCurrentAgent();
    
    setHasCompletedOnboarding(completed || agents.length > 0);
    setCurrentAgentState(current);
    setLoading(false);
  }, []);

  const handleEnter = () => {
    if (hasCompletedOnboarding) {
      setView('roster');
    } else {
      setView('create');
    }
  };

  const handleOnboardingComplete = (agent: CompleteAgent) => {
    setOnboardingComplete(true);
    setHasCompletedOnboarding(true);
    setCurrentAgentState(agent);
    setView('roster');
  };

  const handleCreateAgent = () => {
    setEditingAgent(null);
    setView('create');
  };

  const handleEditAgent = (agent: CompleteAgent) => {
    setEditingAgent(agent);
    setView('edit');
  };

  const handleSelectAgent = (agent: CompleteAgent) => {
    setCurrentAgent(agent);
    setCurrentAgentState(agent);
  };

  const handleFight = (agent1: CompleteAgent, agent2: CompleteAgent) => {
    setFightingAgents([agent1, agent2]);
    setView('fight');
  };

  const handleFightComplete = () => {
    const current = getCurrentAgent();
    setCurrentAgentState(current);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Landing Page
  if (view === 'landing') {
    return <Landing onEnter={handleEnter} />;
  }

  // Onboarding
  if (!hasCompletedOnboarding && view === 'create') {
    return (
      <OnboardingFlow 
        onComplete={handleOnboardingComplete}
        onSkip={() => setHasCompletedOnboarding(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div 
              className="flex items-center gap-4 cursor-pointer group"
              onClick={() => setView('roster')}
            >
              <img 
                src="/logo.png" 
                alt="FightBook" 
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </div>

            <nav className="flex items-center gap-2">
              <button
                onClick={() => setView('roster')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'roster' 
                    ? 'bg-orange-500 text-black' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                Roster
              </button>
              <button
                onClick={handleCreateAgent}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Agent
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {view === 'roster' && (
              <motion.div
                key="roster"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AgentRoster
                  onCreateAgent={handleCreateAgent}
                  onEditAgent={handleEditAgent}
                  onSelectAgent={handleSelectAgent}
                  onFight={handleFight}
                />
              </motion.div>
            )}

            {view === 'create' && (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <CreateAgentView 
                  onComplete={() => setView('roster')}
                  onCancel={() => setView('roster')}
                />
              </motion.div>
            )}

            {view === 'edit' && editingAgent && (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <EditAgentView 
                  agent={editingAgent}
                  onComplete={() => setView('roster')}
                  onCancel={() => setView('roster')}
                />
              </motion.div>
            )}

            {view === 'fight' && fightingAgents && (
              <motion.div
                key="fight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50"
              >
                <TextFight
                  agent1={fightingAgents[0]}
                  agent2={fightingAgents[1]}
                  onFightComplete={handleFightComplete}
                  onBack={() => setView('roster')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Create Agent View
function CreateAgentView({ onComplete, onCancel }: { onComplete: () => void; onCancel: () => void }) {
  const [agent, setAgent] = useState<CompleteAgent | null>(null);

  useEffect(() => {
    const newAgent: CompleteAgent = {
      metadata: {
        id: `agent_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
        totalFights: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        kos: 0,
        submissions: 0,
        currentStreak: 0,
        bestStreak: 0,
        ranking: 1000,
        earnings: 0,
        xp: 0,
        level: 1,
      },
      skills: {
        name: '',
        nickname: 'The Prospect',
        striking: 50,
        punchSpeed: 50,
        kickPower: 50,
        headMovement: 50,
        footwork: 50,
        combinations: 50,
        wrestling: 50,
        takedownDefense: 50,
        clinchControl: 50,
        trips: 50,
        throws: 50,
        submissions: 50,
        submissionDefense: 50,
        groundAndPound: 50,
        guardPassing: 50,
        sweeps: 50,
        topControl: 50,
        bottomGame: 50,
        cardio: 50,
        chin: 50,
        recovery: 50,
        strength: 50,
        flexibility: 50,
        aggression: 0.5,
        fightIQ: 50,
        heart: 50,
        adaptability: 50,
        ringGeneralship: 50,
        preferredRange: 'distance',
        finishingInstinct: 50,
        defensiveTendency: 50,
      },
      personality: {
        archetype: 'balanced',
        attitude: 'intense',
        preFightQuote: "I'm here to fight.",
        winQuote: 'Victory!',
        lossQuote: 'I\'ll be back.',
        fightingPhilosophy: 'Adapt and overcome.',
      },
      backstory: {
        origin: 'Unknown',
        trainingCamp: 'FightBook Academy',
        signatureMove: 'The Haymaker',
        rivalries: [],
        achievements: [],
      },
      social: {
        agentName: 'new_agent',
      },
    };
    setAgent(newAgent);
  }, []);

  const handleSave = () => {
    if (!agent) return;
    
    const finalAgent = {
      ...agent,
      metadata: {
        ...agent.metadata,
        name: agent.skills.name || 'Unnamed Agent',
      },
    };
    
    const agents = getAllAgents();
    agents.push(finalAgent);
    localStorage.setItem('fightbook_agents', JSON.stringify(agents));
    
    onComplete();
  };

  if (!agent) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-display text-white">Create New Agent</h2>
        <button onClick={onCancel} className="text-zinc-400 hover:text-white">
          Cancel
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-zinc-400 mb-2 block">Name</label>
            <input
              type="text"
              value={agent.skills.name}
              onChange={(e) => setAgent({
                ...agent,
                skills: { ...agent.skills, name: e.target.value }
              })}
              className="w-full p-3 rounded-lg border border-zinc-800 bg-black text-white"
              placeholder="Fighter name..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-400 mb-2 block">Nickname</label>
            <input
              type="text"
              value={agent.skills.nickname}
              onChange={(e) => setAgent({
                ...agent,
                skills: { ...agent.skills, nickname: e.target.value }
              })}
              className="w-full p-3 rounded-lg border border-zinc-800 bg-black text-white"
              placeholder="The..."
            />
          </div>
        </div>

        <SkillsEditor
          value={generateSkillsMd(agent)}
          onChange={(md) => {
            const lines = md.split('\n');
            const newSkills = { ...agent.skills };
            lines.forEach(line => {
              const [key, value] = line.split(':').map(s => s.trim());
              if (!key || !value) return;
              const num = parseFloat(value);
              if (!isNaN(num)) {
                const keyMap: Record<string, string> = {
                  'striking': 'striking',
                  'wrestling': 'wrestling',
                  'submissions': 'submissions',
                  'cardio': 'cardio',
                  'chin': 'chin',
                  'aggression': 'aggression',
                };
                if (keyMap[key]) {
                  (newSkills as any)[keyMap[key]] = num;
                }
              }
              if (key === 'name') newSkills.name = value;
              if (key === 'nickname') newSkills.nickname = value;
            });
            setAgent({ ...agent, skills: newSkills });
          }}
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-orange-500 text-black font-medium hover:bg-orange-400 transition-colors"
          >
            Create Agent
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Agent View
function EditAgentView({ agent, onComplete, onCancel }: { agent: CompleteAgent; onComplete: () => void; onCancel: () => void }) {
  const [editedAgent, setEditedAgent] = useState(agent);

  const handleSave = () => {
    const agents = getAllAgents();
    const index = agents.findIndex(a => a.metadata.id === editedAgent.metadata.id);
    if (index >= 0) {
      agents[index] = {
        ...editedAgent,
        metadata: {
          ...editedAgent.metadata,
          name: editedAgent.skills.name,
          updatedAt: Date.now(),
        },
      };
      localStorage.setItem('fightbook_agents', JSON.stringify(agents));
    }
    onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-display text-white">Edit Agent</h2>
        <button onClick={onCancel} className="text-zinc-400 hover:text-white">
          Cancel
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-zinc-400 mb-2 block">Name</label>
            <input
              type="text"
              value={editedAgent.skills.name}
              onChange={(e) => setEditedAgent({
                ...editedAgent,
                skills: { ...editedAgent.skills, name: e.target.value }
              })}
              className="w-full p-3 rounded-lg border border-zinc-800 bg-black text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-400 mb-2 block">Nickname</label>
            <input
              type="text"
              value={editedAgent.skills.nickname}
              onChange={(e) => setEditedAgent({
                ...editedAgent,
                skills: { ...editedAgent.skills, nickname: e.target.value }
              })}
              className="w-full p-3 rounded-lg border border-zinc-800 bg-black text-white"
            />
          </div>
        </div>

        <SkillsEditor
          value={generateSkillsMd(editedAgent)}
          onChange={(md) => {
            const lines = md.split('\n');
            const newSkills = { ...editedAgent.skills };
            lines.forEach(line => {
              const [key, value] = line.split(':').map(s => s.trim());
              if (!key || !value) return;
              const num = parseFloat(value);
              if (!isNaN(num)) {
                const keyMap: Record<string, string> = {
                  'striking': 'striking',
                  'wrestling': 'wrestling',
                  'submissions': 'submissions',
                  'cardio': 'cardio',
                  'chin': 'chin',
                };
                if (keyMap[key]) {
                  (newSkills as any)[keyMap[key]] = num;
                }
              }
              if (key === 'name') newSkills.name = value;
              if (key === 'nickname') newSkills.nickname = value;
            });
            setEditedAgent({ ...editedAgent, skills: newSkills });
          }}
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-orange-500 text-black font-medium hover:bg-orange-400 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper to generate skills.md
function generateSkillsMd(agent: CompleteAgent): string {
  const s = agent.skills;
  return `# ${s.name} - FightBook Agent
name: ${s.name}
nickname: ${s.nickname}

# Striking
striking: ${s.striking}
punch_speed: ${s.punchSpeed}
kick_power: ${s.kickPower}
head_movement: ${s.headMovement}

# Grappling
wrestling: ${s.wrestling}
takedown_defense: ${s.takedownDefense}
submissions: ${s.submissions}

# Physical
cardio: ${s.cardio}
chin: ${s.chin}

# Mental
aggression: ${s.aggression}
fight_iq: ${s.fightIQ}
`;
}

export default App;
