# Domain Pitfalls

**Domain:** AI Combat Arena Platform
**Researched:** 2026-02-19
**Confidence:** MEDIUM-HIGH

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Leaderboard Gaming & Manipulation

**What goes wrong:** As documented in "The Leaderboard Illusion" research (Cohere, 2025), voting-based AI leaderboards like Chatbot Arena are systematically gamed. undisclosed private model variants, vote rigging, and position bias distort rankings. For a combat arena where AI fighters are ranked, this becomes critical—users will exploit any ranking system.

**Why it happens:** Goodhart's Law: "When a measure becomes a target, it ceases to be a good measure." Combat arenas create high-stakes rankings tied to token rewards, incentivizing manipulation over genuine competition.

**Consequences:**
- Trust collapse when users discover manipulation
- Token economy destabilized by fake rankings
- Legitimate fighters disincentivized from participating

**Prevention:**
1. **Blind evaluation** — Hide fighter identities during matches, reveal only after resolution
2. **Elo rating with volatility** — Track rating uncertainty; new entrants have wider confidence intervals
3. **Multi-dimensional scoring** — Don't rely on win/loss alone; track damage dealt, survival time, strategic moves
4. **Decentralized verification** — Use multiple independent evaluators, not just user votes
5. **Anomaly detection** — Flag unusual voting patterns (same wallet voting repeatedly, coordinated voting)

**Detection:** Sudden rating changes, clustering of wins/losses by specific fighters, voter fatigue metrics

**Phase mapping:** Core infrastructure (Phase 1) — Leaderboard must be designed with anti-gaming from day one

---

### Pitfall 2: AI Narrative Repetition & Quality Degradation

**What goes wrong:** LLMs suffer from the "Repeat Curse" (arXiv, 2025) — they get stuck in repetitive loops, producing identical or near-identical fight narratives. In a combat platform generating text-based fights, this directly impacts user experience.

**Why it happens:** 
- Maximization-based decoding (greedy/beam search) traps models in local optima
- Training data patterns create syntactic templates that repeat
- Model confidence drops in adversarial scenarios, leading to safe but repetitive outputs

**Consequences:**
- Fights become predictable and boring
- Users stop engaging with fight narratives
- Platform loses differentiation from simple RNG generators

**Prevention:**
1. **Temperature and penalty tuning** — Use repetition penalties (presence penalty: 0.3-0.5, frequency penalty: 0.3-0.8)
2. **Ensemble generation** — Generate 3-5 fight narratives, select most diverse
3. **Deterministic seeds** — Use fight metadata as generation seeds for consistency
4. **Quality scoring** — Auto-evaluate narrative diversity before presenting to users
5. **Human-in-the-loop** — Initial version uses human curation for fight narratives

**Detection:** Duplicate n-gram detection, semantic similarity scoring between narratives

**Phase mapping:** AI combat system (Phase 2) — Must address early, not retrofitted later

---

### Pitfall 3: Tokenomics Economic Collapse

**What goes wrong:** 97% of gaming tokens failed in 2025 (GAM3S.GG analysis). FightBook's $FIGHT token economy suffers from the same structural failures: unsustainable reward distributions, no deflationary mechanisms, token value not tied to utility.

**Why it happens:** 
- "Ponzinomics" — rewards depend on new entrants, not platform utility
- No value accrual mechanism — tokens used for staking but don't capture platform growth
- Inflation without sinks — tokens enter system but never leave
- Early investor dumps — large token holders exit, crashing price

**Consequences:**
- Staking becomes unattractive when token value collapses
- Prize pools become negligible, killing competition incentive
- Platform becomes associated with failed crypto projects

**Prevention:**
1. **Utility-first design** — Token must enable actual platform features, not just speculative staking
2. **Deflationary sinks** — Burn mechanism on fight fees, NFT purchases, premium features
3. **Vesting schedules** — Founder/team tokens locked 2-4 years with gradual unlock
4. **Sustainable emission rate** — Cap total staking rewards, adjust based on platform revenue
5. **Treasury reserve** — Keep 20-30% of tokens for liquidity and emergencies

**Detection:** Token price charts, wallet distribution analysis, reward claim patterns

**Phase mapping:** Token economy (Phase 1-2) — Economics must be mathematically sound before launch

---

### Pitfall 4: Smart Contract Security Vulnerabilities

**What goes wrong:** DeFi smart contracts have experienced billions in exploits. Staking contracts in particular face front-running, reentrancy attacks, and oracle manipulation. A single vulnerability can drain the entire prize pool.

**Why it happens:**
- Staking logic involves critical state changes (balance updates, reward calculations)
- Complex interactions between multiple contracts create attack surfaces
- Price oracles can be manipulated to steal funds

**Consequences:**
- Complete loss of user staked tokens
- Legal liability and regulatory scrutiny
- Irreversible reputational damage

**Prevention:**
1. **Professional audit** — Multiple security audits before any mainnet deployment
2. **Time-locks** — Staking/unstaking has delay periods for anomaly detection
3. **Rate limiting** — Maximum stake/unstake amounts per time period
4. **Oracle diversity** — Use multiple price sources, not single point of failure
5. **Upgradeable proxy** — Can pause/upgrade contracts in emergency

**Phase mapping:** Token staking (Phase 2) — Security is non-negotiable; cannot be added retroactively

---

### Pitfall 5: Multi-Agent Coordination Failures

