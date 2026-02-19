// FightBook - Fighter Roster
// Display and manage your registered fighters

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, User, MoreVertical, Edit, Trash2, Swords,
  ChevronRight, Loader2, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getFighters, deleteFighter, isUsingSupabase } from '@/lib/fighterStorage';
import type { CompleteAgent } from '@/types/agent';
import { calculateOverallRating, detectArchetype } from '@/types/agent';

interface FighterRosterProps {
  onCreateFighter?: () => void;
  onEditFighter?: (fighter: CompleteAgent) => void;
  onSelectFighter?: (fighter: CompleteAgent) => void;
  onFight?: (fighter1: CompleteAgent, fighter2: CompleteAgent) => void;
}

// Stats bar component
function StatBar({ label, value, color = "bg-orange-500" }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500 w-16 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function FighterRoster({ 
  onCreateFighter, 
  onEditFighter,
  onSelectFighter,
  onFight,
}: FighterRosterProps) {
  const [fighters, setFighters] = useState<CompleteAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForFight, setSelectedForFight] = useState<CompleteAgent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fighterToDelete, setFighterToDelete] = useState<CompleteAgent | null>(null);
  const navigate = useNavigate();

  const loadFighters = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getFighters();
      setFighters(data);
    } catch (error) {
      console.error('Failed to load fighters:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFighters();
  }, [loadFighters]);

  const handleDelete = async () => {
    if (!fighterToDelete) return;
    
    try {
      await deleteFighter(fighterToDelete.metadata.id);
      toast.success(`${fighterToDelete.metadata.name} has been deleted`);
      loadFighters();
    } catch (error) {
      toast.error('Failed to delete fighter');
    } finally {
      setDeleteDialogOpen(false);
      setFighterToDelete(null);
    }
  };

  const handleSelectForFight = (fighter: CompleteAgent) => {
    if (selectedForFight?.metadata.id === fighter.metadata.id) {
      setSelectedForFight(null);
    } else if (selectedForFight) {
      onFight?.(selectedForFight, fighter);
      setSelectedForFight(null);
    } else {
      setSelectedForFight(fighter);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display mb-1">Your Fighters</h2>
          <p className="text-muted-foreground">
            {fighters.length} fighter{fighters.length !== 1 ? 's' : ''} in your roster
          </p>
        </div>
        <Button onClick={onCreateFighter}>
          <Plus className="w-4 h-4 mr-2" />
          Add Fighter
        </Button>
      </div>

      {/* Fight Selection Mode Banner */}
      {selectedForFight && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Swords className="w-5 h-5 text-secondary" />
            <span>
              Select an opponent for <strong>{selectedForFight.metadata.name}</strong>
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedForFight(null)}>
            Cancel
          </Button>
        </motion.div>
      )}

      {/* Empty State */}
      {fighters.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/30 rounded-xl border border-zinc-800">
          <User className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
          <h3 className="text-xl font-display mb-2">No fighters yet</h3>
          <p className="text-zinc-500 mb-6">
            Register your first AI agent to get started
          </p>
          <Button onClick={onCreateFighter}>
            <Plus className="w-4 h-4 mr-2" />
            Register Your First Fighter
          </Button>
          
          {!isUsingSupabase() && (
            <div className="mt-4 flex items-center justify-center gap-2 text-yellow-500 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Configure Supabase for persistent storage</span>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fighters.map((fighter) => (
            <FighterCard
              key={fighter.metadata.id}
              fighter={fighter}
              isSelectedForFight={selectedForFight?.metadata.id === fighter.metadata.id}
              onEdit={() => onEditFighter?.(fighter)}
              onDelete={() => {
                setFighterToDelete(fighter);
                setDeleteDialogOpen(true);
              }}
              onSelectForFight={() => handleSelectForFight(fighter)}
              onViewProfile={() => onSelectFighter?.(fighter)}
            />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {fighters.length >= 2 && (
        <div className="bg-zinc-900/30 rounded-xl p-6 border border-zinc-800">
          <h3 className="font-display text-lg mb-4">Quick Fight</h3>
          <p className="text-sm text-zinc-500 mb-4">
            Select two fighters above to start a fight, or use random matchmaking
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              const shuffled = [...fighters].sort(() => Math.random() - 0.5);
              onFight?.(shuffled[0], shuffled[1]);
            }}
          >
            <Swords className="w-4 h-4 mr-2" />
            Random Matchup
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fighter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {fighterToDelete?.metadata.name}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Fighter Card Component
function FighterCard({
  fighter,
  isSelectedForFight,
  onEdit,
  onDelete,
  onSelectForFight,
  onViewProfile,
}: {
  fighter: CompleteAgent;
  isSelectedForFight: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSelectForFight: () => void;
  onViewProfile: () => void;
}) {
  const rating = calculateOverallRating(fighter.skills);
  const archetype = detectArchetype(fighter.skills);
  const record = `${fighter.metadata.wins}-${fighter.metadata.losses}-${fighter.metadata.draws}`;

  return (
    <motion.div
      layout
      className={`group bg-zinc-900 border rounded-xl overflow-hidden transition-all ${
        isSelectedForFight 
          ? 'border-secondary ring-2 ring-secondary/30' 
          : 'border-zinc-800 hover:border-orange-500/30'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div 
            className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center text-xl font-display cursor-pointer"
            onClick={onViewProfile}
          >
            {fighter.metadata.name.charAt(0)}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onViewProfile}>
                <User className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Stats
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-500">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div onClick={onViewProfile} className="cursor-pointer">
          <h3 className="font-display text-lg mb-1">{fighter.metadata.name}</h3>
          <p className="text-sm text-zinc-500 mb-2">"{fighter.skills.nickname}"</p>
          
          <div className="flex flex-wrap gap-1 mb-3">
            <Badge variant="outline" className="text-xs capitalize border-zinc-700">
              {archetype}
            </Badge>
            <Badge variant="outline" className="text-xs border-zinc-700">
              Rating {rating}
            </Badge>
          </div>
        </div>

        <div className="space-y-1 mb-3">
          <StatBar label="Power" value={fighter.skills.striking} color="bg-orange-500" />
          <StatBar label="Speed" value={fighter.skills.punchSpeed} color="bg-yellow-500" />
          <StatBar label="Defense" value={fighter.skills.headMovement} color="bg-blue-500" />
          <StatBar label="Stamina" value={fighter.skills.cardio} color="bg-green-500" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-zinc-800/50 rounded-lg p-2">
            <div className="font-mono font-bold">{record}</div>
            <div className="text-xs text-zinc-500">Record</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-2">
            <div className="font-mono font-bold">{fighter.metadata.kos}</div>
            <div className="text-xs text-zinc-500">KOs</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-2">
            <div className="font-mono font-bold">{fighter.metadata.ranking}</div>
            <div className="text-xs text-zinc-500">ELO</div>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800 p-3 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 border-zinc-700"
          onClick={onSelectForFight}
        >
          <Swords className="w-4 h-4 mr-1" />
          {isSelectedForFight ? 'Selected' : 'Fight'}
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onViewProfile}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
