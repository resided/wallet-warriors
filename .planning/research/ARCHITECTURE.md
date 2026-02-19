# Architecture Research

**Domain:** AI Combat Arena / Text-Based Fighting Platform
**Researched:** 2026-02-19
**Confidence:** MEDIUM

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                           │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │   Lobby    │  │  FightView  │  │Leaderboard │  │  Wallet   │ │
│  │   Screen   │  │   Screen    │  │   Screen   │  │  Screen   │ │
│  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘  └─────┬─────┘ │
└─────────┼────────────────┼────────────────┼──────────────┼───────┘
          │                │                │              │
┌─────────┼────────────────┼────────────────┼──────────────┼───────┐
│         ▼                ▼                ▼              ▼        │
│                    Application Layer                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    FightOrchestrator                         │ │
│  │  (Manages fight lifecycle, turn sequencing, winner deter.)  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│         │                    │                    │               │
│  ┌──────▼──────┐    ┌───────▼──────┐    ┌───────▼──────┐      │
│  │AgentManager │    │ CombatEngine  │    │NarrativeGen  │      │
│  │(AI Agents)  │    │(Turn/Stats)   │    │(LLM Service) │      │
│  └─────────────┘    └───────────────┘    └───────────────┘      │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   TokenEconomyService                      │   │
│  │        (Staking, Prize Pool, Distribution)                 │   │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                         Data Layer                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ FightDB  │  │ AgentDB  │  │  TokenDB │  │   UserProfileDB  │  │
│  │(Results) │  │ (Stats)  │  │(Balances)│  │    (Accounts)    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **FightOrchestrator** | Coordinates entire fight lifecycle — start, turns, end, result determination | State machine managing fight phases |
| **CombatEngine** | Core battle mechanics — turn order, damage calculation, stat resolution | Pure functions with deterministic rules |
| **AgentManager** | Manages AI fighter agents — their stats, capabilities, action selection | Agent registry with decision logic |
| **NarrativeGenerator** | LLM-powered text generation for fight descriptions | Prompt templates + LLM API calls |
| **TokenEconomyService** | Handles staking, prize pools, payouts | Smart contract integration or database tracking |
| **Presentation Layer** | UI components for lobby, fight viewing, leaderboards | React components with shared state |

## Recommended Project Structure

```
src/
├── components/           # React UI components
│   ├── lobby/           # Fight lobby and agent selection
│   ├── fight/           # Live fight viewing
│   ├── leaderboard/    # Rankings display
│   └── wallet/         # Token management
├── services/            # Business logic
│   ├── combat/          # Combat engine and rules
│   │   ├── engine.ts   # Core battle logic
│   │   ├── stats.ts    # Fighter stats calculation
│   │   └── turns.ts    # Turn resolution
│   ├── agents/         # AI agent management
│   │   ├── registry.ts # Available fighters
│   │   └── decisions.ts# Action selection logic
│   ├── narrative/       # LLM narrative generation
│   │   ├── prompts.ts  # Prompt templates
│   │   └── generator.ts# LLM API calls
│   ├── economy/        # Token and prize logic
│   │   ├── staking.ts  # Entry fee handling
│   │   └── prizes.ts   # Winner payouts
│   └── orchestration/  # Fight lifecycle
│       └── coordinator.ts
├── stores/             # State management
│   ├── fightStore.ts   # Current fight state
│   └── userStore.ts    # User wallet and profile
├── types/               # TypeScript interfaces
│   ├── fighter.ts      # Fighter/agent types
│   ├── combat.ts       # Combat result types
│   └── economy.ts      # Token types
└── utils/              # Shared utilities
    ├── constants.ts    # Game rules constants
    └── helpers.ts      # Helper functions
```

### Structure Rationale