**What goes wrong:** Multi-agent AI systems (research from UC Berkeley, 2025) frequently fail to coordinate reliably. Agents may produce inconsistent outputs, conflict in shared environments, or produce "emergent" behaviors that undermine competition integrity.

**Why it happens:**
- No shared world model between fighting agents
- Non-deterministic outputs create race conditions
- Agents optimize for individual goals that conflict

**Consequences:**
- Fights produce nonsensical outcomes (both fighters win, infinite stalemates)
- Users lose confidence in "fair" combat
- Narrative consistency breaks down across rounds

**Prevention:**
1. **Turn-based resolution** — Serialize agent decisions, not simultaneous
2. **Deterministic seeding** — Same initial conditions = same outcome (for disputes)
3. **Outcome validation** — Sanity-check fight results before presenting
4. **Conflict resolution rules** — Predefined tiebreakers, timeout handling

**Phase mapping:** AI combat system (Phase 2) — Must be designed into the combat engine

---

## Moderate Pitfalls

### Pitfall 6: User Vote Manipulation

**What goes wrong:** Similar to leaderboard gaming, users may create multiple accounts to vote for their fighters, coordinate voting rings, or use bots to inflate engagement metrics.

**Prevention:**
- Wallet verification (one vote per staked wallet)
- Reputation scoring for voters
- Invisible CAPTCHA/human verification
- Vote transparency (show vote counts, audit trails)

### Pitfall 7: AI Model Variance Exploitation

**What goes wrong:** Users discover that certain AI models perform differently based on time of day, prompt variations, or specific keywords. They exploit these inconsistencies for unfair advantages.

**Prevention:**
- Consistent model versions locked per season/period
- Prompt templates fixed, not user-customizable
- Model selection randomized across matches

### Pitfall 8: Content Quality Inconsistency

**What goes wrong:** AI-generated fight narratives vary wildly in quality—some are engaging, others are nonsensical. Users sample the platform, see a bad fight, and never return.

**Prevention:**
- Quality gates on generated content
- Multiple generation attempts, pick best
- User feedback loops to improve prompts
- Human review for featured fights

### Pitfall 9: Engagement Collapse After Launch

**What goes wrong:** Platform gets initial hype, then engagement dies. Users stake once, watch fights, then leave. No retention mechanisms.

**Prevention:**
- Daily/weekly tournaments with recurring stakes
- Social features (comments, reactions, sharing)
- Progressive rewards for consistent players
- Leaderboard prestige markers

---

## Minor Pitfalls

### Pitfall 10: AI Personality Bleed

**What goes wrong:** Fighter agents "remember" interactions from previous fights or leak system prompts, breaking immersion.

**Prevention:** Clean context windows between fights, prompt isolation

### Pitfall 11: Timezone & Availability Bias

**What goes wrong:** Fights scheduled at inconvenient times for certain regions exclude global audience.

**Prevention:** Flexible match scheduling, async fight resolution option

### Pitfall 12: Insufficient Fight Documentation

**What goes wrong:** No way to replay or analyze past fights. Users miss action, have no evidence of disputes.

**Prevention:** Fight log persistence, replay system, shareable fight URLs

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Token staking setup | Economic collapse | Start simple, iterate; don't over-complicate tokenomics early |
| AI combat engine | Narrative repetition | Test extensively with diverse prompts before launch |
| Leaderboard system | Gaming/manipulation | Design anti-gaming first; don't retrofit later |
| Smart contracts | Security exploits | Audit mandatory; start with limited prize pools |
| User accounts | Sybil attacks | Wallet verification early; don't allow easy multi-accounting |

---

## Sources

- **The Leaderboard Illusion** (Cohere, 2025) — arxiv.org/abs/2504.20879 — Chatbot Arena gaming analysis
- **LM Fight Arena** (2025) — arxiv.org/html/2510.08928v1 — AI fighting game benchmarking
- **Security Challenges in AI Agent Deployment** (2025) — arxiv.org/abs/2507.20526 — Agent competition security
- **97% of Gaming Tokens Have Failed** (GAM3S.GG, 2025) — gam3s.gg/news/97-of-gaming-tokens-have-failed/
- **P2E Tokenomics in 2026** (Calibraint, 2026) — calibraint.com/blog/p2e-tokenomics-sustainable-play-to-earn
- **Repeat Curse in LLMs** (2025) — arxiv.org/abs/2504.11442 — TextArena research
- **Learning to Break the Loop** (2022) — arxiv.org/abs/2206.02369 — Repetition mitigation
- **Smart Contract Hacks** (AInvest, 2026) — ainvest.com/news/smart-contract-hacks-expose-systemic-vulnerabilities-defi-platforms
- **Why Your Multi-Agent AI Keeps Failing** (Gradient Flow, 2025) — Multi-agent coordination issues

---

## Research Notes

**Confidence Assessment:**

- Leaderboard gaming: HIGH confidence — well-documented in research, directly applicable
- AI repetition: HIGH confidence — extensive LLM research, known problem
- Tokenomics: MEDIUM-HIGH — industry data on failures, less specific to combat platforms
- Security: HIGH confidence — documented DeFi vulnerabilities apply to any staking
- Multi-agent: MEDIUM — research applies to general agents, combat-specific less documented

**Gaps Identified:**

- Limited research specifically on text-based AI combat platforms
- Most arena research focuses on chatbot evaluation, not fighting
- Tokenomics failure data is aggregate, not specific to gaming/competition platforms
- More phase-specific research needed as platform develops
