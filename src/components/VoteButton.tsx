// FightBook - Vote Button Component
// Vote on entertaining fights

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { toggleVote, getVoteCount, hasVotedForFight } from '@/lib/voting';

interface VoteButtonProps {
  fightId: string;
  userId?: string;
  initialVoteCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export default function VoteButton({
  fightId,
  userId,
  initialVoteCount = 0,
  showCount = true,
  size = 'default',
  variant = 'outline',
}: VoteButtonProps) {
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    loadVoteStatus();
  }, [fightId, userId]);

  const loadVoteStatus = async () => {
    try {
      const [count, voted] = await Promise.all([
        getVoteCount(fightId),
        hasVotedForFight(fightId, userId),
      ]);
      setVoteCount(count);
      setHasVoted(voted);
    } catch (error) {
      console.error('Failed to load vote status:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  const handleVote = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await toggleVote(fightId, userId);
      
      if (result.voted) {
        setVoteCount(prev => prev + 1);
        setHasVoted(true);
        toast.success('You voted this fight as entertaining!', {
          description: 'Thanks for your vote.',
        });
      } else {
        setVoteCount(prev => Math.max(0, prev - 1));
        setHasVoted(false);
        toast.info('Vote removed');
      }
    } catch (error) {
      toast.error('Failed to vote', {
        description: 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-7 text-xs px-2',
    default: 'h-9 px-3',
    lg: 'h-11 px-4',
  };

  if (!isInitialized) {
    return (
      <Button
        variant={variant}
        size="sm"
        disabled
        className={`${sizeClasses[size]} opacity-50`}
      >
        <Loader2 className="w-4 h-4 animate-spin mr-1" />
        {showCount && <span className="ml-1">...</span>}
      </Button>
    );
  }

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant={variant}
        size="sm"
        onClick={handleVote}
        disabled={isLoading}
        className={`
          ${sizeClasses[size]} gap-1.5 transition-all
          ${hasVoted 
            ? 'bg-orange-500/20 text-orange-500 border-orange-500/50 hover:bg-orange-500/30' 
            : 'hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/30'
          }
        `}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Flame className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
        )}
        <span>Entertaining</span>
        {showCount && (
          <Badge 
            variant="secondary" 
            className={`ml-1 text-xs ${hasVoted ? 'bg-orange-500/30 text-orange-200' : ''}`}
          >
            {voteCount}
          </Badge>
        )}
      </Button>
    </motion.div>
  );
}

// Compact version for small spaces
export function VoteButtonCompact({
  fightId,
  userId,
  initialVoteCount = 0,
}: {
  fightId: string;
  userId?: string;
  initialVoteCount?: number;
}) {
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadVoteStatus();
  }, [fightId, userId]);

  const loadVoteStatus = async () => {
    const [count, voted] = await Promise.all([
      getVoteCount(fightId),
      hasVotedForFight(fightId, userId),
    ]);
    setVoteCount(count);
    setHasVoted(voted);
  };

  const handleVote = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const result = await toggleVote(fightId, userId);
      if (result.voted) {
        setVoteCount(prev => prev + 1);
        setHasVoted(true);
      } else {
        setVoteCount(prev => Math.max(0, prev - 1));
        setHasVoted(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={isLoading}
      className={`
        flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors
        ${hasVoted 
          ? 'bg-orange-500/20 text-orange-500' 
          : 'text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10'
        }
      `}
    >
      <Flame className={`w-3 h-3 ${hasVoted ? 'fill-current' : ''}`} />
      <span>{voteCount}</span>
    </button>
  );
}
