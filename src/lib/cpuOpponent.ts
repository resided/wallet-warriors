// FightBook - CPU Opponent System
// Basic AI opponent with configurable difficulty levels

import { FighterStats, DEFAULT_FIGHTER } from '@/types/fight';

export type CpuDifficulty = 'easy' | 'medium' | 'hard';

export interface CpuFighter extends FighterStats {
  id: string;
  isCpu: true;
  difficulty: CpuDifficulty;
  position: 'standing' | 'clinch' | 'ground_top' | 'ground_bottom';
}

// Difficulty stat multipliers
export const CPU_DIFFICULTIES: Record<CpuDifficulty, {
  statMultiplier: number;
  aggressionMod: number;
  fightIqMod: number;
  randomness: number;
}> = {
  easy: {
    statMultiplier: 0.7,
    aggressionMod: -0.2,
    fightIqMod: -20,
    randomness: 0.4,
  },
  medium: {
    statMultiplier: 0.9,
    aggressionMod: 0,
    fightIqMod: 0,
    randomness: 0.2,
  },
  hard: {
    statMultiplier: 1.1,
    aggressionMod: 0.15,
    fightIqMod: 15,
    randomness: 0.1,
  },
};

const CPU_NAMES = [
  'The Crusher', 'Iron Fist', 'The Mauler', 'Shadow Boxer', 'Steel Storm',
  'The Dominator', 'Phantom Strike', 'Thunder Punch', 'The Enforcer', 'Viper',
  'Storm Breaker', 'The Beast', 'Titan', 'Apex Predator', 'War Machine',
];

const CPU_NICKNAMES = [
  'The Destroyer', 'The Hammer', 'The Serpent', 'The Storm', 'The Titan',
  'Iron Will', 'The Nightmare', 'The Juggernaut', 'The Viper', 'Steel Edge',
];

/**
 * Generate a random CPU fighter name
 */
function generateCpuName(): string {
  return CPU_NAMES[Math.floor(Math.random() * CPU_NAMES.length)];
}

/**
 * Generate a random CPU nickname
 */
function generateCpuNickname(): string {
  return CPU_NICKNAMES[Math.floor(Math.random() * CPU_NICKNAMES.length)];
}

/**
 * Create a CPU fighter with stats scaled by difficulty
 * @param name - Optional custom name (generates random if not provided)
 * @param difficulty - Difficulty level (easy/medium/hard)
 * @param baseStats - Optional base stats to scale from
 */
