# Project Research Summary

**Project:** FightBook - AI Combat Arena
**Domain:** AI Combat Arena Platform with Token Staking
**Researched:** 2026-02-19
**Confidence:** MEDIUM-HIGH

## Executive Summary

FightBook is an AI-powered text-based combat arena where autonomous AI agents battle each other while users stake tokens on outcomes. This combines three distinct technical domains: AI text generation for battle narratives, blockchain token staking for the economy, and real-time state management for live fight updates. The research confirms the existing Vite + React + Tailwind foundation is solid and identifies the missing pieces as AI integration (Vercel AI SDK), wallet connection (Wagmi + RainbowKit), and backend choice (Convex recommended for MVP).

The recommended approach prioritizes building a functional combat system before adding economic complexity. Core features include user authentication, token staking, AI agent battles with narrative generation, leaderboards, and prize distribution. The critical risks identified are leaderboard manipulation, AI narrative quality degradation, tokenomics collapse, and smart contract security vulnerabilities—all of which require proactive mitigation rather than retrofit solutions.

Key trade-offs: Start with database-tracked staking before on-chain contracts (reduces security risk), use Convex over Supabase for faster MVP development, and prioritize deterministic combat logic before layering on LLM narrative generation.

## Key Findings

### Recommended Stack

**Core framework (already selected):** React 18.x, Vite 5.x, TypeScript 5.x, Tailwind CSS 3.x

**AI Integration:**
- Vercel AI SDK 6.x — Industry standard for React AI apps with streaming-first architecture; 25+ provider support
- @ai-sdk/openai — Primary provider for battle generation; GPT-4o offers best quality/speed balance
- @ai-sdk/anthropic — Alternative for Claude; better for long-form narrative generation

**Wallet Connection:**
- Wagmi 2.x + Viem 2.x — Dominant React Web3 library; 60% smaller bundle than ethers.js
- RainbowKit 2.x — Best-in-class wallet picker UI; 96k weekly npm downloads
- @tanstack/react-query 5.x — Required by Wagmi for data fetching

**Backend:**
- Convex (recommended) — Real-time by default, type-safe, eliminates API boilerplate; used by similar project pvpAI
- Supabase (alternative) — Better for self-hosting and complex queries

**Smart Contract Development:**
- Hardhat — Industry standard for Solidity development
- Foundry — Essential for fuzzing and invariant testing on financial contracts

### Expected Features

**Must have (table stakes):**
- User accounts/authentication — Foundation for persistence
- Token staking system — Core economy mechanic; stake $FIGHT to enter fights
- AI agent battles — The core value proposition; autonomous agents fight
- Fight recaps/narratives — Text-based combat output; AI-generated battle descriptions
- Leaderboard — Competitive motivation; ELO-based rankings
- Prize pool distribution — Automatic rewards to winners

**Should have (differentiators):**
- Multiple predefined AI agents — Choice and variety; distinct fighter personalities
- Season/league system — Retention and recurring engagement
- Fight history with analytics — Depth for power users; replay value
- Tournament system — Big events with larger prizes

**Defer (v2+):**
- Betting/odds system — Adds complexity; core fights are sufficient initially
- Rich AI-generated narratives (MVP version) — Can use simple logs first, enhance later
- Custom agent creation — Explicitly out of scope per PROJECT.md

### Architecture Approach

FightBook uses a layered architecture with clear separation between presentation, application, and data layers. The core pattern is a **state machine for fight lifecycle** progressing through discrete states (Pending → Active → Resolved → Complete) with deterministic transitions. Combat logic lives in **pure functions** (services/combat/) with side effects (LLM, storage) isolated to edges—this enables testable, auditable battle rules. A **service layer pattern** separates concerns: FightOrchestrator coordinates the fight lifecycle, CombatEngine handles turn resolution, AgentManager makes decisions, NarrativeGenerator produces LLM text, and TokenEconomyService manages stakes and prizes.

**Major components:**
1. **FightOrchestrator** — Manages fight lifecycle, turn sequencing, winner determination
2. **CombatEngine** — Core battle mechanics; deterministic rules for damage, stats, turn order
3. **AgentManager** — AI fighter decision logic; distinct personalities and strategies
4. **NarrativeGenerator** — LLM-powered text generation for fight descriptions
5. **TokenEconomyService** — Staking, prize pools, payouts; separate from combat logic

### Critical Pitfalls

1. **Leaderboard gaming & manipulation** — Combat rankings tied to token rewards create strong manipulation incentives. Prevention: Blind evaluation, Elo with volatility, multi-dimensional scoring, anomaly detection. Must design anti-gaming from day one.

2. **AI narrative repetition** — LLMs suffer from "Repeat Curse," producing identical fight narratives. Prevention: Temperature tuning, ensemble generation, deterministic seeds, quality scoring. Address early, not retrofitted.

3. **Tokenomics economic collapse** — 97% of gaming tokens failed in 2025. Prevention: Utility-first design, deflationary sinks, vesting schedules, sustainable emission. Economics must be mathematically sound before launch.

4. **Smart contract security** — Staking contracts face front-running, reentrancy, oracle manipulation. Prevention: Professional audits, time-locks, rate limiting, upgradeable proxy. Cannot be added retroactively.

5. **Multi-agent coordination failures** — AI agents may produce inconsistent outputs, nonsensical outcomes. Prevention: Turn-based resolution, deterministic seeding, outcome validation, predefined tiebreakers.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation & Combat Core
**Rationale:** Deterministic battle logic is the foundation; it must work correctly before adding AI, economics, or real-time features. Easy to test, establishes core game mechanics.

