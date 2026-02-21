---
phase: quick-6
plan: "01"
subsystem: api-cli-docs
tags: [budget, validation, snake_case, api, cli, docs]
dependency_graph:
  requires: [src/types/agent.ts]
  provides: [budget-enforcement-api, budget-cli-validation, budget-docs]
  affects: [api/fighters.ts, src/cli.ts, SKILL.md]
tech_stack:
  added: []
  patterns: [budget-enforcement, snake_case-normalization, defensive-validation]
key_files:
  modified:
    - api/fighters.ts
    - src/cli.ts
    - SKILL.md
decisions:
  - "Normalize snake_case to camelCase inline (local map, no import) in the API handler"
  - "Merge with DEFAULT_SKILLS before validation so all stats have values for budget calc"
  - "validateSkillsBudget used at both API and CLI layers — single source of truth in agent.ts"
  - "Store fullStats (normalized, merged, validated) in DB rather than raw user input"
metrics:
  duration: "~2 minutes"
  completed: "2026-02-21"
  tasks_completed: 3
  files_modified: 3
---

# Quick Task 6: Stat Budget Enforcement Across CLI, API, and Docs Summary

**One-liner:** Budget enforcement via validateSkillsBudget at POST /api/fighters (400 on violation) + CLI validate budget line + 1200-point budget docs in SKILL.md.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Budget enforcement + snake_case normalization in POST /api/fighters | 5588c6f | api/fighters.ts |
| 2 | Budget summary in fightbook validate | 679f86f | src/cli.ts |
| 3 | Document budget in SKILL.md | 95058f3 | SKILL.md |

---

## What Was Built

### Task 1 — api/fighters.ts

Added budget enforcement and snake_case normalization to the POST handler:

- Imports `parseSkillsMd`, `validateSkillsBudget`, `DEFAULT_SKILLS` from `../src/types/agent` (relative path for @vercel/node compatibility).
- Added `normalizeStats()` local function with a 14-key snake_case → camelCase map.
- Extended body destructuring to accept optional `skills_md` string.
- Build order: parse `skills_md` → overlay normalized `stats` → merge with `DEFAULT_SKILLS` → validate budget.
- Returns `400 { error: "Over budget", details: [...] }` on violation.
- Stores `fullStats` (normalized, merged, validated) instead of raw `stats || {}`.

### Task 2 — src/cli.ts

Updated `validateSkills()` in the CLI to show budget usage:

- Extended import to include `validateSkillsBudget`, `DEFAULT_SKILLS`, `POINT_BUDGET`, `calculatePointsSpent`.
- After stat lines, merges parsed skills with DEFAULT_SKILLS and calls `calculatePointsSpent`.
- Prints `Budget: X / 1200 points used`.
- Prints warnings (e.g., unspent points).
- Prints errors and calls `process.exit(1)` when budget is exceeded.

### Task 3 — SKILL.md

Inserted budget note in the "skills.md Format" section before the yaml code block:

```
**Budget: 1200 points to distribute across physical stats. Max 95 per stat, min 20.**
Each stat starts at a base of 30 — you spend points to raise stats above 30.
Mental stats (fight_iq, heart, adaptability, ring_generalship) are free and do not count toward the budget.

Run `fightbook validate your-fighter.md` to check your budget before registering.
```

---

## Verification Results

1. `npx tsc --noEmit` — CLEAN (no errors)
2. CLI validate prints "Budget: 460 / 1200 points used" for default-stat agent, exits 0
3. CLI validate prints error and exits 1 for over-budget config (1495 / 1200, over by 295)
4. SKILL.md budget note present and accurate between intro sentence and yaml block

---

## Deviations from Plan

None - plan executed exactly as written.

---

## Self-Check: PASSED

- api/fighters.ts: modified and compiles cleanly
- src/cli.ts: modified and compiles cleanly
- SKILL.md: budget note inserted in correct location
- Commits: 5588c6f, 679f86f, 95058f3 all present in git log
