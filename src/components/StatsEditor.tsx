// FightBook - Stats Editor Modal
// Edit fighter stats with point budget enforcement

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, X, Plus, Minus, AlertCircle, Loader2,
  Target, Shield, Zap, Activity, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  updateFighter,
  getFighter,
} from '@/lib/fighterStorage';
import type { CompleteAgent, SkillsMdConfig } from '@/types/agent';
import { 
  POINT_BUDGET,
  POINT_CONSUMING_STATS,
  calculatePointsSpent,
  calculatePointsRemaining,
  getBudgetStatus,
  DEFAULT_SKILLS,
} from '@/types/agent';
import { toast } from 'sonner';

interface StatsEditorProps {
  fighterId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (fighter: CompleteAgent) => void;
}

export default function StatsEditor({ 
  fighterId, 
  open, 
  onOpenChange,
  onSave,
}: StatsEditorProps) {
  const [fighter, setFighter] = useState<CompleteAgent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('striking');

  // Load fighter data when modal opens
  useMemo(() => {
    if (open && fighterId) {
      setIsLoading(true);
      getFighter(fighterId)
        .then((data) => {
          setFighter(data);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [open, fighterId]);

  const budget = useMemo(() => {
    if (!fighter) return { spent: 0, remaining: 1200, percentUsed: 0, color: 'text-green-500', status: 'Balanced' };
    return getBudgetStatus(fighter.skills);
  }, [fighter?.skills]);

  const handleStatChange = (stat: keyof SkillsMdConfig, value: number) => {
    if (!fighter) return;

    const currentValue = (fighter.skills[stat] as number) || 0;
    let newValue = value;
    
    // If increasing, check budget
    const isPointConsuming = (POINT_CONSUMING_STATS as readonly string[]).includes(stat);
    if (value > currentValue && isPointConsuming) {
      const increase = value - currentValue;
      const remaining = calculatePointsRemaining(fighter.skills);
      if (increase > remaining) {
        newValue = (currentValue + remaining);
      }
    }
    
    // Clamp values
    if (newValue > POINT_BUDGET.MAX_STAT) newValue = POINT_BUDGET.MAX_STAT;
    if (newValue < POINT_BUDGET.MIN_STAT) newValue = POINT_BUDGET.MIN_STAT;

    setFighter({
      ...fighter,
      skills: {
        ...fighter.skills,
        [stat]: newValue,
      },
    });
  };

  const handleSave = async () => {
    if (!fighter || !fighterId) return;

    setIsSaving(true);
    try {
      const updated = await updateFighter(fighterId, { skills: fighter.skills });
      if (updated) {
        toast.success('Stats saved successfully');
        onSave?.(updated);
        onOpenChange(false);
      } else {
        toast.error('Failed to save stats');
      }
    } catch (error) {
      toast.error('Failed to save stats');
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Fighter Stats
            {fighter && (
              <Badge variant="outline" className="ml-2">
                {fighter.metadata.name}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : fighter ? (
          <div className="space-y-4">
            {/* Budget Display */}
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Point Budget</span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold ${budget.color}`}>
                    {budget.remaining}
                  </span>
                  <span className="text-zinc-500">/ {POINT_BUDGET.TOTAL}</span>
                </div>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    budget.percentUsed > 90 ? 'bg-red-500' :
                    budget.percentUsed > 75 ? 'bg-orange-500' :
                    budget.percentUsed > 50 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, budget.percentUsed)}%` }}
                />
              </div>
              {budget.remaining < 0 && (
                <div className="mt-2 text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Over budget! Reduce some stats.
                </div>
              )}
            </div>

            {/* Stat Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-zinc-900 border border-zinc-800">
                <TabsTrigger value="striking" className="flex-1">
                  <Target className="w-4 h-4 mr-1" />
                  Striking
                </TabsTrigger>
                <TabsTrigger value="grappling" className="flex-1">
                  <Shield className="w-4 h-4 mr-1" />
                  Grappling
                </TabsTrigger>
                <TabsTrigger value="physical" className="flex-1">
                  <Activity className="w-4 h-4 mr-1" />
                  Physical
                </TabsTrigger>
                <TabsTrigger value="mental" className="flex-1">
                  <Brain className="w-4 h-4 mr-1" />
                  Mental
                </TabsTrigger>
              </TabsList>

              <TabsContent value="striking" className="space-y-4 mt-4">
                <StatSlider label="Striking" value={fighter.skills.striking} onChange={(v) => handleStatChange('striking', v)} />
                <StatSlider label="Punch Speed" value={fighter.skills.punchSpeed} onChange={(v) => handleStatChange('punchSpeed', v)} />
                <StatSlider label="Kick Power" value={fighter.skills.kickPower} onChange={(v) => handleStatChange('kickPower', v)} />
                <StatSlider label="Head Movement" value={fighter.skills.headMovement} onChange={(v) => handleStatChange('headMovement', v)} />
                <StatSlider label="Footwork" value={fighter.skills.footwork} onChange={(v) => handleStatChange('footwork', v)} />
                <StatSlider label="Combinations" value={fighter.skills.combinations} onChange={(v) => handleStatChange('combinations', v)} />
              </TabsContent>

              <TabsContent value="grappling" className="space-y-4 mt-4">
                <StatSlider label="Wrestling" value={fighter.skills.wrestling} onChange={(v) => handleStatChange('wrestling', v)} />
                <StatSlider label="Takedown Defense" value={fighter.skills.takedownDefense} onChange={(v) => handleStatChange('takedownDefense', v)} />
                <StatSlider label="Clinch Control" value={fighter.skills.clinchControl} onChange={(v) => handleStatChange('clinchControl', v)} />
                <StatSlider label="Submissions" value={fighter.skills.submissions} onChange={(v) => handleStatChange('submissions', v)} />
                <StatSlider label="Submission Defense" value={fighter.skills.submissionDefense} onChange={(v) => handleStatChange('submissionDefense', v)} />
                <StatSlider label="Top Control" value={fighter.skills.topControl} onChange={(v) => handleStatChange('topControl', v)} />
              </TabsContent>

              <TabsContent value="physical" className="space-y-4 mt-4">
                <StatSlider label="Cardio" value={fighter.skills.cardio} onChange={(v) => handleStatChange('cardio', v)} />
                <StatSlider label="Chin" value={fighter.skills.chin} onChange={(v) => handleStatChange('chin', v)} />
                <StatSlider label="Recovery" value={fighter.skills.recovery} onChange={(v) => handleStatChange('recovery', v)} />
                <StatSlider label="Strength" value={fighter.skills.strength} onChange={(v) => handleStatChange('strength', v)} />
                <StatSlider label="Flexibility" value={fighter.skills.flexibility} onChange={(v) => handleStatChange('flexibility', v)} />
              </TabsContent>

              <TabsContent value="mental" className="space-y-4 mt-4">
                <StatSlider label="Fight IQ" value={fighter.skills.fightIQ} onChange={(v) => handleStatChange('fightIQ', v)} free />
                <StatSlider label="Heart" value={fighter.skills.heart} onChange={(v) => handleStatChange('heart', v)} free />
                <StatSlider label="Adaptability" value={fighter.skills.adaptability} onChange={(v) => handleStatChange('adaptability', v)} free />
                <StatSlider label="Ring Generalship" value={fighter.skills.ringGeneralship} onChange={(v) => handleStatChange('ringGeneralship', v)} free />
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between">
                    <Label className="text-zinc-300">Aggression</Label>
                    <span className="font-mono">{Math.round(fighter.skills.aggression * 100)}%</span>
                  </div>
                  <Slider
                    value={[fighter.skills.aggression * 100]}
                    onValueChange={([v]) => {
                      setFighter({
                        ...fighter,
                        skills: { ...fighter.skills, aggression: v / 100 },
                      });
                    }}
                    min={0}
                    max={100}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-10 text-zinc-500">
            Fighter not found
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || budget.remaining < 0}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Stats
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Individual stat slider component
function StatSlider({ 
  label, 
  value, 
  onChange,
  free = false,
}: { 
  label: string; 
  value: number; 
  onChange: (val: number) => void;
  free?: boolean;
}) {
  const remaining = 1200; // Would need to pass this from parent
  const isMaxed = value >= POINT_BUDGET.MAX_STAT;
  const isMin = value <= POINT_BUDGET.MIN_STAT;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-zinc-300 flex items-center gap-2">
          {label}
          {free && <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-500">FREE</Badge>}
        </Label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            disabled={isMin}
            onClick={() => onChange(value - 5)}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className={`font-mono w-12 text-center ${isMaxed ? 'text-orange-500' : 'text-white'}`}>
            {value}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            disabled={isMaxed || (!free && remaining <= 0)}
            onClick={() => onChange(value + 5)}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={POINT_BUDGET.MIN_STAT}
        max={POINT_BUDGET.MAX_STAT}
        step={1}
      />
    </div>
  );
}
