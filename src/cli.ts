#!/usr/bin/env node

// FightBook CLI
// Command-line interface for running AI combat simulations

import fs from 'fs';
import path from 'path';
import { FightEngine } from './engine/FightEngine';
import { parseSkillsMd, createNewAgent, generateFullSkillsMd } from './types/agent';
import type { CompleteAgent } from './types/agent';

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  console.log(`
FightBook CLI - AI Combat Arena

Commands:
  fightbook init <name>           Create a new fighter template
  fightbook fight <agent1> <agent2>  Run a fight between two agents
  fightbook validate <file>       Validate a skills.md file
  fightbook version               Show version

Examples:
  fightbook init my-fighter
  fightbook fight ./agent1.md ./agent2.md
  fightbook validate ./skills.md
`);
}

function initFighter(name: string) {
  const agent = createNewAgent(name);
  const skillsMd = generateFullSkillsMd(agent);
  const filename = `${name.toLowerCase().replace(/\s+/g, '-')}.md`;
  
  fs.writeFileSync(filename, skillsMd);
  console.log(`✅ Created ${filename}`);
  console.log('Edit the file to customize your fighter, then run:');
  console.log(`  fightbook fight ${filename} <opponent.md>`);
}

function validateSkills(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const skills = parseSkillsMd(content);
  
  console.log('✅ Valid skills.md');
  console.log(`  Name: ${skills.name || 'Not set'}`);
  console.log(`  Striking: ${skills.striking}`);
  console.log(`  Wrestling: ${skills.wrestling}`);
  console.log(`  Submissions: ${skills.submissions}`);
  console.log(`  Cardio: ${skills.cardio}`);
}

async function runFight(file1: string, file2: string) {
  if (!fs.existsSync(file1)) {
    console.error(`❌ File not found: ${file1}`);
    process.exit(1);
  }
  if (!fs.existsSync(file2)) {
    console.error(`❌ File not found: ${file2}`);
    process.exit(1);
  }
  
  const content1 = fs.readFileSync(file1, 'utf-8');
  const content2 = fs.readFileSync(file2, 'utf-8');
  
  const skills1 = parseSkillsMd(content1);
  const skills2 = parseSkillsMd(content2);
  
  const agent1: CompleteAgent = {
    metadata: {
      id: 'agent_1',
      name: skills1.name || 'Agent 1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
      totalFights: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      kos: 0,
      submissions: 0,
      currentStreak: 0,
      bestStreak: 0,
      ranking: 1000,
      earnings: 0,
      xp: 0,
      level: 1,
    },
    skills: skills1 as any,
    personality: {
      archetype: 'balanced',
      attitude: 'intense',
      preFightQuote: "Let's go!",
      winQuote: 'Victory!',
      lossQuote: 'Good fight.',
      fightingPhilosophy: 'Adapt and overcome.',
    },
    backstory: {
      origin: 'Unknown',
      trainingCamp: 'CLI Academy',
      signatureMove: 'The Haymaker',
      rivalries: [],
      achievements: [],
    },
    social: { agentName: 'agent1' },
  };
  
  const agent2: CompleteAgent = {
    ...agent1,
    metadata: { ...agent1.metadata, id: 'agent_2', name: skills2.name || 'Agent 2' },
    skills: skills2 as any,
    social: { agentName: 'agent2' },
  };
  
  console.log(`\n🥊 ${agent1.skills.name} vs ${agent2.skills.name}\n`);
  
  // Extract FighterStats from CompleteAgent
  const fighter1Stats = {
    name: agent1.skills.name,
    nickname: agent1.skills.nickname,
    striking: agent1.skills.striking,
    punchSpeed: agent1.skills.punchSpeed,
    kickPower: agent1.skills.kickPower,
    headMovement: agent1.skills.headMovement,
    wrestling: agent1.skills.wrestling,
    takedownDefense: agent1.skills.takedownDefense,
    submissions: agent1.skills.submissions,
    submissionDefense: agent1.skills.submissionDefense,
    groundGame: (agent1.skills.groundAndPound + agent1.skills.topControl + agent1.skills.bottomGame) / 3,
    cardio: agent1.skills.cardio,
    chin: agent1.skills.chin,
    recovery: agent1.skills.recovery,
    aggression: agent1.skills.aggression,
    fightIQ: agent1.skills.fightIQ,
    heart: agent1.skills.heart,
  };
  
  const fighter2Stats = {
    name: agent2.skills.name,
    nickname: agent2.skills.nickname,
    striking: agent2.skills.striking,
    punchSpeed: agent2.skills.punchSpeed,
    kickPower: agent2.skills.kickPower,
    headMovement: agent2.skills.headMovement,
    wrestling: agent2.skills.wrestling,
    takedownDefense: agent2.skills.takedownDefense,
    submissions: agent2.skills.submissions,
    submissionDefense: agent2.skills.submissionDefense,
    groundGame: (agent2.skills.groundAndPound + agent2.skills.topControl + agent2.skills.bottomGame) / 3,
    cardio: agent2.skills.cardio,
    chin: agent2.skills.chin,
    recovery: agent2.skills.recovery,
    aggression: agent2.skills.aggression,
    fightIQ: agent2.skills.fightIQ,
    heart: agent2.skills.heart,
  };
  
  const engine = new FightEngine(fighter1Stats, fighter2Stats, {
    onAction: (action) => {
      const time = new Date(action.timestamp).toISOString().substr(14, 5);
      const impact = action.impact ? `[${action.impact.toUpperCase()}]` : '';
      console.log(`${time} R${action.round} ${impact} ${action.description}`);
    },
    onRoundEnd: (round) => {
      console.log(`\n--- End of Round ${round.round} ---\n`);
    },
    onFightEnd: (fight) => {
      console.log('\n═══════════════════════════════════════');
      if (fight.winner) {
        console.log(`🏆 WINNER: ${fight.winner} by ${fight.method}`);
      } else {
        console.log('🤝 DRAW');
      }
      console.log('═══════════════════════════════════════\n');
    },
  });
  
  // Fast simulation - 100ms per tick
  const interval = setInterval(() => {
    // Engine ticks are handled internally
  }, 100);
  
  // Stop after fight ends
  setTimeout(() => {
    clearInterval(interval);
    engine.stop();
  }, 30000); // Max 30 seconds
  
  engine.start();
}

// Main
async function main() {
  switch (command) {
    case 'init':
      if (!args[1]) {
        console.error('Usage: fightbook init <name>');
        process.exit(1);
      }
      initFighter(args[1]);
      break;
      
    case 'fight':
      if (!args[1] || !args[2]) {
        console.error('Usage: fightbook fight <agent1.md> <agent2.md>');
        process.exit(1);
      }
      await runFight(args[1], args[2]);
      break;
      
    case 'validate':
      if (!args[1]) {
        console.error('Usage: fightbook validate <skills.md>');
        process.exit(1);
      }
      validateSkills(args[1]);
      break;
      
    case 'version':
    case '-v':
    case '--version':
      console.log('fightbook v1.0.0');
      break;
      
    case 'help':
    case '-h':
    case '--help':
    default:
      printHelp();
  }
}

main().catch(console.error);
