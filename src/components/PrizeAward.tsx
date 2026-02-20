// FightBook - Prize Award Component
// Manual prize awarding UI for fight winners

import { useState } from 'react';
import { Award, DollarSign, Check, X, Flame } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { awardPrize } from '@/lib/fightStorage';

interface PrizeAwardProps {
  fightId: string;
  winnerName?: string;
  prizeAmount?: number;
  isEntertaining?: boolean;
  onPrizeAwarded?: (amount: number, isEntertaining: boolean) => void;
}

export default function PrizeAward({
  fightId,
  winnerName = 'Winner',
  prizeAmount = 0,
  isEntertaining: initialEntertaining = false,
  onPrizeAwarded,
}: PrizeAwardProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState(prizeAmount || 100);
  const [isLoading, setIsLoading] = useState(false);
  const [isAwarded, setIsAwarded] = useState(prizeAmount > 0);
  const [currentPrize, setCurrentPrize] = useState(prizeAmount);
  const [isEntertaining, setIsEntertaining] = useState(initialEntertaining);
  const [bonusAmount, setBonusAmount] = useState(50);

  const handleAwardPrize = async () => {
    const totalAmount = amount + (isEntertaining ? bonusAmount : 0);
    
    if (totalAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid prize amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await awardPrize(fightId, totalAmount, isEntertaining);
      
      if (success) {
        setIsAwarded(true);
        setCurrentPrize(totalAmount);
        
        if (isEntertaining) {
          toast({
            title: "Prize + Bonus Awarded! 🔥",
            description: `Awarded $${amount} prize + $${bonusAmount} bonus to ${winnerName}`,
          });
        } else {
          toast({
            title: "Prize Awarded!",
            description: `Awarded $${amount} to ${winnerName}`,
          });
        }
        
        onPrizeAwarded?.(totalAmount, isEntertaining);
      } else {
        toast({
          title: "Error",
          description: "Failed to award prize. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to award prize:', error);
      toast({
        title: "Error",
        description: "An error occurred while awarding the prize",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Already awarded state
  if (isAwarded) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-green-500" />
            Prize Awarded
            {isEntertaining && (
              <Flame className="w-5 h-5 text-orange-500" />
            )}
          </CardTitle>
          <CardDescription>
            Prize has been awarded to the winner
            {isEntertaining && " (including entertainment bonus)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-green-500">
            <DollarSign className="w-5 h-5" />
            <span className="text-2xl font-display">${currentPrize}</span>
          </div>
          {isEntertaining && (
            <div className="flex items-center gap-2 text-orange-500 mt-2 text-sm">
              <Flame className="w-4 h-4" />
              <span>Includes entertainment bonus</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Award form
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="w-5 h-5" />
          Award Prize to Winner
        </CardTitle>
        <CardDescription>
          Manually award prize tokens to {winnerName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prize-amount">Prize Amount ($FIGHT)</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="prize-amount"
                type="number"
                min="0"
                step="10"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="pl-9"
                placeholder="Enter amount"
              />
            </div>
            {/* Quick amount buttons */}
            <div className="flex gap-1">
              {[50, 100, 250, 500].map((val) => (
                <Button
                  key={val}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(val)}
                  className={amount === val ? 'bg-primary text-primary-foreground' : ''}
                >
                  ${val}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Bonus for entertaining fight */}
        <div className="flex items-start gap-3 p-3 rounded-lg border border-orange-500/30 bg-orange-500/5">
          <Checkbox
            id="entertaining"
            checked={isEntertaining}
            onCheckedChange={(checked) => setIsEntertaining(checked === true)}
          />
          <div className="flex-1">
            <Label htmlFor="entertaining" className="flex items-center gap-2 cursor-pointer">
              <Flame className="w-4 h-4 text-orange-500" />
              Bonus for entertaining fight
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Award extra ${bonusAmount} for an exciting, crowd-pleasing fight
            </p>
            
            {isEntertaining && (
              <div className="flex gap-1 mt-2">
                {[25, 50, 100, 200].map((val) => (
                  <Button
                    key={val}
                    variant="outline"
                    size="sm"
                    onClick={() => setBonusAmount(val)}
                    className={bonusAmount === val ? 'bg-orange-500/20 text-orange-500 border-orange-500' : ''}
                  >
                    +${val}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button 
          onClick={handleAwardPrize} 
          disabled={isLoading || (amount + (isEntertaining ? bonusAmount : 0)) <= 0}
          className="w-full"
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Awarding...
            </>
          ) : (
            <>
              <Award className="w-4 h-4 mr-2" />
              Award ${amount + (isEntertaining ? bonusAmount : 0)} Prize
              {isEntertaining && <Flame className="w-4 h-4 ml-2 text-orange-400" />}
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          This is a manual system. Prize will be verified and awarded separately.
        </p>
      </CardContent>
    </Card>
  );
}
