// FightBook - Agent Adapter
// Converts Partial<SkillsMdConfig> to FighterStats for use with FightEngine

import type { SkillsMdConfig } from '@/types/agent';
import type { FighterStats } from '@/types/fight';
import { DEFAULT_SKILLS } from '@/types/agent';

/**
 * Convert a Partial<SkillsMdConfig> (e.g. from parseSkillsMd or an API request)
 * to FighterStats suitable for passing directly to the FightEngine constructor.
 *
 * Example:
 *   import { parseSkillsMd, skillsToFighterStats, FightEngine } from 'fightbook';
 *   const stats = skillsToFighterStats(parseSkillsMd(content));
 *   const engine = new FightEngine(stats, opponentStats, { onFightEnd: ... });
 */
export function skillsToFighterStats(partial: Partial<SkillsMdConfig>, fallbackName?: string): FighterStats {
  const s = { ...DEFAULT_SKILLS, ...partial };
  return {
    name: s.name || fallbackName || 'Fighter',
    nickname: s.nickname,
    striking: s.striking,
    punchSpeed: s.punchSpeed,
    kickPower: s.kickPower,
    headMovement: s.headMovement,
    wrestling: s.wrestling,
    takedownDefense: s.takedownDefense,
    submissions: s.submissions,
    submissionDefense: s.submissionDefense,
    groundGame: (s.groundAndPound + s.topControl + s.bottomGame) / 3,
    cardio: s.cardio,
    chin: s.chin,
    recovery: s.recovery,
    aggression: s.aggression,
    fightIQ: s.fightIQ,
    heart: s.heart,
  };
}
