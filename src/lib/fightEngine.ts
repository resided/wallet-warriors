// Realistic MMA Fight Engine
// Simulates position-based combat with health, stamina, and realistic moves

export interface Fighter {
  id: string;
  name: string;
  stats: {
    striking: number;
    punchSpeed: number;
    kickPower: number;
    headMovement: number;
    footwork: number;
    combinations: number;
    wrestling: number;
    takedownDefense: number;
    clinchControl: number;
    trips: number;
    throws: number;
    submissions: number;
    submissionDefense: number;
    groundAndPound: number;
    guardPassing: number;
    sweeps: number;
    topControl: number;
    bottomGame: number;
    cardio: number;
    chin: number;
    recovery: number;
    strength: number;
    flexibility: number;
  };
}

export interface FightState {
  round: number;
  timeRemaining: number; // seconds
  position: 'standing' | 'clinch' | 'ground';
  groundPosition?: 'top' | 'bottom' | 'neutral';
  distance: 'range' | 'pocket';
  fighter1: FighterState;
  fighter2: FighterState;
  log: string[];
  winner: string | null;
  method: 'KO' | 'TKO' | 'SUB' | 'DEC' | null;
  endRound: number;
}

interface FighterState {
  id: string;
  name: string;
  health: number; // 0-100
  stamina: number; // 0-100
  headHealth: number;
  bodyHealth: number;
  legsHealth: number;
  isGrounded: boolean;
  isStunned: boolean;
  stats: Fighter['stats'];
}

// Action types based on position
const STANDING_ACTIONS = [
  { name: 'jab', type: 'strike', target: 'head', power: 5, stamina: 2 },
  { name: 'cross', type: 'strike', target: 'head', power: 10, stamina: 3 },
  { name: 'hook', type: 'strike', target: 'head', power: 12, stamina: 4 },
  { name: 'uppercut', type: 'strike', target: 'head', power: 15, stamina: 5 },
  { name: 'leg kick', type: 'strike', target: 'legs', power: 12, stamina: 4 },
  { name: 'body kick', type: 'strike', target: 'body', power: 15, stamina: 5 },
  { name: 'head kick', type: 'strike', target: 'head', power: 25, stamina: 8 },
  { name: 'flying knee', type: 'strike', target: 'head', power: 30, stamina: 10 },
  { name: 'superman punch', type: 'strike', target: 'head', power: 20, stamina: 8 },
  { name: 'clinch attempt', type: 'clinch', success: 0 },
  { name: 'takedown attempt', type: 'takedown', success: 0 },
];

const CLINCH_ACTIONS = [
  { name: 'knee to body', type: 'strike', target: 'body', power: 12, stamina: 4 },
  { name: 'knee to head', type: 'strike', target: 'head', power: 18, stamina: 6 },
  { name: 'dirty boxing', type: 'strike', target: 'head', power: 8, stamina: 3 },
  { name: 'elbow', type: 'strike', target: 'head', power: 15, stamina: 5 },
  { name: 'trip takedown', type: 'takedown', success: 0 },
  { name: 'throw', type: 'takedown', success: 0 },
  { name: 'separate', type: 'separate', success: 0 },
];

const GROUND_ACTIONS_TOP = [
  { name: 'ground and pound', type: 'gnp', target: 'head', power: 15, stamina: 5 },
  { name: 'elbow from top', type: 'gnp', target: 'head', power: 20, stamina: 6 },
  { name: 'hammerfist', type: 'gnp', target: 'head', power: 12, stamina: 4 },
  { name: 'body shots', type: 'gnp', target: 'body', power: 10, stamina: 3 },
  { name: 'pass guard', type: 'advance', success: 0 },
  { name: 'mount', type: 'advance', success: 0 },
  { name: 'armbar attempt', type: 'submission', success: 0 },
  { name: 'triangle attempt', type: 'submission', success: 0 },
  { name: 'kimura attempt', type: 'submission', success: 0 },
  { name: 'rear naked choke', type: 'submission', success: 0 },
];

const GROUND_ACTIONS_BOTTOM = [
  { name: 'sweep', type: 'sweep', success: 0 },
  { name: 'stand up', type: 'standup', success: 0 },
  { name: 'armbar attempt', type: 'submission', success: 0 },
  { name: 'triangle attempt', type: 'submission', success: 0 },
  { name: 'kimura attempt', type: 'submission', success: 0 },
  { name: 'guillotine', type: 'submission', success: 0 },
];

