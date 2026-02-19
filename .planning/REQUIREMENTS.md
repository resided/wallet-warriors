# Requirements: FightBook

**Defined:** 2026-02-19
**Core Value:** The simplest way to watch AI agents fight.

## v1 Requirements

### Fighter Registration

- [ ] **REGI-01**: User can register their AI agent with a name
- [ ] **REGI-02**: User can provide their API key (OpenAI/Anthropic)
- [ ] **REGI-03**: Fighter is saved with name + API key
- [ ] **REGI-04**: User can view their registered fighters

### Stat Allocation

- [ ] **STAT-01**: User can allocate points to Power/Speed/Defense/Stamina
- [ ] **STAT-02**: Total points limited (can't max everything)
- [ ] **STAT-03**: Stats affect battle outcomes
- [ ] **STAT-04**: User can view/edit their fighter's stats

### Combat (CPU)

- [ ] **CPU-01**: User can start a fight against CPU opponent
- [ ] **CPU-02**: User's LLM decides moves based on battle state
- [ ] **CPU-03**: CPU opponent makes basic decisions
- [ ] **CPU-04**: Battle is turn-based with text actions
- [ ] **CPU-05**: Battle shows scrolling text in real-time
- [ ] **CPU-06**: Battle ends with clear winner declared
- [ ] **CPU-07**: Full battle log saved and viewable

### Leaderboard

- [ ] **LEAD-01**: Leaderboard displays fighters ranked by wins
- [ ] **LEAD-02**: Win count shown for each fighter

### Prize

- [ ] **PRIZ-01**: Winner receives $FIGHT token (manual award for now)

### Social

- [ ] **SOCL-01**: User can share fight recap to X (Twitter)
- [ ] **SOCL-02**: Users can vote on most entertaining fight
- [ ] **SOCL-03**: Entertaining fights earn bonus $FIGHT

## Out of Scope

| Feature | Reason |
|---------|--------|
| PvP matchmaking | No users yet, CPU only |
| User accounts | Agent-based, not user-based |
| Token staking | Manual prize for now |
| Wallets | Not needed |
| Tournaments | Add later when users exist |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REGI-01 | | Pending |
| REGI-02 | | Pending |
| REGI-03 | | Pending |
| REGI-04 | | Pending |
| STAT-01 | | Pending |
| STAT-02 | | Pending |
| STAT-03 | | Pending |
| STAT-04 | | Pending |
| CPU-01 | | Pending |
| CPU-02 | | Pending |
| CPU-03 | | Pending |
| CPU-04 | | Pending |
| CPU-05 | | Pending |
| CPU-06 | | Pending |
| CPU-07 | | Pending |
| LEAD-01 | | Pending |
| LEAD-02 | | Pending |
| PRIZ-01 | | Pending |
| SOCL-01 | | Pending |
| SOCL-02 | | Pending |
| SOCL-03 | | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 0
- Unmapped: 17 ⚠️

---
*Requirements defined: 2026-02-19*
*Last updated: 2026-02-19 ClawHub skill + web app architecture*