- **services/combat/**: Isolates deterministic battle logic from UI — enables testing without React, supports multiple game modes
- **services/agents/**: Separates AI decision-making from combat rules — allows upgrading AI without breaking combat mechanics
- **services/narrative/**: Encapsulates LLM integration — simplifies switching providers or adding retry logic
- **services/orchestration/**: Centralizes fight lifecycle — coordinates all other services, handles edge cases
- **stores/**: React-centric state — shared across components for real-time updates

## Architectural Patterns

### Pattern 1: State Machine for Fight Lifecycle

**What:** Fight progresses through discrete states (Pending → Active → Resolved → Complete) with deterministic transitions

**When to use:** Any sequential battle system where outcomes depend on accumulated state

**Trade-offs:**

- **Pros:** Clear boundaries, easy to debug, serializable state for replay
- **Cons:** Can feel rigid for complex multi-phase fights

**Example:**
```typescript
type FightPhase = 'pending' | 'active' | 'resolved' | 'complete';

interface FightState {
  phase: FightPhase;
  turnNumber: number;
  fighters: Fighter[];
  narrative: string[];
  winner: Fighter | null;
}

function resolveTurn(state: FightState): FightState {
  if (state.phase !== 'active') return state;
  
  const attacker = state.fighters[state.turnNumber % 2];
  const defender = state.fighters[(state.turnNumber + 1) % 2];
  
  // Determine action, calculate damage, apply effects
  const action = selectAction(attacker, state);
  const result = executeAction(action, defender);
  
  const newNarrative = generateNarrative(attacker, action, result);
  
  // Check for victory
  const winner = result.targetHealth <= 0 ? attacker : null;
  const newPhase = winner ? 'resolved' : state.phase;
  
  return {
    ...state,
    phase: newPhase,
    turnNumber: state.turnNumber + 1,
    fighters: updateFighters(state.fighters, result),
    narrative: [...state.narrative, newNarrative],
    winner,
  };
}
```

### Pattern 2: Service Layer with Pure Functions

**What:** Core combat logic lives in pure functions, side effects (LLM, storage) isolated to edges

**When to use:** When combat rules need to be testable, auditable, or deterministic

**Trade-offs:**

- **Pros:** Easy to unit test, deterministic behavior, clear data flow
- **Cons:** May feel verbose for simple games

**Example:**
```typescript
// Pure function - no side effects
function calculateDamage(attacker: Fighter, defender: Fighter, action: Action): DamageResult {
  const baseDamage = attacker.stats.power;
  const defense = defender.stats.defense;
  const actionMultiplier = action.type === 'heavy' ? 1.5 : 1.0;
  
  const damage = Math.max(1, Math.floor((baseDamage - defense * 0.5) * actionMultiplier));
  
  return {
    damage,
    isCritical: Math.random() < attacker.stats.critChance,
    statusEffect: action.statusEffect || null,
  };
}

// Side effect at the edge
async function executeFight(fighters: Fighter[], prizePool: bigint): Promise<FightResult> {
  const initialState = createInitialState(fighters);
  
  let state = initialState;
  while (state.phase !== 'resolved') {
    state = resolveTurn(state); // Pure
    await delay(1000); // Pace for narrative
  }
  
  const narrative = await generateFullNarrative(state.history); // LLM call
  const prizes = distributePrizes(state.winner, prizePool); // Token logic
  
  return { state, narrative, prizes };
}
```

### Pattern 3: Event-Driven Narrative Generation

**What:** Combat actions emit events, narrative service subscribes and generates text

**When to use:** When narrative needs to be decoupled from combat timing or generated asynchronously

**Trade-offs:**

- **Pros:** Loose coupling, can batch or cache narratives, easier to swap generation
- **Cons:** Additional complexity for simple cases

## Data Flow

### Request Flow

```
[User clicks "Start Fight"]
    ↓
[FightOrchestrator.createFight(fighters, stake)]
    ↓
[TokenEconomyService.lockStake(stake)]
    ↓
[AgentManager.selectActions(fighters, context)]
    ↓
[CombatEngine.resolveTurn(actions)]
    ↓
[NarrativeGenerator.describeTurn(result)]
    ↓
[FightStore.update(state)] → [FightView.re-render]
    ↓
[Repeat until winner determined]
    ↓
[TokenEconomyService.distributePrizes(winner)]
    ↓
[FightDB.save(fightResult)]
```

### State Management

```
[FightStore (Zustand/Context)]
    ↓ (subscribe)
[Components: FightView, Leaderboard, Wallet]
    │
    ├── [User clicks action] → FightOrchestrator → CombatEngine
    │
    └── [LLM response received] → NarrativeGenerator → FightStore
```

### Key Data Flows

1. **Fight Execution Flow:** User initiates → Orchestrator coordinates → Combat resolves → Narrative generates → UI updates → Token economy settles

2. **Agent Decision Flow:** CombatEngine requests action → AgentManager receives context → Decision logic (rule-based/LLM) → Returns action → CombatEngine applies

3. **Token Flow:** User stakes → Tokens locked → Fight resolves → Winner receives payout → Loser's stake burned/distributed

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Single server, in-memory fight state, synchronous LLM calls OK |
| 1k-100k users | Queue-based fight processing, cache LLM prompts, add fight state persistence |
| 100k+ users | Dedicated fight worker pool, LLM result caching, read replicas for leaderboards |

### Scaling Priorities

1. **First bottleneck: LLM latency**

   - **Problem:** Generating narrative takes 2-10s per turn
   - **Fix:** Pre-generate narrative templates, use faster LLM for speed, cache common scenarios

2. **Second bottleneck: Fight state consistency**

   - **Problem:** Real-time updates to multiple users watching same fight
   - **Fix:** WebSocket with optimistic updates, fight state in dedicated cache layer

3. **Third bottleneck: Token transaction throughput**

   - **Problem:** Many simultaneous fights creating on-chain transactions
   - **Fix:** Batch transactions, optimistic local state with eventual consistency

## Anti-Patterns

### Anti-Pattern 1: Tight Coupling Combat and UI

**What people do:** Embed combat logic directly in React components using useEffect chains

**Why it's wrong:** Hard to test, race conditions on rapid actions, impossible to replay fights

**Do this instead:** Separate service layer with pure functions, use state machine for fight phase

### Anti-Pattern 2: Synchronous LLM Calls Blocking Fight

**What people do:** Await LLM response before each turn displays, blocking UI

**Why it's wrong:** Users stare at loading spinner, fights take forever, LLM timeouts break entire flow

**Do this instead:** Generate turns ahead of time or use streaming, show "thinking..." state with pre-rollout

### Anti-Pattern 3: Mixing Token Logic with Combat Rules

**What people do:** Embed prize calculations inside combat engine

**Why it's wrong:** Different token models require different logic, testing becomes economic simulation

**Do this instead:** Separate TokenEconomyService, combat just declares winner, economy handles payout

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **LLM API (OpenAI/Anthropic)** | Async API calls with retry, streaming optional | Primary narrative source, cost control critical |
| **Token Contract ($FIGHT)** | Read balances, approve transfers, event listeners | Can start with database tracking, upgrade to real tokens |
| **Wallet (MetaMask/etc.)** | Wallet connection for user identity | For MVP can use server-side accounts first |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| UI ↔ Services | React hooks / Zustand | Components call services, subscribe to stores |
| Combat ↔ Narrative | Event emission or direct call | Combat emits results, narrative subscribes |
| Orchestrator ↔ Economy | Promise-based with rollback | Economy must rollback on fight cancellation |

## Build Order Implications

Based on component dependencies:

```
Phase 1: Foundation
├── types/              # Define Fighter, Action, FightState interfaces
├── services/combat/    # Pure battle logic, no LLM yet
└── stores/fightStore.ts # Basic state management

Phase 2: Core Fight Flow
├── services/orchestration/    # Wiring together combat + agents
├── services/agents/           # Simple rule-based decisions
└── components/fight/           # View the fight happening

Phase 3: Narrative & Polish
├── services/narrative/        # LLM integration
├── components/lobby/          # Pre-fight agent selection
└── Full fight experience

Phase 4: Economy & Social
├── services/economy/          # Token staking/payouts
├── components/wallet/         # User token management
├── components/leaderboard/    # Rankings
└── Fight persistence
```

**Rationale:** Build deterministic combat first (easy to test), add orchestration, then layer on LLM narrative (harder to test, more experimental), then add economic complexity on top of working fight system.

## Sources

- **pvpAI Architecture** — Convex + Next.js TypeScript combat arena (https://pvpai.fun/about)
- **Pokemon Showdown AI Arena** — LLM agent battle implementation patterns (https://lakshyaag.com/blogs/building-a-pokemon-arena)
- **TextArena** — Research on text-based AI agent evaluation (arXiv:2504.11442)
- **Turn-Based Game Architecture** — State machine patterns for battle systems (https://outscal.com/blog/turn-based-game-architecture)
- **BattleAgent** — Multi-agent battle emulation architecture (arXiv:2404.15532)
- **LLM Game Agent Survey** — Comprehensive overview of LLM-based game agents (arXiv:2404.02039)

---
*Architecture research for: AI Combat Arena / Text-Based Fighting Platform*
*Researched: 2026-02-19*
