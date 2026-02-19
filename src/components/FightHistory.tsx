// FightBook - Fight History View
// Display past fights with details and filtering

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Swords, Filter, ChevronRight, Award, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getFightHistory, FightRecord } from '@/lib/fightStorage';
import { getFighter } from '@/lib/fighterStorage';
import type { CompleteAgent } from '@/types/agent';

type FilterType = 'all' | 'wins' | 'losses';

export default function FightHistory() {
  const navigate = useNavigate();
  const [fights, setFights] = useState<FightRecord[]>([]);
  const [fighters, setFighters] = useState<Record<string, CompleteAgent>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedFight, setExpandedFight] = useState<string | null>(null);

  useEffect(() => {
    loadFights();
  }, []);

  const loadFights = async () => {
    setIsLoading(true);
    try {
      const history = await getFightHistory();
      setFights(history);
      
      // Load fighter details for display
      const fighterIds = new Set<string>();
      history.forEach(f => {
        fighterIds.add(f.agent1Id);
        fighterIds.add(f.agent2Id);
      });
      
      const fighterPromises = Array.from(fighterIds).map(async (id) => {
        const fighter = await getFighter(id);
        return fighter ? { [id]: fighter } : null;
      });
      
      const fighterResults = await Promise.all(fighterPromises);
      const fighterMap: Record<string, CompleteAgent> = {};
      fighterResults.forEach(result => {
        if (result) {
          Object.assign(fighterMap, result);
        }
      });
      setFighters(fighterMap);
    } catch (error) {
      console.error('Failed to load fights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter fights based on selected filter
  const filteredFights = fights.filter(fight => {
    if (filter === 'all') return true;
    
    // For now, check if the first agent (user's agent) won
    const userWon = fight.winnerId === fight.agent1Id;
    if (filter === 'wins') return userWon;
    if (filter === 'losses') return !userWon && fight.winnerId !== null;
    return true;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Empty state
  if (!isLoading && fights.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Swords className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-display mb-4">No Fights Yet</h2>
          <p className="text-muted-foreground mb-6">
            Start your first fight to see your history!
          </p>
          <Button onClick={() => navigate('/fight')}>
            Start Fighting
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
          <h1 className="text-3xl font-display mb-2">Fight History</h1>
          <p className="text-muted-foreground">
            View your past battles and results
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Fights</TabsTrigger>
          <TabsTrigger value="wins">Wins</TabsTrigger>
          <TabsTrigger value="losses">Losses</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Fight List */}
      <div className="space-y-4">
        {filteredFights.map((fight) => (
          <FightCard
            key={fight.id}
            fight={fight}
            fighter1={fighters[fight.agent1Id]}
            fighter2={fighters[fight.agent2Id]}
            isExpanded={expandedFight === fight.id}
            onToggle={() => setExpandedFight(expandedFight === fight.id ? null : fight.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Fight Card Component
function FightCard({
  fight,
  fighter1,
  fighter2,
  isExpanded,
  onToggle,
}: {
  fight: FightRecord;
  fighter1?: CompleteAgent;
  fighter2?: CompleteAgent;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const isWin = fight.winnerId === fight.agent1Id;
  const isLoss = fight.winnerId && fight.winnerId !== fight.agent1Id;

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'KO':
      case 'TKO':
        return 'bg-red-500';
      case 'SUB':
        return 'bg-purple-500';
      case 'DEC':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Main Row */}
      <div 
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          {/* Fighters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                {fighter1?.skills.name.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-medium">{fighter1?.skills.name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">
                  {fighter1 ? `${fighter1.metadata.wins}W - ${fighter1.metadata.losses}L` : ''}
                </p>
              </div>
            </div>

            <div className="text-muted-foreground px-2">vs</div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                {fighter2?.skills.name.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-medium">{fighter2?.skills.name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">
                  {fighter2 ? `${fighter2.metadata.wins}W - ${fighter2.metadata.losses}L` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="flex items-center gap-4">
            {fight.winnerId && (
              <Badge className={isWin ? 'bg-green-500' : isLoss ? 'bg-red-500' : 'bg-gray-500'}>
                {isWin ? 'WIN' : isLoss ? 'LOSS' : 'DRAW'}
              </Badge>
            )}
            <Badge className={getMethodColor(fight.method)}>
              {fight.method}
            </Badge>
            <Badge variant="outline">
              R{fight.round}
            </Badge>
            <ChevronRight 
              className={`w-5 h-5 text-muted-foreground transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`} 
            />
          </div>
        </div>

        {/* Date and Prize */}
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(fight.createdAt)} at {formatTime(fight.createdAt)}
          </div>
          {fight.prizeAwarded && (
            <div className="flex items-center gap-1 text-green-500">
              <Award className="w-3 h-3" />
              Prize: ${fight.prizeAmount}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t p-4 bg-muted/30">
          <div className="grid grid-cols-2 gap-6">
            {/* Fighter 1 Stats */}
            <div>
              <h4 className="font-medium mb-2">{fighter1?.skills.name || 'Fighter 1'} Stats</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Health</span>
                  <span>{fight.fightData.fighter1.currentHealth.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Significant Strikes</span>
                  <span>{fight.fightData.fighter1.significantStrikes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Takedowns</span>
                  <span>{fight.fightData.fighter1.takedownsLanded}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Knockdowns</span>
                  <span>{fight.fightData.fighter1.knockdowns}</span>
                </div>
              </div>
            </div>

            {/* Fighter 2 Stats */}
            <div>
              <h4 className="font-medium mb-2">{fighter2?.skills.name || 'Fighter 2'} Stats</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Health</span>
                  <span>{fight.fightData.fighter2.currentHealth.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Significant Strikes</span>
                  <span>{fight.fightData.fighter2.significantStrikes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Takedowns</span>
                  <span>{fight.fightData.fighter2.takedownsLanded}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Knockdowns</span>
                  <span>{fight.fightData.fighter2.knockdowns}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Prize Award Button */}
          {!fight.prizeAwarded && (
            <div className="mt-4 pt-4 border-t">
              <Button size="sm" variant="outline">
                <Award className="w-4 h-4 mr-2" />
                Award Prize
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
