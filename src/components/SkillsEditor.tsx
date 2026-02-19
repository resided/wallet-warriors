// FightBook - Skills.md Editor
// Configure your fighter with UFC/MMA attributes

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, RotateCcw, Upload, Download, User,
  Target, Footprints, Shield, Crosshair, Zap, Heart,
  Dumbbell, Activity, Brain, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FighterStats, DEFAULT_FIGHTER } from '@/types/fight';

interface SkillsEditorProps {
  value: string;
  onChange: (value: string) => void;
  fighterNumber?: number;
}

export default function SkillsEditor({ value, onChange, fighterNumber = 1 }: SkillsEditorProps) {
  const [activeTab, setActiveTab] = useState('visual');
  const stats = parseSkills(value);

  const updateStats = (newStats: Partial<FighterStats>) => {
    const updated = { ...stats, ...newStats };
    onChange(generateSkillsMd(updated));
  };

  const handleRawChange = (raw: string) => {
    onChange(raw);
  };

  const loadPreset = (type: 'striker' | 'grappler' | 'balanced' | 'wildcard') => {
    const presets: Record<string, FighterStats> = {
      striker: {
        ...DEFAULT_FIGHTER,
        name: stats.name || 'Striker',
        striking: 85,
        punchSpeed: 80,
        kickPower: 75,
        headMovement: 70,
        wrestling: 40,
        takedownDefense: 60,
        submissions: 30,
        cardio: 70,
        chin: 65,
        aggression: 0.8,
      },
      grappler: {
        ...DEFAULT_FIGHTER,
        name: stats.name || 'Grappler',
        striking: 50,
        wrestling: 90,
        takedownDefense: 85,
        submissions: 85,
        submissionDefense: 80,
        groundGame: 90,
        cardio: 75,
        chin: 70,
        aggression: 0.6,
      },
      balanced: {
        ...DEFAULT_FIGHTER,
        name: stats.name || 'Balanced',
        striking: 70,
        wrestling: 70,
        submissions: 65,
        cardio: 80,
        chin: 75,
        aggression: 0.6,
      },
      wildcard: {
        ...DEFAULT_FIGHTER,
        name: stats.name || 'Wildcard',
        striking: 60,
        wrestling: 50,
        submissions: 90,
        cardio: 60,
        chin: 50,
        aggression: 0.9,
        fightIQ: 40,
      },
    };
    onChange(generateSkillsMd(presets[type]));
  };

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
      <div className="bg-muted/30 px-6 py-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg">Fighter {fighterNumber}</h3>
              <p className="text-xs text-muted-foreground">Configure your combatant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Quick Load:</span>
            <Button variant="outline" size="sm" onClick={() => loadPreset('striker')}>
              Striker
            </Button>
            <Button variant="outline" size="sm" onClick={() => loadPreset('grappler')}>
              Grappler
            </Button>
            <Button variant="outline" size="sm" onClick={() => loadPreset('balanced')}>
              Balanced
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
        <TabsList className="mb-6">
          <TabsTrigger value="visual">Visual Editor</TabsTrigger>
          <TabsTrigger value="raw">skills.md</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Fighter Name
            </label>
            <Input
              value={stats.name}
              onChange={(e) => updateStats({ name: e.target.value })}
              placeholder="Enter fighter name..."
            />
          </div>

          {/* Striking Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2 text-primary">
              <Target className="w-4 h-4" />
              Striking
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatSlider
                label="Striking"
                value={stats.striking}
                onChange={(v) => updateStats({ striking: v })}
                icon={Target}
                description="Punch/kick accuracy and power"
              />
              <StatSlider
                label="Punch Speed"
                value={stats.punchSpeed}
                onChange={(v) => updateStats({ punchSpeed: v })}
                icon={Zap}
                description="Hand speed and combinations"
              />
              <StatSlider
                label="Kick Power"
                value={stats.kickPower}
                onChange={(v) => updateStats({ kickPower: v })}
                icon={Activity}
                description="Leg kick and head kick damage"
              />
              <StatSlider
                label="Head Movement"
                value={stats.headMovement}
                onChange={(v) => updateStats({ headMovement: v })}
                icon={Shield}
                description="Slip, duck, and dodge ability"
              />
            </div>
          </div>

          {/* Grappling Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2 text-secondary">
              <Footprints className="w-4 h-4" />
              Grappling
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatSlider
                label="Wrestling"
                value={stats.wrestling}
                onChange={(v) => updateStats({ wrestling: v })}
                icon={Footprints}
                description="Takedown offense"
              />
              <StatSlider
                label="Takedown Defense"
                value={stats.takedownDefense}
                onChange={(v) => updateStats({ takedownDefense: v })}
                icon={Shield}
                description="Sprawl and takedown prevention"
              />
              <StatSlider
                label="Submissions"
                value={stats.submissions}
                onChange={(v) => updateStats({ submissions: v })}
                icon={Crosshair}
                description="Chokes and joint locks"
              />
              <StatSlider
                label="Sub Defense"
                value={stats.submissionDefense}
                onChange={(v) => updateStats({ submissionDefense: v })}
                icon={Shield}
                description="Submission escapes"
              />
              <StatSlider
                label="Ground Game"
                value={stats.groundGame}
                onChange={(v) => updateStats({ groundGame: v })}
                icon={Activity}
                description="Control and positioning"
              />
            </div>
          </div>

          {/* Physical Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2 text-green-500">
              <Heart className="w-4 h-4" />
              Physical
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatSlider
                label="Cardio"
                value={stats.cardio}
                onChange={(v) => updateStats({ cardio: v })}
                icon={Activity}
                description="Stamina pool"
              />
              <StatSlider
                label="Chin"
                value={stats.chin}
                onChange={(v) => updateStats({ chin: v })}
                icon={Dumbbell}
                description="Ability to take shots"
              />
              <StatSlider
                label="Recovery"
                value={stats.recovery}
                onChange={(v) => updateStats({ recovery: v })}
                icon={Heart}
                description="Between-round health regen"
              />
            </div>
          </div>

          {/* Mental Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2 text-purple-500">
              <Brain className="w-4 h-4" />
              Mental
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatSlider
                label="Fight IQ"
                value={stats.fightIQ}
                onChange={(v) => updateStats({ fightIQ: v })}
                icon={Brain}
                description="Smart decision making"
              />
              <StatSlider
                label="Heart"
                value={stats.heart}
                onChange={(v) => updateStats({ heart: v })}
                icon={Flame}
                description="Comeback factor"
              />
              <div className="space-y-2">
                <label className="text-sm flex items-center gap-2">
                  <Flame className="w-4 h-4 text-muted-foreground" />
                  Aggression
                </label>
                <Slider
                  value={[stats.aggression * 100]}
                  onValueChange={([v]) => updateStats({ aggression: v / 100 })}
                  min={0}
                  max={100}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">
                  {stats.aggression < 0.3 ? 'Counter Fighter' : 
                   stats.aggression < 0.7 ? 'Balanced' : 'Pressure Fighter'}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="raw">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Edit your fighter configuration directly. Changes here will update the visual editor.
            </p>
            <Textarea
              value={value}
              onChange={(e) => handleRawChange(e.target.value)}
              className="font-mono text-sm min-h-[400px]"
              placeholder={`name: My Fighter\nstriking: 70\nwrestling: 60\ncardio: 80...`}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange(generateSkillsMd(DEFAULT_FIGHTER))}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const blob = new Blob([value], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'skills.md';
                  a.click();
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Stat Slider Component
function StatSlider({ 
  label, 
  value, 
  onChange, 
  icon: Icon,
  description 
}: { 
  label: string; 
  value: number; 
  onChange: (val: number) => void;
  icon: any;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          {label}
        </label>
        <span className="font-mono text-sm font-bold">{value}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={100}
        step={1}
      />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

// Parse skills.md content
function parseSkills(content: string): FighterStats {
  const stats = { ...DEFAULT_FIGHTER };
  
  const lines = content.split('\n');
  for (const line of lines) {
    const [key, value] = line.split(':').map(s => s.trim());
    if (!key || !value) continue;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      if (key === 'name') stats.name = value;
      if (key === 'nickname') stats.nickname = value;
      continue;
    }

    switch (key.toLowerCase()) {
      case 'striking':
      case 'boxing':
        stats.striking = numValue;
        break;
      case 'punch_speed':
      case 'handspeed':
        stats.punchSpeed = numValue;
        break;
      case 'kicks':
      case 'kick_power':
        stats.kickPower = numValue;
        break;
      case 'head_movement':
      case 'defense':
        stats.headMovement = numValue;
        break;
      case 'wrestling':
      case 'takedowns':
        stats.wrestling = numValue;
        break;
      case 'takedown_defense':
      case 'tdd':
        stats.takedownDefense = numValue;
        break;
      case 'bjj':
      case 'submissions':
        stats.submissions = numValue;
        break;
      case 'submission_defense':
        stats.submissionDefense = numValue;
        break;
      case 'ground_game':
      case 'grappling':
        stats.groundGame = numValue;
        break;
      case 'cardio':
      case 'stamina':
        stats.cardio = numValue;
        break;
      case 'chin':
      case 'durability':
        stats.chin = numValue;
        break;
      case 'recovery':
        stats.recovery = numValue;
        break;
      case 'iq':
      case 'fight_iq':
        stats.fightIQ = numValue;
        break;
      case 'heart':
        stats.heart = numValue;
        break;
      case 'aggression':
        stats.aggression = numValue;
        break;
    }
  }

  return stats;
}

// Generate skills.md content
function generateSkillsMd(stats: FighterStats): string {
  return `# FightBook Fighter Configuration
name: ${stats.name}
nickname: ${stats.nickname || ''}

# Striking
striking: ${stats.striking}
punch_speed: ${stats.punchSpeed}
kick_power: ${stats.kickPower}
head_movement: ${stats.headMovement}

# Grappling
wrestling: ${stats.wrestling}
takedown_defense: ${stats.takedownDefense}
submissions: ${stats.submissions}
submission_defense: ${stats.submissionDefense}
ground_game: ${stats.groundGame}

# Physical
cardio: ${stats.cardio}
chin: ${stats.chin}
recovery: ${stats.recovery}

# Mental
fight_iq: ${stats.fightIQ}
heart: ${stats.heart}
aggression: ${stats.aggression}
`;
}
