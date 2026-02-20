// FightBook - Leaderboard Component
// Shows fighters ranked by win count

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Medal, TrendingUp, Swords, 
  Crown, Award, Target, Flame 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/leaderboard';

interface LeaderboardProps {
  highlightFighterId?: string;
  limit?: number;
}

export default function Leaderboard({ highlightFighterId, limit = 100 }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await getLeaderboard(limit);
      setEntries(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (entries.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Swords className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No fighters yet. Register your first fighter to get on the board!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Leaderboard
          <Badge variant="secondary" className="ml-auto">
            {entries.length} Fighters
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 p-4">
            {entries.map((entry, index) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                rank={index + 1}
                isHighlighted={entry.id === highlightFighterId}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Individual leaderboard row
function LeaderboardRow({
  entry,
  rank,
  isHighlighted,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isHighlighted?: boolean;
}) {
  const getRankIcon = () => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-mono text-muted-foreground">{rank}</span>;
    }
  };

  const getRankStyle = () => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/30';
      default:
        return isHighlighted 
          ? 'bg-primary/10 border-primary/30' 
          : 'bg-card/50 hover:bg-card border-transparent';
    }
  };

  const winRate = entry.totalFights > 0 
    ? Math.round((entry.winCount / entry.totalFights) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={`
        flex items-center gap-4 p-3 rounded-lg border transition-all
        ${getRankStyle()}
        ${isHighlighted ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
      `}
    >
      {/* Rank */}
      <div className="flex-shrink-0 w-8 flex justify-center">
        {getRankIcon()}
      </div>

      {/* Fighter Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{entry.name}</span>
          {rank <= 3 && (
            <Badge variant="outline" className="text-xs">
              #{rank}
            </Badge>
          )}
          {isHighlighted && (
            <Badge className="bg-primary text-xs">YOU</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <span className="italic">{entry.nickname}</span>
          <span>•</span>
          <span>Level {entry.level}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        {/* Win Rate */}
        <div className="hidden sm:flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="font-mono">{winRate}%</span>
        </div>

        {/* Record */}
        <div className="flex items-center gap-1.5">
          <Target className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono">
            <span className="text-green-500">{entry.winCount}</span>
            <span className="text-muted-foreground mx-1">-</span>
            <span className="text-red-400">{entry.lossCount}</span>
          </span>
        </div>

        {/* Total Fights */}
        <div className="hidden md:flex items-center gap-1.5 text-muted-foreground">
          <Swords className="w-4 h-4" />
          <span className="font-mono">{entry.totalFights}</span>
        </div>

        {/* Win Count Badge */}
        <div className="flex items-center gap-1.5">
          {rank === 1 && <Flame className="w-4 h-4 text-orange-500" />}
          <Badge 
            variant={entry.winCount > 0 ? "default" : "secondary"}
            className={rank <= 3 ? "bg-primary/20 text-primary border-primary/30" : ""}
          >
            <Award className="w-3 h-3 mr-1" />
            {entry.winCount} {entry.winCount === 1 ? 'Win' : 'Wins'}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}

// Compact leaderboard for small spaces
export function LeaderboardCompact({ limit = 5 }: { limit?: number }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await getLeaderboard(limit);
      setEntries(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No fighters yet
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {entries.slice(0, limit).map((entry, index) => (
        <div
          key={entry.id}
          className="flex items-center justify-between p-2 rounded-md bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground w-4">
              {index + 1}
            </span>
            <span className="text-sm font-medium truncate max-w-[120px]">
              {entry.name}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {entry.winCount}W
          </Badge>
        </div>
      ))}
    </div>
  );
}
