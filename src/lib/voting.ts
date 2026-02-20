// FightBook - Voting API
// Vote on most entertaining fights

import { supabase, isSupabaseConfigured } from './supabase';

export interface VoteRecord {
  id: string;
  fightId: string;
  userId: string;
  createdAt: number;
}

export interface EntertainingFight {
  fightId: string;
  voteCount: number;
  isEntertaining: boolean;
}

// Local storage fallback key
const VOTES_STORAGE_KEY = 'fightbook_votes';

/**
 * Vote for a fight as entertaining
 */
export async function voteForFight(fightId: string, userId?: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase && userId) {
    const { error } = await supabase
      .from('fight_votes')
      .insert({
        fight_id: fightId,
        user_id: userId,
      });

    if (error) {
      console.error('Failed to vote for fight:', error.message);
      return false;
    }

    return true;
  } else {
    // Fallback to localStorage
    return voteForFightLocal(fightId, userId || 'anonymous');
  }
}

/**
 * Remove vote from a fight
 */
export async function removeVote(fightId: string, userId?: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase && userId) {
    const { error } = await supabase
      .from('fight_votes')
      .delete()
      .eq('fight_id', fightId)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to remove vote:', error.message);
      return false;
    }

    return true;
  } else {
    return removeVoteLocal(fightId, userId || 'anonymous');
  }
}

/**
 * Toggle vote for a fight
 */
export async function toggleVote(fightId: string, userId?: string): Promise<{ voted: boolean }> {
  const hasVoted = await hasVotedForFight(fightId, userId);
  
  if (hasVoted) {
    await removeVote(fightId, userId);
    return { voted: false };
  } else {
    await voteForFight(fightId, userId);
    return { voted: true };
  }
}

/**
 * Get vote count for a fight
 */
export async function getVoteCount(fightId: string): Promise<number> {
  if (isSupabaseConfigured() && supabase) {
    const { count, error } = await supabase
      .from('fight_votes')
      .select('*', { count: 'exact', head: true })
      .eq('fight_id', fightId);

    if (error) {
      console.error('Failed to get vote count:', error.message);
      return getVoteCountLocal(fightId);
    }

    return count || 0;
  } else {
    return getVoteCountLocal(fightId);
  }
}

/**
 * Check if user has voted for a fight
 */
export async function hasVotedForFight(fightId: string, userId?: string): Promise<boolean> {
  if (!userId) return false;
  
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('fight_votes')
      .select('id')
      .eq('fight_id', fightId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to check vote status:', error.message);
      return hasVotedLocal(fightId, userId);
    }

    return !!data;
  } else {
    return hasVotedLocal(fightId, userId);
  }
}

/**
 * Get most entertaining fights
 */
export async function getMostEntertainingFights(limit: number = 10): Promise<EntertainingFight[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('fight_votes')
      .select('fight_id, fights!inner(is_entertaining)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get entertaining fights:', error.message);
      return getMostEntertainingFightsLocal(limit);
    }

    // Count votes per fight
    const voteCounts = new Map<string, number>();
    data.forEach((vote: any) => {
      const count = voteCounts.get(vote.fight_id) || 0;
      voteCounts.set(vote.fight_id, count + 1);
    });

    // Convert to array and sort
    const fights: EntertainingFight[] = Array.from(voteCounts.entries())
      .map(([fightId, voteCount]) => ({
        fightId,
        voteCount,
        isEntertaining: false, // Would need to fetch from fights table
      }))
      .sort((a, b) => b.voteCount - a.voteCount)
      .slice(0, limit);

    return fights;
  } else {
    return getMostEntertainingFightsLocal(limit);
  }
}

// LocalStorage fallback functions

function getLocalVotes(): Record<string, string[]> {
  try {
    const stored = localStorage.getItem(VOTES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveLocalVotes(votes: Record<string, string[]>): void {
  localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
}

function voteForFightLocal(fightId: string, userId: string): boolean {
  const votes = getLocalVotes();
  if (!votes[fightId]) {
    votes[fightId] = [];
  }
  if (!votes[fightId].includes(userId)) {
    votes[fightId].push(userId);
    saveLocalVotes(votes);
  }
  return true;
}

function removeVoteLocal(fightId: string, userId: string): boolean {
  const votes = getLocalVotes();
  if (votes[fightId]) {
    votes[fightId] = votes[fightId].filter(id => id !== userId);
    saveLocalVotes(votes);
  }
  return true;
}

function getVoteCountLocal(fightId: string): number {
  const votes = getLocalVotes();
  return votes[fightId]?.length || 0;
}

function hasVotedLocal(fightId: string, userId: string): boolean {
  const votes = getLocalVotes();
  return votes[fightId]?.includes(userId) || false;
}

function getMostEntertainingFightsLocal(limit: number): EntertainingFight[] {
  const votes = getLocalVotes();
  
  return Object.entries(votes)
    .map(([fightId, userIds]) => ({
      fightId,
      voteCount: userIds.length,
      isEntertaining: false,
    }))
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, limit);
}