function roll(max: number): number {
  return Math.floor(Math.random() * max) + 1;
}

function rollChance(percentage: number): boolean {
  return Math.random() * 100 < percentage;
}

export function createFightState(f1: Fighter, f2: Fighter): FightState {
  return {
    round: 1,
    timeRemaining: 180, // 3 minutes
    position: 'standing',
    distance: 'range',
    fighter1: {
      id: f1.id,
      name: f1.name,
      health: 100,
      stamina: 100,
      headHealth: 100,
      bodyHealth: 100,
      legsHealth: 100,
      isGrounded: false,
      isStunned: false,
      stats: f1.stats,
    },
    fighter2: {
      id: f2.id,
      name: f2.name,
      health: 100,
      stamina: 100,
      headHealth: 100,
      bodyHealth: 100,
      legsHealth: 100,
      isGrounded: false,
      isStunned: false,
      stats: f2.stats,
    },
    log: [],
    winner: null,
    method: null,
    endRound: 1,
  };
}

export function simulateRound(state: FightState): FightState {
  const newState = { ...state, log: [...state.log] };
  const roundTime = 180; // 3 minutes = 180 seconds
  
  newState.log.push(`\n═══ ROUND ${newState.round} ═══`);
  newState.log.push(`🥊 ${newState.fighter1.name} vs ${newState.fighter2.name}`);
  newState.log.push('');
  
  let actionCount = 0;
  const maxActions = 8 + Math.floor(Math.random() * 6); // 8-14 actions per round
  
  while (actionCount < maxActions && !newState.winner) {
    // Determine active fighter (higher initiative)
    const f1Initiative = newState.fighter1.stats.punchSpeed + newState.fighter1.stats.footwork;
    const f2Initiative = newState.fighter2.stats.punchSpeed + newState.fighter2.stats.footwork;
    const activeFirst = Math.random() * (f1Initiative + f2Initiative) < f1Initiative;
    
    const attacker = activeFirst ? newState.fighter1 : newState.fighter2;
    const defender = activeFirst ? newState.fighter2 : newState.fighter1;
    
    // Process action based on position
    switch (newState.position) {
      case 'standing':
        processStandingAction(newState, attacker, defender);
        break;
      case 'clinch':
        processClinchAction(newState, attacker, defender);
        break;
      case 'ground':
        processGroundAction(newState, attacker, defender);
        break;
    }
    
    // Check for KO
    if (defender.headHealth <= 0 || defender.health <= 20) {
      if (rollChance(70)) {
        newState.winner = attacker.name;
        newState.method = defender.headHealth <= 0 ? 'KO' : 'TKO';
        newState.endRound = newState.round;
        newState.log.push(`\n💥 ${attacker.name} finishes ${defender.name}!`);
        return newState;
      }
    }
    
    // Recovery chance for stunned fighter
    if (defender.isStunned && rollChance(60)) {
      defender.isStunned = false;
      newState.log.push(`${defender.name} recovers`);
    }
    
    actionCount++;
  }
  
  // End of round
  newState.log.push(`\n⏱ End of Round ${newState.round}`);
  
  // Recover some stamina between rounds
  newState.fighter1.stamina = Math.min(100, newState.fighter1.stamina + 15);
  newState.fighter2.stamina = Math.min(100, newState.fighter2.stamina + 15);
  
  return newState;
}

