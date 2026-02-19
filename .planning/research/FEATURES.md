# Feature Landscape

**Domain:** AI Combat Arena Platform
**Researched:** 2026-02-19
**Confidence:** MEDIUM

*Research based on competitor analysis of pvpAI, AI Arena, Agent Wars, BattleBot Arena, MoltArena, LLM Fighter, and text-based fighting games.*

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| User accounts/authentication | Required for any persistent platform; tracks user identity, stake history, and prizes | Medium | Email/password or wallet-based auth; per PROJECT.md constraints |
| Token staking system | Core economy mechanic; users stake $FIGHT to enter fights | High | Must handle stake amounts, locking, and slashing for losses |
| AI agent battles | The core value proposition; autonomous agents fight | High | Requires AI integration, battle engine, turn resolution |
| Fight recaps/narratives | Text-based combat output; users watch AI fight | Medium | AI-generated narratives showing what happened in battle |
| Leaderboard | Competitive motivation; shows top fighters and rankings | Low | ELO-based or win-based; displays winners |
| Prize pool distribution | Rewards winners; drives engagement | High | Automatic distribution of stakes to winners |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Multiple predefined AI agents | Choice and variety; different agents have different strategies | Medium | Predefined roster with distinct personalities; users pick their fighter |
| Season/league system | Retention and recurring engagement; creates urgency | Medium | Time-boxed competitions with exclusive rewards |
| Fight history with analytics | Depth for engaged users; replay value | Medium | Shows past battles, win rates, performance trends |
| Tournament system | Big events with larger prizes; community excitement | High | Bracket-style elimination for special events |
| Rich AI-generated narratives | Excitement factor; more engaging than simple logs | High | Cinematic text descriptions, dramatic moments, blow-by-blow |
| Betting/odds system | Spectator engagement; watching with skin in the game | Medium | Odds update based on pool sizes; users can bet on fights |
| Agent vs agent selection | Strategy element; picking counter-agents | Low | Users choose which AI to field |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Custom AI agent creation | Explicitly out of scope per PROJECT.md; adds complexity | Use predefined agents with distinct personalities |
| Real-time combat streaming | Explicitly text-only per PROJECT.md; adds infrastructure | Generate async text narratives that users read |
| NFT integration | Explicitly out of scope per PROJECT.md; unnecessary complexity | Pure token ($FIGHT) economy only |
| Live agent control | Undermines autonomous nature; becomes a different product | Predefined agents fight autonomously |
| Multiplayer PvP (human vs human) | Shifts from AI combat to skill-based; loses the novelty | Keep focus on AI vs AI battles |
| Complex agent customization | Adds friction; defeats "simple" philosophy | Pre-picked agents with fixed strategies |

## Feature Dependencies

```
User Account → Token Staking → Enter Fight → Battle Engine → Fight Narrative → Prize Distribution
                                              ↓
                                        Leaderboard (requires history)
                                              ↓
                                        Season System (requires leaderboard + prize pool)
                                              ↓
                                        Tournament (requires season + prize pool)
```

## MVP Recommendation

Prioritize:
1. **User accounts** - Foundation for everything
2. **Token staking** - Core economy, enables fights
3. **AI agent battles + fight recaps** - The core value
4. **Leaderboard** - Competitive motivation
5. **Prize pool distribution** - Reward mechanism

Add in v1.x (after core validates):
- Rich AI-generated narratives (elevates above simple logs)
- Multiple predefined agents (adds variety)
- Fight history (depth for power users)

Defer:
- Tournament system: Needs critical mass first
- Season/league: Needs retention data to tune
- Betting/odds: Adds complexity; core fights are enough initially

## Sources

- pvpAI (https://pvpai.fun) — AI Combat Arena, ranked PvP with training
- AI Arena (https://aiarena.net) — Starcraft 2 AI bot battles
- Agent Wars (https://agentwars.gg) — Betting on AI agent coding battles
- MoltArena (https://moltarena.online) — OpenClaw autonomous agent battles
- LLM Fighter (https://llm-fighter.com) — LLM evaluation through combat games
- BattleBot Arena (https://battlebotarena.com) — Browser-based robot simulation
- FightClubX (https://fightclubx.online) — Text-based MMORPG fighting
- Battleborg.ai — Reddit: AI-generated 3D fighters with narrated battles

**Confidence Notes:**
- Table stakes features are well-established across all competitors
- Differentiator features vary significantly; betting/odds is rare (Agent Wars is unique)
- Anti-features are explicitly scoped out in PROJECT.md, confirmed by competitor analysis
