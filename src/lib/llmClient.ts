// FightBook - LLM Client Integration
// Integrates with OpenAI/Anthropic APIs for AI-powered fight decisions

import {
  FighterStats,
  STRIKING_TECHNIQUES,
  GRAPPLING_TECHNIQUES,
  SUBMISSION_TECHNIQUES,
  GROUND_TECHNIQUES,
  Technique,
} from '@/types/fight';

export type LlmProvider = 'openai' | 'anthropic';

export interface LlmConfig {
  provider: LlmProvider;
  apiKey: string;
  model?: string;
}

/**
 * Get all technique names grouped by position
 */
function getTechniquesByPosition(position: string): string[] {
  const allTechs = [
    ...STRIKING_TECHNIQUES,
    ...GRAPPLING_TECHNIQUES,
    ...SUBMISSION_TECHNIQUES,
    ...GROUND_TECHNIQUES,
  ];
  
  return [...new Set(
    allTechs
      .filter(t => t.position.includes(position as any))
      .map(t => t.name)
  )];
}

/**
 * Get all available technique names
 */
function getAllTechniqueNames(): string[] {
  const allTechs = [
    ...STRIKING_TECHNIQUES,
    ...GRAPPLING_TECHNIQUES,
    ...SUBMISSION_TECHNIQUES,
    ...GROUND_TECHNIQUES,
  ];
  return [...new Set(allTechs.map(t => t.name))];
}

/**
 * Build a detailed battle prompt for the LLM
 */
export function buildBattlePrompt(
  actor: FighterStats,
  target: FighterStats,
  gameState: {
    round: number;
    timeRemaining: number;
    myHealth: number;
    myStamina: number;
    myPosition: string;
    oppHealth: number;
    oppStamina: number;
    oppPosition: string;
    recentActions: string[];
  }
): string {
  const availableTechs = getTechniquesByPosition(gameState.myPosition);
  
  const recentActionsText = gameState.recentActions.length > 0
    ? gameState.recentActions.slice(-3).map(a => `- ${a}`).join('\n')
    : 'No recent actions';

  return `You are ${actor.name}, an MMA fighter in a live fight.

## FIGHT SITUATION
- Round: ${gameState.round}/3
- Time Remaining: ${Math.floor(gameState.timeRemaining / 60)}:${(gameState.timeRemaining % 60).toString().padStart(2, '0')}
- Your Health: ${gameState.myHealth.toFixed(0)}%
- Your Stamina: ${gameState.myStamina.toFixed(0)}%
- Your Position: ${gameState.myPosition}

## OPPONENT STATUS
- Opponent: ${target.name}
- Opponent Health: ${gameState.oppHealth.toFixed(0)}%
- Opponent Stamina: ${gameState.oppStamina.toFixed(0)}%
- Opponent Position: ${gameState.oppPosition}

## YOUR STATS
- Striking: ${actor.striking}
- Wrestling: ${actor.wrestling}
- Submissions: ${actor.submissions}
- Ground Game: ${actor.groundGame}
- Cardio: ${actor.cardio}
- Fight IQ: ${actor.fightIQ}
- Aggression: ${(actor.aggression * 100).toFixed(0)}%

## RECENT ACTIONS
${recentActionsText}

## AVAILABLE TECHNIQUES (from your current position)
${availableTechs.map(t => `- ${t}`).join('\n')}

## YOUR TASK
Choose ONE technique from the available techniques list above. Consider:
1. Your position advantage
2. Your opponent's health and stamina
3. Your own stamina level
4. Whether you're winning or losing the fight
5. Whether to go for a finish or conserve energy

Respond in JSON format:
{"technique": "Technique Name", "reasoning": "Brief reason for your choice"}`;
}

/**
 * Map technique name from LLM response to actual Technique object
 */
export function mapTechniqueName(name: string): Technique | null {
  const allTechs = [
    ...STRIKING_TECHNIQUES,
    ...GRAPPLING_TECHNIQUES,
    ...SUBMISSION_TECHNIQUES,
    ...GROUND_TECHNIQUES,
  ];
  
  // Exact match
  let tech = allTechs.find(t => t.name.toLowerCase() === name.toLowerCase());
  if (tech) return tech;
  
  // Partial match
  tech = allTechs.find(t => t.name.toLowerCase().includes(name.toLowerCase()));
  if (tech) return tech;
  
  // Try the reverse
  tech = allTechs.find(t => name.toLowerCase().includes(t.name.toLowerCase()));
  if (tech) return tech;
  
  return null;
}

/**
 * Get LLM decision for the actor fighter
 * Calls the configured LLM API and returns technique choice
 */
export async function getLlmDecision(
  agent: FighterStats,
  opponent: FighterStats,
  gameState: {
    round: number;
    timeRemaining: number;
    myHealth: number;
    myStamina: number;
    myPosition: string;
    oppHealth: number;
    oppStamina: number;
    oppPosition: string;
    recentActions: string[];
  },
  config: LlmConfig
): Promise<string> {
  const prompt = buildBattlePrompt(agent, opponent, gameState);
  
  try {
    if (config.provider === 'openai') {
      return await callOpenAi(prompt, config);
    } else {
      return await callAnthropic(prompt, config);
    }
  } catch (error) {
    console.error('LLM API error:', error);
    // Fallback to random technique
    return getRandomTechnique(gameState.myPosition);
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAi(prompt: string, config: LlmConfig): Promise<string> {
  const model = config.model || 'gpt-4o-mini';
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    signal: AbortSignal.timeout(5000), // 5 second timeout
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an MMA fighter making tactical decisions in a fight. Respond with JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';
  
  return parseLlmResponse(content);
}

/**
 * Call Anthropic API
 */
async function callAnthropic(prompt: string, config: LlmConfig): Promise<string> {
  const model = config.model || 'claude-3-haiku-20240307';
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    signal: AbortSignal.timeout(5000), // 5 second timeout
    body: JSON.stringify({
      model,
      max_tokens: 200,
      system: 'You are an MMA fighter making tactical decisions in a fight. Respond with JSON only.',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text || '';
  
  return parseLlmResponse(content);
}

/**
 * Parse LLM JSON response to extract technique name
 */
function parseLlmResponse(content: string): string {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    if (parsed.technique) {
      return parsed.technique;
    }
    
    throw new Error('No technique in response');
  } catch (error) {
    console.error('Failed to parse LLM response:', content);
    // Try to extract technique name directly using common patterns
    const techMatch = content.match(/"technique"\s*:\s*"([^"]+)"/i);
    if (techMatch) {
      return techMatch[1];
    }
    
    throw new Error('Could not parse technique from LLM response');
  }
}

/**
 * Get random technique by position (fallback)
 */
function getRandomTechnique(position: string): string {
  const techs = getTechniquesByPosition(position);
  if (techs.length === 0) {
    // Fallback to standing techniques
    return getAllTechniqueNames()[Math.floor(Math.random() * getAllTechniqueNames().length)];
  }
  return techs[Math.floor(Math.random() * techs.length)];
}

/**
 * Validate that an LLM configuration is properly set up
 */
export function validateLlmConfig(config: LlmConfig | null | undefined): config is LlmConfig {
  if (!config) return false;
  if (!config.apiKey) return false;
  if (!config.provider || !['openai', 'anthropic'].includes(config.provider)) {
    return false;
  }
  return true;
}