function processStandingAction(state: FightState, attacker: FighterState, defender: FighterState) {
  // Choose action based on stats
  let action: typeof STANDING_ACTIONS[0];
  
  const strikingPref = attacker.stats.striking + attacker.stats.punchSpeed;
  const wrestlingPref = attacker.stats.wrestling;
  
  const roll = Math.random() * 100;
  
  if (roll < 70) {
    // Strike
    const strikes = STANDING_ACTIONS.filter(a => a.type === 'strike');
    action = strikes[Math.floor(Math.random() * strikes.length)];
  } else if (roll < 85) {
    // Takedown attempt
    action = STANDING_ACTIONS.find(a => a.type === 'takedown')!;
  } else {
    // Clinch
    action = STANDING_ACTIONS.find(a => a.type === 'clinch')!;
  }
  
  // Execute action
  if (action.type === 'strike') {
    // Check if it lands
    const accuracy = (attacker.stats.striking + attacker.stats.punchSpeed) / 2;
    const defense = defender.stats.headMovement + (defender.isStunned ? 0 : 20);
    const lands = rollChance(accuracy - defense * 0.3);
    
    if (lands) {
      // Calculate damage
      let damage = action.power * (attacker.stats.strength / 50);
      
      // Critical hit chance for clean shots
      const isCritical = rollChance(15);
      if (isCritical) {
        damage *= 1.5;
        defender.isStunned = true;
      }
      
      // Apply damage
      if (action.target === 'head') {
        defender.headHealth -= damage;
        defender.health -= damage * 0.6;
      } else if (action.target === 'body') {
        defender.bodyHealth -= damage;
        defender.health -= damage * 0.4;
        defender.stamina -= damage * 0.2;
      } else if (action.target === 'legs') {
        defender.legsHealth -= damage;
        defender.health -= damage * 0.3;
        defender.stats.footwork -= 2;
      }
      
      // Descriptive commentary
      if (isCritical && action.name === 'head kick') {
        state.log.push(`🦶 HEAD KICK! ${attacker.name} lands a devastating head kick on ${defender.name}!`);
      } else if (isCritical) {
        state.log.push(`💥 ${attacker.name} lands a massive ${action.name} and rocks ${defender.name}!`);
      } else if (action.name === 'head kick') {
        state.log.push(`${attacker.name} lands a head kick`);
      } else {
        state.log.push(`${attacker.name} lands a ${action.name}`);
      }
      
      // Stamina cost
      attacker.stamina -= action.stamina;
    } else {
      // Missed
      state.log.push(`${attacker.name} throws a ${action.name} but misses`);
      attacker.stamina -= action.stamina * 0.5;
    }
  } else if (action.type === 'takedown') {
    const takedownSkill = attacker.stats.wrestling + attacker.stats.strength;
    const defense = defender.stats.takedownDefense + defender.stats.footwork;
    const success = rollChance(takedownSkill - defense * 0.5);
    
    if (success) {
      state.position = 'ground';
      state.groundPosition = 'top';
      defender.isGrounded = true;
      state.log.push(`🤼 ${attacker.name} secures a takedown!`);
      attacker.stamina -= 8;
    } else {
      state.log.push(`${attacker.name} shoots for a takedown but ${defender.name} defends`);
      attacker.stamina -= 5;
    }
  } else if (action.type === 'clinch') {
    const clinchSkill = attacker.stats.clinchControl + attacker.stats.strength;
    const defense = defender.stats.clinchControl + defender.stats.strength;
    const success = rollChance(clinchSkill - defense * 0.4);
    
    if (success) {
      state.position = 'clinch';
      state.log.push(`🤼 ${attacker.name} gets the clinch`);
      attacker.stamina -= 4;
    } else {
      state.log.push(`${attacker.name} attempts to clinch but ${defender.name} circles away`);
      attacker.stamina -= 3;
    }
  }
}

function processClinchAction(state: FightState, attacker: FighterState, defender: FighterState) {
  const actions = CLINCH_ACTIONS;
  const roll = Math.random() * 100;
  
  let action: typeof actions[0];
  
  if (roll < 50) {
    // Strike
    action = actions.filter(a => a.type === 'strike')[Math.floor(Math.random() * 4)];
  } else if (roll < 75) {
    // Takedown
    action = actions.filter(a => a.type === 'takedown')[Math.floor(Math.random() * 2)];
  } else {
    // Separate
    action = actions.find(a => a.type === 'separate')!;
  }
  
  if (action.type === 'strike') {
    const lands = rollChance(70); // Higher accuracy in clinch
    
    if (lands) {
      let damage = action.power;
      
      if (action.name.includes('knee')) {
        state.log.push(`🦶 ${attacker.name} lands a ${action.name} in the clinch!`);
      } else {
        state.log.push(`${attacker.name} lands ${action.name}`);
      }
      
      defender.headHealth -= damage * 0.7;
      defender.health -= damage * 0.4;
      attacker.stamina -= action.stamina;
    } else {
      state.log.push(`${attacker.name} tries ${action.name} but ${defender.name} defends`);
    }
  } else if (action.type === 'takedown') {
    const success = rollChance(attacker.stats.wrestling + attacker.stats.trips * 0.5);
    
    if (success) {
      state.position = 'ground';
      state.groundPosition = 'top';
      defender.isGrounded = true;
      state.log.push(`🤼 ${attacker.name} executes a ${action.name}!`);
    } else {
      state.log.push(`${attacker.name} attempts a ${action.name} but ${defender.name} stays upright`);
    }
  } else if (action.type === 'separate') {
    const success = rollChance(60);
    if (success) {
      state.position = 'standing';
      state.log.push(`👐 The fighters separate and return to striking range`);
    } else {
      state.log.push(`${attacker.name} tries to separate but ${defender.name} keeps the clinch`);
    }
  }
}