**Delivers:**
- TypeScript interfaces (Fighter, Action, FightState)
- CombatEngine with pure battle logic (turns, damage, stats)
- Basic fight state management
- Agent registry with simple rule-based decisions

**Addresses:** AI agent battles (basic), Fight recaps (simple logs)

**Avoids:** Pitfall #5 (multi-agent coordination) — serialized turn-based resolution built in from start

### Phase 2: Fight Flow & AI Integration
**Rationale:** Now that combat works, add the "AI" in AI Combat—LLM narrative generation and orchestration. This layer introduces non-determinism, so it needs the solid combat foundation first.

**Delivers:**
- FightOrchestrator wiring combat + agents
- NarrativeGenerator with LLM integration (Vercel AI SDK)
- Full fight experience with view components
- Pre-fight lobby for agent selection

**Addresses:** Rich AI-generated narratives, Multiple predefined agents, Fight history

**Avoids:** Pitfall #2 (narrative repetition) — quality gates and ensemble generation built into narrative service

### Phase 3: Economy & Persistence
**Rationale:** Users need something to stake before adding token complexity. Fight system must work end-to-end first. Database persistence before on-chain economics reduces risk.

**Delivers:**
- TokenEconomyService (database-tracked stakes initially)
- User wallet integration (RainbowKit)
- Leaderboard with anti-gaming measures
- Prize pool distribution
- Fight persistence and history

**Addresses:** User accounts, Token staking, Prize pool distribution, Leaderboard

**Avoids:** Pitfall #1 (leaderboard gaming) — blind evaluation and multi-dimensional scoring designed in; Pitfall #3 (tokenomics collapse) — start simple with database-tracked stakes before on-chain

### Phase 4: Smart Contracts (v1.x)
**Rationale:** Only after economics is validated in production should real tokens be at risk. Limited prize pools initially reduces exploit impact.

**Delivers:**
- Hardhat smart contracts for $FIGHT token
- Staking contract with time-locks and rate limits
- On-chain prize distribution
- Security audits

**Addresses:** Full tokenomics with real value at stake

**Avoids:** Pitfall #4 (smart contract security) — audits mandatory, limited prize pools initially

### Phase Ordering Rationale

- **Combat before AI:** Deterministic battle logic is testable; LLM integration is experimental. Build the stable foundation first.
- **AI before Economy:** Don't add economic complexity (real money) until the core fight experience works.
- **Database before On-chain:** Prove economics with database-tracked stakes before exposing users to smart contract vulnerabilities.
- **Limited before Full:** Start with limited prize pools, limited features, limited complexity—expand as system proves stable.

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 2 (AI Integration):** LLM prompt engineering for combat narratives—specific prompt patterns need validation
- **Phase 3 (Economy):** Tokenomics model specifics—need financial modeling before implementation
- **Phase 4 (Smart Contracts):** Legal/regulatory considerations for token launch—jurisdiction-specific

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** State machine patterns well-documented in game development
- **Phase 2 (Orchestration):** Convex real-time patterns used by pvpAI reference project
- **Phase 3 (Persistence):** Standard React + Convex patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Vercel AI SDK, Wagmi, Convex are current industry standards with strong documentation; verified against similar project (pvpAI) |
| Features | MEDIUM | Table stakes well-established across competitors; differentiator choices are more speculative |
| Architecture | MEDIUM | Patterns well-documented in game development literature; combat-specific implementation less validated |
| Pitfalls | HIGH | Research cited from academic sources (arXiv), industry analyses (GAM3S.GG), and documented DeFi vulnerabilities |

**Overall confidence:** MEDIUM-HIGH

Research is grounded in current industry standards and documented patterns from similar projects. Main uncertainty is in feature prioritization decisions and specific tokenomics implementation—these should be validated during requirements gathering.

### Gaps to Address

- **Tokenomics specifics:** Current research identifies failure patterns but not the specific economic model for FightBook. Need to model supply, demand, and sink mechanisms during planning.
- **AI prompt engineering:** Narrative quality will depend heavily on prompt engineering—needs experimentation beyond this research phase.
- **Agent decision logic:** Research identifies the need for distinct agent personalities but doesn't specify the decision-making architecture beyond "rule-based vs LLM."
- **Phase-specific validation:** Each phase should be validated against user requirements before commitment.

## Sources

### Primary (HIGH confidence)
- pvpAI Arena (https://pvpai.fun) — Actual AI combat arena using Convex + Next.js + TypeScript; primary reference for similar architecture
- Vercel AI SDK Documentation — Confirmed v6 as current, streaming-first architecture, 25+ providers
- wagmi.sh — Confirmed v2 as current, viem integration, React Query v5 requirement
- RainbowKit npm — v2.2.10 confirmed, 96k weekly downloads
- ToolStac comparison — Hardhat vs Foundry analysis

### Secondary (MEDIUM confidence)
- The Leaderboard Illusion (Cohere, 2025) — arxiv.org/abs/2504.20879 — Leaderboard gaming analysis
- LM Fight Arena (2025) — arxiv.org/html/2510.08928v1 — AI fighting game benchmarking
- 97% of Gaming Tokens Have Failed (GAM3S.GG, 2025) — Tokenomics failure analysis
- Pokemon Showdown AI Arena — LLM agent battle implementation patterns
- TextArena (arXiv:2504.11442) — Research on text-based AI agent evaluation

### Tertiary (LOW confidence)
- Security Challenges in AI Agent Deployment (2025) — Agent competition security (general, not combat-specific)
- P2E Tokenomics in 2026 (Calibraint, 2026) — Forward-looking industry projections

---

*Research completed: 2026-02-19*
*Ready for roadmap: yes*
