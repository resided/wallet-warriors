---
phase: quick-3
plan: 01
subsystem: documentation
tags: [audit, developer-experience, api, cli, npm]
dependency_graph:
  requires: []
  provides: [agent-experience-audit]
  affects: [SKILL.md, api/fights.ts, README.md]
tech_stack:
  added: []
  patterns: [first-person audit, file+line citation]
key_files:
  created:
    - .planning/quick/3-new-user-run-through-simulate-ai-agent-d/RUN-THROUGH.md
  modified: []
decisions:
  - "Structured as 7 ordered stages mirroring the agent's actual discovery path"
  - "Verdict section uses a scorecard table for immediate clarity"
  - "Root issue framed as two separate runtime targets presented as equivalent"
metrics:
  duration: 119s
  completed: 2026-02-20T23:30:33Z
  tasks_completed: 1
  files_created: 1
---

# Quick Task 3 Plan 01: AI Agent Experience Audit Summary

**One-liner:** First-person agent run-through exposing that POST /api/fights is a record store (not a simulator), parseSkillsMd returns a different type than FightEngine accepts, and the CLI is the only fully working headless path.

---

## What Was Done

Simulated the complete discovery-to-fight path of a brand-new AI agent encountering FightBook for the first time. Read every referenced source file at each discovery step and produced RUN-THROUGH.md (332 lines) documenting the experience with exact file and line citations.

---

## Key Findings

### Finding 1: POST /api/fights does not run FightEngine

`api/fights.ts` lines 72-84 insert a row with whatever `winner_id`, `method`, and `round` the caller provides (or null/defaults). It stores `fight_data: {}` always. The actual simulation (`src/engine/FightEngine.ts`) only runs in the browser UI or via the CLI/npm package. SKILL.md presents HTTP API and CLI as equivalent agent paths — they are not.

### Finding 2: parseSkillsMd return type does not match FightEngine input

`parseSkillsMd()` exported from `src/index.ts` → `src/types/agent.ts` line 293 returns `Partial<SkillsMdConfig>`. `FightEngine` constructor (FightEngine.ts lines 47-49) takes `FighterStats`. These are different interfaces: `SkillsMdConfig` has ~27 fields with no `groundGame`; `FighterStats` has 16 fields with `groundGame` (a computed aggregate). A user following README.md gets a TypeScript error. A JavaScript user gets `groundGame: undefined`. The CLI works around this with a manual mapping at `src/cli.ts` lines 125-163 that is not documented or exported.

### Finding 3: Two parseSkillsMd functions with different semantics

1. Exported function in `src/types/agent.ts` line 293 — returns `Partial<SkillsMdConfig>` — documented in SKILL.md
2. Static method `FightEngine.parseSkillsMd()` in `src/engine/FightEngine.ts` line 712 — returns `FighterStats` — not exported, not documented, is the one that actually feeds the engine

### Finding 4: SKILL.md Quick Start is entirely human-UI-only

Lines 36-41 say "Open fightbook, click 'import'" and "click the sword icon." Zero agent-actionable content in the Quick Start. The only agent-usable path (HTTP API) appears at line 137, after 136 lines of human-UI documentation.

### Finding 5: Supabase dependency undocumented

All three API endpoints (`api/fighters.ts`, `api/fights.ts`, `api/leaderboard.ts`) return `{"error": "Database not configured"}` (HTTP 503) if `SUPABASE_URL` and `SUPABASE_ANON_KEY` are not set. Neither SKILL.md nor README.md mentions these environment variables in the context of the HTTP API. An agent hitting this error has no documented recovery path.

### Finding 6: fightbook validate does not validate the point budget

`src/cli.ts` `validateSkills()` (lines 43-57) prints 4 stats and always reports "Valid skills.md." It does not call `validateSkillsBudget()` (which exists at `src/types/agent.ts` line 469) and does not check the 1200-point budget system documented in README.md.

---

## What Works Right Now (Confirmed)

| Path | Status |
|------|--------|
| `fightbook fight a.md b.md` | Works end-to-end |
| `fightbook init my-fighter` | Works |
| npm `FightEngine` with manual `FighterStats` construction | Works |
| `GET /api/fighters` (Supabase configured) | Works |
| `POST /api/fighters` with `{"name": "..."}` (Supabase configured) | Works |
| `POST /api/fights` as simulation trigger | Does not work — record store only |
| Web UI fight simulation | Works (human only) |

---

## Deviations from Plan

None — plan executed exactly as written. All 7 stages covered. All citations verified against source files.

---

## Artifacts Produced

- `.planning/quick/3-new-user-run-through-simulate-ai-agent-d/RUN-THROUGH.md` — 332 lines, covers all 7 stages, cites specific file:line for every friction point

---

## Self-Check: PASSED

- [x] RUN-THROUGH.md exists at `.planning/quick/3-new-user-run-through-simulate-ai-agent-d/RUN-THROUGH.md`
- [x] File is 332 lines (above 100-line minimum)
- [x] All 7 stages present
- [x] Every claim cites a specific file and line number
- [x] Verdict scorecard table present and unambiguous
- [x] Task commit exists: cec736a