export function createCpuFighter(
  name?: string,
  difficulty: CpuDifficulty = 'medium',
  baseStats?: Partial<FighterStats>
): CpuFighter {
  const config = CPU_DIFFICULTIES[difficulty];
  const base = baseStats ? { ...DEFAULT_FIGHTER, ...baseStats } : DEFAULT_FIGHTER;
  
  // Scale stats based on difficulty
  const scaleStat = (value: number) => {
    const scaled = value * config.statMultiplier;
    // Add some randomness
    const variance = (Math.random() - 0.5) * 10 * config.randomness;
    return Math.max(20, Math.min(95, Math.round(scaled + variance)));
  };

  const fighter: CpuFighter = {
    ...base,
    id: `cpu_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    name: name || generateCpuName(),
    nickname: generateCpuNickname(),
    striking: scaleStat(base.striking),
    punchSpeed: scaleStat(base.punchSpeed),
    kickPower: scaleStat(base.kickPower),
    headMovement: scaleStat(base.headMovement),
    wrestling: scaleStat(base.wrestling),
    takedownDefense: scaleStat(base.takedownDefense),
    submissions: scaleStat(base.submissions),
    submissionDefense: scaleStat(base.submissionDefense),
    groundGame: scaleStat(base.groundGame),
    cardio: scaleStat(base.cardio),
    chin: scaleStat(base.chin),
    recovery: scaleStat(base.recovery),
    // Adjust mental stats
    aggression: Math.max(0.2, Math.min(0.9, base.aggression + config.aggressionMod)),
    fightIQ: Math.max(20, Math.min(95, base.fightIQ + config.fightIqMod)),
    heart: scaleStat(base.heart),
    isCpu: true,
    difficulty,
    position: 'standing',
  };

  return fighter;
}

/**
 * Context for CPU decision making
 */
interface CpuDecisionContext {
  round: number;
  timeRemaining: number;
  actorHealth: number;
  actorStamina: number;
  actorPosition: 'standing' | 'clinch' | 'ground_top' | 'ground_bottom';
  targetHealth: number;
  targetStamina: number;
  targetPosition: 'standing' | 'clinch' | 'ground_top' | 'ground_bottom';
  recentActions: string[];
  isWinning: boolean;
  isTired: boolean;
  targetIsHurt: boolean;
}

/**
 * Get CPU decision - simple strategic AI
 * Analyzes fight state and makes intelligent choices
 */
export function getCpuDecision(
  actor: CpuFighter,
  target: CpuFighter | FighterStats,
  context: CpuDecisionContext
): string {
  const config = CPU_DIFFICULTIES[actor.difficulty];
  const randomness = Math.random();
  
  // If randomness dominates (lower difficulty = more random)
  if (randomness < config.randomness) {
    return getRandomTechniqueByPosition(actor.position);
  }

  // Strategic decision making
  
  // 1. If target is hurt and in striking range, go for finish
  if (context.targetIsHurt && context.targetHealth < 25) {
    if (context.actorPosition === 'standing') {
      const finishers = ['Head Kick', 'Superman Punch', 'Flying Knee', 'Overhand'];
      return finishers[Math.floor(Math.random() * finishers.length)];
    }
    if (context.actorPosition === 'ground_top') {
      return 'Ground & Pound';
    }
  }

  // 2. If tired, play defensively
  if (context.isTired || context.actorStamina < 30) {
    if (context.actorPosition === 'clinch') {
      return Math.random() > 0.5 ? 'Break Clinch' : 'Knee';
    }
    if (context.actorPosition === 'ground_bottom') {
      return 'Get Up';
    }
    // Try to recover stamina by using low-cost techniques
    const lightTechs = ['Jab', 'Leg Kick'];
    return lightTechs[Math.floor(Math.random() * lightTechs.length)];
  }

  // 3. If behind, become more aggressive
  if (!context.isWinning && context.targetHealth > context.actorHealth + 20) {
    if (context.actorPosition === 'standing' && Math.random() > 0.4) {
      const aggressive = ['Double Leg', 'Single Leg', 'Body Lock'];
      return aggressive[Math.floor(Math.random() * aggressive.length)];
    }
  }

  // 4. Position-based decisions
  switch (actor.position) {
    case 'standing':
      // Decide between striking and grappling
      if (actor.wrestling > actor.striking + 15 && Math.random() > 0.3) {
        // Good wrestler, try takedown
        const takedowns = ['Double Leg', 'Single Leg', 'Body Lock', 'Ankle Pick'];
        return takedowns[Math.floor(Math.random() * takedowns.length)];
      } else if (actor.striking > actor.wrestling) {
        // Good striker, mix it up
        const strikers = ['Jab', 'Cross', 'Hook', 'Leg Kick', 'Body Kick', 'Uppercut'];
        return strikers[Math.floor(Math.random() * strikers.length)];
      }
      return getRandomTechniqueByPosition('standing');

    case 'clinch':
      // Clinch work
      if (actor.submissions > 60 && Math.random() > 0.5) {
        return 'Guillotine';
      }
      const clinchTechs = ['Knee', 'Elbow', 'Trip', 'Break Clinch'];
      return clinchTechs[Math.floor(Math.random() * clinchTechs.length)];

    case 'ground_top':
      // Ground and pound or submission
      if (actor.submissions > 60 && Math.random() > 0.4) {
        const subs = ['Rear Naked Choke', 'Armbar', 'Kimura', 'Americana'];
        return subs[Math.floor(Math.random() * subs.length)];
      }
      const gnp = ['Ground & Pound', 'Elbow on Ground', 'Pass Guard'];
      return gnp[Math.floor(Math.random() * gnp.length)];

    case 'ground_bottom':
      // Escape or sweep
      if (actor.groundGame > 60 && Math.random() > 0.4) {
        const sweeps = ['Sweep', 'Posture Up'];
        return sweeps[Math.floor(Math.random() * sweeps.length)];
      }
      return 'Get Up';
  }

  // Fallback
  return getRandomTechniqueByPosition(actor.position);
}

/**
 * Get a random technique based on position
 */
function getRandomTechniqueByPosition(position: string): string {
  const techs: Record<string, string[]> = {
    standing: ['Jab', 'Cross', 'Hook', 'Leg Kick', 'Double Leg'],
    clinch: ['Knee', 'Elbow', 'Break Clinch', 'Trip'],
    ground_top: ['Ground & Pound', 'Elbow on Ground', 'Pass Guard', 'Rear Naked Choke'],
    ground_bottom: ['Get Up', 'Sweep', 'Posture Up', 'Triangle'],
  };

  const options = techs[position] || techs.standing;
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Build context object for CPU decision
 */
export function buildCpuContext(
  actor: CpuFighter,
  target: { position?: string },
  round: number,
  timeRemaining: number,
  recentActions: string[] = []
): CpuDecisionContext {
  return {
    round,
    timeRemaining,
    actorHealth: 100, // Will be updated by caller
    actorStamina: 100, // Will be updated by caller
    actorPosition: actor.position || 'standing',
    targetHealth: 100, // Will be updated by caller
    targetStamina: 100, // Will be updated by caller
    targetPosition: (target.position as CpuDecisionContext['targetPosition']) || 'standing',
    recentActions,
    isWinning: true, // Will be updated by caller
    isTired: false, // Will be updated by caller
    targetIsHurt: false, // Will be updated by caller
  };
}