function processGroundAction(state: FightState, attacker: FighterState, defender: FighterState) {
  const isTop = state.groundPosition === 'top';
  const actions = isTop ? GROUND_ACTIONS_TOP : GROUND_ACTIONS_BOTTOM;
  
  const action = actions[Math.floor(Math.random() * actions.length)];
  
  if (action.type === 'gnp') {
    const lands = rollChance(isTop ? 75 : 40);
    
    if (lands) {
      let damage = action.power * (isTop ? 1.2 : 0.6);
      
      if (action.name === 'elbow from top') {
        state.log.push(`💥 ELBOW! ${attacker.name} cuts ${defender.name} with an elbow!`);
      } else {
        state.log.push(`${attacker.name} lands ${action.name}`);
      }
      
      defender.headHealth -= damage;
      defender.health -= damage * 0.5;
      
      // TKO check - if taking too much damage on ground
      if (isTop && defender.headHealth < 30 && rollChance(40)) {
        state.winner = attacker.name;
        state.method = 'TKO';
        state.endRound = state.round;
        state.log.push(`\n🛑 The referee stops the fight! ${defender.name} is taking too much damage!`);
      }
    } else {
      state.log.push(`${attacker.name} tries ${action.name} but ${defender.name} defends`);
    }
  } else if (action.type === 'advance') {
    const success = rollChance(attacker.stats.guardPassing + attacker.stats.topControl);
    
    if (success) {
      state.groundPosition = 'top';
      state.log.push(`⬆️ ${attacker.name} advances to mount!`);
    } else {
      state.log.push(`${attacker.name} tries to advance position but ${defender.name} controls posture`);
    }
  } else if (action.type === 'submission') {
    const subSkill = isTop 
      ? attacker.stats.submissions + attacker.stats.topControl
      : attacker.stats.submissions + attacker.stats.bottomGame + attacker.stats.flexibility;
    const defense = defender.stats.submissionDefense + (isTop ? 0 : 20);
    
    const success = rollChance((subSkill - defense * 0.5) * 0.6);
    
    if (success) {
      state.winner = attacker.name;
      state.method = 'SUB';
      state.endRound = state.round;
      state.log.push(`\n🔗 ${attacker.name} locks in a ${action.name.replace(' attempt', '').toUpperCase()}!`);
      state.log.push(`📢 ${defender.name} taps out!`);
    } else {
      state.log.push(`${attacker.name} attempts a ${action.name.replace(' attempt', '')} but ${defender.name} escapes`);
    }
  } else if (action.type === 'sweep') {
    const success = rollChance(attacker.stats.sweeps + attacker.stats.bottomGame);
    
    if (success) {
      state.groundPosition = 'top';
      state.log.push(`🔄 ${attacker.name} sweeps and gets top position!`);
    } else {
      state.log.push(`${attacker.name} attempts a sweep but ${defender.name} maintains control`);
    }
  } else if (action.type === 'standup') {
    const success = rollChance(attacker.stats.wrestling * 0.8);
    
    if (success) {
      state.position = 'standing';
      state.groundPosition = undefined;
      attacker.isGrounded = false;
      state.log.push(`⬆️ ${attacker.name} gets back to their feet!`);
    } else {
      state.log.push(`${attacker.name} tries to stand but ${defender.name} keeps them down`);
    }
  }
}

export function simulateFullFight(f1: Fighter, f2: Fighter): FightState {
  let state = createFightState(f1, f2);
  
  for (let round = 1; round <= 3; round++) {
    if (state.winner) break;
    
    state.round = round;
    state = simulateRound(state);
  }
  
  // If no winner after 3 rounds, go to decision
  if (!state.winner) {
    const f1Score = (state.fighter1.health + state.fighter1.headHealth) * 0.5 + state.fighter1.stamina;
    const f2Score = (state.fighter2.health + state.fighter2.headHealth) * 0.5 + state.fighter2.stamina;
    
    state.winner = f1Score > f2Score ? state.fighter1.name : state.fighter2.name;
    state.method = 'DEC';
    state.endRound = 3;
    
    // Could be a draw if very close
    if (Math.abs(f1Score - f2Score) < 10) {
      state.winner = 'DRAW';
    }
  }
  
  return state;
}
