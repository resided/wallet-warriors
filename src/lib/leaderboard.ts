// FightBook - Leaderboard API
// Rank fighters by win count

import { supabase, isSupabaseConfigured } from './supabase';
import type { CompleteAgent } from '@/types/agent';
import { getAllAgents } from './storage';

export interface LeaderboardEntry {
  id: string;
  name: string;
  nickname: string;
  winCount: number;
  lossCount: number;
  totalFights: number;
  ranking: number;
  level: number;
}

/**
 * Get leaderboard - fighters ranked by win count
 */
export async function getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('fighters')
      .select('id, name, win_count, stats, metadata')
      .order('win_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch leaderboard:', error.message);
      return getLocalLeaderboard(limit);
    }

    return data.map((row, index) => ({
      id: row.id,
      name: row.name,
      nickname: row.stats?.nickname || 'The Fighter',
      winCount: row.win_count || 0,
      lossCount: row.metadata?.losses || 0,
      totalFights: row.metadata?.totalFights || 0,
      ranking: row.metadata?.ranking || 1000,
      level: row.metadata?.level || 1,
    }));
  } else {
    return getLocalLeaderboard(limit);
  }
}

/**
 * Get leaderboard from localStorage (fallback)
 */
function getLocalLeaderboard(limit: number): LeaderboardEntry[] {
  const agents = getAllAgents();
  
  return agents
    .map(agent => ({
      id: agent.metadata.id,
      name: agent.skills.name || 'Unnamed',
      nickname: agent.skills.nickname || 'The Fighter',
      winCount: agent.metadata.wins || 0,
      lossCount: agent.metadata.losses || 0,
      totalFights: agent.metadata.totalFights || 0,
      ranking: agent.metadata.ranking || 1000,
      level: agent.metadata.level || 1,
    }))
    .sort((a, b) => b.winCount - a.winCount)
    .slice(0, limit);
}

/**
 * Get win count for specific fighter
 */
export async function getWinCount(fighterId: string): Promise<number> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('fighters')
      .select('win_count')
      .eq('id', fighterId)
      .single();

    if (error || !data) {
      return getLocalWinCount(fighterId);
    }

    return data.win_count || 0;
  } else {
    return getLocalWinCount(fighterId);
  }
}

/**
 * Get win count from localStorage (fallback)
 */
function getLocalWinCount(fighterId: string): number {
  const agents = getAllAgents();
  const agent = agents.find(a => a.metadata.id === fighterId);
  return agent?.metadata.wins || 0;
}

/**
 * Increment win count for a fighter (called after fight)
 */
export async function incrementWinCount(fighterId: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    // Get current win count
    const { data, error: fetchError } = await supabase
      .from('fighters')
      .select('win_count, metadata')
      .eq('id', fighterId)
      .single();

    if (fetchError) {
      console.error('Failed to fetch fighter for win increment:', fetchError.message);
      return false;
    }

    const newWinCount = (data.win_count || 0) + 1;
    const metadata = data.metadata || {};
    const newTotalFights = (metadata.totalFights || 0) + 1;
    const newWins = (metadata.wins || 0) + 1;

    const { error: updateError } = await supabase
      .from('fighters')
      .update({
        win_count: newWinCount,
        metadata: {
          ...metadata,
          wins: newWins,
          totalFights: newTotalFights,
        },
      })
      .eq('id', fighterId);

    if (updateError) {
      console.error('Failed to increment win count:', updateError.message);
      return false;
    }

    return true;
  } else {
    // Update localStorage
    return incrementLocalWinCount(fighterId);
  }
}

/**
 * Increment loss count for a fighter
 */
export async function incrementLossCount(fighterId: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error: fetchError } = await supabase
      .from('fighters')
      .select('metadata')
      .eq('id', fighterId)
      .single();

    if (fetchError) {
      console.error('Failed to fetch fighter for loss increment:', fetchError.message);
      return false;
    }

    const metadata = data.metadata || {};
    const newTotalFights = (metadata.totalFights || 0) + 1;
    const newLosses = (metadata.losses || 0) + 1;

    const { error: updateError } = await supabase
      .from('fighters')
      .update({
        metadata: {
          ...metadata,
          losses: newLosses,
          totalFights: newTotalFights,
        },
      })
      .eq('id', fighterId);

    if (updateError) {
      console.error('Failed to increment loss count:', updateError.message);
      return false;
    }

    return true;
  } else {
    return incrementLocalLossCount(fighterId);
  }
}

/**
 * Increment local win count
 */
function incrementLocalWinCount(fighterId: string): boolean {
  try {
    const agents = getAllAgents();
    const index = agents.findIndex(a => a.metadata.id === fighterId);
    
    if (index >= 0) {
      agents[index].metadata.wins = (agents[index].metadata.wins || 0) + 1;
      agents[index].metadata.totalFights = (agents[index].metadata.totalFights || 0) + 1;
      localStorage.setItem('fightbook_agents', JSON.stringify(agents));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to increment local win count:', error);
    return false;
  }
}

/**
 * Increment local loss count
 */
function incrementLocalLossCount(fighterId: string): boolean {
  try {
    const agents = getAllAgents();
    const index = agents.findIndex(a => a.metadata.id === fighterId);
    
    if (index >= 0) {
      agents[index].metadata.losses = (agents[index].metadata.losses || 0) + 1;
      agents[index].metadata.totalFights = (agents[index].metadata.totalFights || 0) + 1;
      localStorage.setItem('fightbook_agents', JSON.stringify(agents));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to increment local loss count:', error);
    return false;
  }
}

/**
 * Get user's rank on the leaderboard
 */
export async function getUserRank(userId: string): Promise<number | null> {
  const leaderboard = await getLeaderboard(1000);
  const index = leaderboard.findIndex(entry => entry.id === userId);
  return index >= 0 ? index + 1 : null;
}
