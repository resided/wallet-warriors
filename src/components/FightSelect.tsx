// FightBook - Fight Selection UI
// Allows users to select their fighter and challenge CPU

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Trophy, ChevronRight, Zap, Shield, Activity, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFighters } from '@/lib/fighterStorage';
import { createCpuFighter, CpuDifficulty, CpuFighter } from '@/lib/cpuOpponent';
import { calculateOverallRating } from '@/types/agent';
import type { CompleteAgent, SkillsMdConfig } from '@/types/agent';
import TextFight from './TextFight';

type DifficultyOption = CpuDifficulty;

const DIFFICULTY_INFO: Record<DifficultyOption, { label: string; color: string; description: string }> = {
  easy: { label: 'Easy', color: 'bg-green-500', description: 'Good for practice' },
  medium: { label: 'Medium', color: 'bg-yellow-500', description: 'Balanced challenge' },
  hard: { label: 'Hard', color: 'bg-red-500', description: 'For experienced fighters' },
};

export default function FightSelect() {
  const navigate = useNavigate();
  const [fighters, setFighters] = useState<CompleteAgent[]>([]);
  const [selectedFighter, setSelectedFighter] = useState<CompleteAgent | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyOption>('medium');
  const [isLoading, setIsLoading] = useState(true);
  const [fightStarted, setFightStarted] = useState(false);
  const [cpuFighter, setCpuFighter] = useState<CpuFighter | null>(null);

  useEffect(() => {
    loadFighters();
  }, []);

  const loadFighters = async () => {
    setIsLoading(true);
    try {
      const loaded = await getFighters();
      setFighters(loaded);
    } catch (error) {
      console.error('Failed to load fighters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFightCpu = (fighter: CompleteAgent) => {
    setSelectedFighter(fighter);
    const cpu = createCpuFighter(undefined, selectedDifficulty);
    setCpuFighter(cpu);
    setFightStarted(true);
  };

  const handleBackFromFight = () => {
    setFightStarted(false);
    setSelectedFighter(null);
    setCpuFighter(null);
  };

  // If fight started, show the fight
  if (fightStarted && selectedFighter && cpuFighter) {
    return (
      <TextFight
        agent1={selectedFighter}
        agent2={convertCpuToAgent(cpuFighter)}
        onBack={handleBackFromFight}
        isCpuOpponent={true}
        cpuDifficulty={selectedDifficulty}
      />
    );
  }

  // Empty state - no fighters
  if (!isLoading && fighters.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-display mb-4">No Fighters Yet</h2>
          <p className="text-muted-foreground mb-6">
            Register your first AI agent before you can fight!
          </p>
          <Button onClick={() => navigate('/register')}>
            Register Your First Fighter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display mb-2">Select Your Fighter</h1>
          <p className="text-muted-foreground">
            Choose which fighter to send into battle
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </div>

      {/* Difficulty Selector */}
      <div className="mb-8">
        <label className="text-sm font-medium mb-2 block">Select Difficulty</label>
        <div className="flex gap-3">
          {(Object.keys(DIFFICULTY_INFO) as DifficultyOption[]).map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                selectedDifficulty === diff
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${DIFFICULTY_INFO[diff].color}`} />
                <span className="font-medium">{DIFFICULTY_INFO[diff].label}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {DIFFICULTY_INFO[diff].description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Fighter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fighters.map((fighter) => (
          <FighterCard
            key={fighter.metadata.id}
            fighter={fighter}
            difficulty={selectedDifficulty}
            onFight={() => handleFightCpu(fighter)}
          />
        ))}
      </div>
    </div>
  );
}

// Fighter Card Component
function FighterCard({
  fighter,
  difficulty,
  onFight,
}: {
  fighter: CompleteAgent;
  difficulty: DifficultyOption;
  onFight: () => void;
}) {
  const rating = calculateOverallRating(fighter.skills);
  const { wins, losses, draws } = fighter.metadata;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xl font-display">
              {fighter.skills.name.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-lg">{fighter.skills.name}</CardTitle>
              <CardDescription>"{fighter.skills.nickname}"</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="font-mono">
            {rating}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <StatPill icon={Zap} label="STR" value={fighter.skills.striking} />
          <StatPill icon={Shield} label="WRL" value={fighter.skills.wrestling} />
          <StatPill icon={Activity} label="CAR" value={fighter.skills.cardio} />
        </div>

        {/* Record */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="text-green-500 font-medium">{wins}W</span>
          <span className="text-muted-foreground">-</span>
          <span className="text-red-500 font-medium">{losses}L</span>
          {draws > 0 && (
            <>
              <span className="text-muted-foreground">-</span>
              <span className="text-yellow-500 font-medium">{draws}D</span>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          onClick={onFight}
          size="lg"
        >
          <Swords className="w-4 h-4 mr-2" />
          Fight CPU
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// Stat Pill Component
function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: number;
}) {
  const getColor = () => {
    if (value >= 70) return 'text-green-500';
    if (value >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
      <Icon className={`w-3 h-3 ${getColor()}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-mono font-medium ${getColor()}`}>{value}</span>
    </div>
  );
}

// Convert CPU fighter to agent format for TextFight
function convertCpuToAgent(cpu: CpuFighter): CompleteAgent {
  return {
    metadata: {
      id: cpu.id,
      name: cpu.name,
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
      name: cpu.name,
      nickname: cpu.nickname,
      striking: cpu.striking,
      punchSpeed: cpu.punchSpeed,
      kickPower: cpu.kickPower,
      headMovement: cpu.headMovement,
      footwork: 50,
      combinations: 50,
      wrestling: cpu.wrestling,
      takedownDefense: cpu.takedownDefense,
      clinchControl: 50,
      trips: 50,
      throws: 50,
      submissions: cpu.submissions,
      submissionDefense: cpu.submissionDefense,
      groundAndPound: cpu.groundGame,
      guardPassing: 50,
      sweeps: 50,
      topControl: cpu.groundGame,
      bottomGame: cpu.groundGame,
      cardio: cpu.cardio,
      chin: cpu.chin,
      recovery: cpu.recovery,
      strength: 50,
      flexibility: 50,
      aggression: cpu.aggression,
      fightIQ: cpu.fightIQ,
      heart: cpu.heart,
      adaptability: 50,
      ringGeneralship: 50,
      preferredRange: 'distance' as const,
      finishingInstinct: 50,
      defensiveTendency: 50,
    },
    personality: {
      archetype: 'balanced',
      attitude: 'intense',
      preFightQuote: "Let's go!",
      winQuote: 'Victory!',
      lossQuote: 'Will improve.',
      fightingPhilosophy: 'Fight smart.',
    },
    backstory: {
      origin: 'CPU',
      trainingCamp: 'AI Gym',
      signatureMove: 'System Strike',
      rivalries: [],
      achievements: [],
    },
    social: {
      agentName: `cpu_${cpu.id}`,
    },
  };
}
