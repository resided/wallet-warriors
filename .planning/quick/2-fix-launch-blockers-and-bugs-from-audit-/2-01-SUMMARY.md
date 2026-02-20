---
phase: quick-2
plan: 01
subsystem: fight-engine
tags: [bug-fix, data-integrity, typescript, llm]
dependency_graph:
  requires: []
  provides: [single-win-count-increment, correct-llm-provider-routing, FighterRow-win-count-type]
  affects: [leaderboard, anthropic-fighters]
tech_stack:
  added: []
  patterns: [async-fighter-lookup]
key_files:
  modified:
    - src/lib/fightStorage.ts
    - src/components/TextFight.tsx
    - src/lib/supabase.ts
decisions:
  - "Used getFighter() + as any cast for api_provider — out-of-scope to fully type CompleteAgent with api_provider in this plan"
  - "Removed inner formatTime as dead code — module-level function already handles all call sites"
metrics:
  duration: 55s
  completed: 2026-02-20
---

# Phase quick-2 Plan 01: Fix Win Count Double-Increment and LLM Provider Bug Summary

Two data-integrity bugs fixed and one missing TypeScript type added: win_count now increments exactly once per fight, Anthropic fighters route to the correct LLM endpoint, and FighterRow has a typed win_count field.

## Tasks Completed

| Task | Name | Commit | Files Modified |
|------|------|--------|---------------|
| 1 | Fix win count double-increment | 1a85722 | src/lib/fightStorage.ts |
| 2 | Fix LLM provider + FighterRow type + remove duplicate formatTime | 8a54886 | src/components/TextFight.tsx, src/lib/supabase.ts |

## What Changed

### Task 1: fightStorage.ts

Deleted the 15-line block in `saveFightToDb()` that performed a SELECT then UPDATE on `win_count` after inserting a fight row. This was the duplicate path — `incrementWinCount()` in `TextFight.tsx`'s `onFightEnd` callback is the authoritative path. Replaced with a comment explaining the correct increment path.

Result: A completed PvP fight now increments win_count exactly once.

### Task 2: TextFight.tsx (LLM provider)

In `llmCallback`, replaced:
```typescript
const llmConfig: LlmConfig = {
  provider: 'openai', // Could be stored in fighter data
  apiKey,
};
```

With:
```typescript
const fighter = await getFighter(agent1.metadata.id);
const provider = (fighter as any)?.api_provider ?? 'openai';
const llmConfig: LlmConfig = {
  provider: provider as 'openai' | 'anthropic',
  apiKey,
};
```

`getFighter` was already imported; no new import needed. An `as any` cast is used because `CompleteAgent` doesn't surface `api_provider` — that field lives on the DB row. Full type propagation is out of scope for this plan.

### Task 2: supabase.ts (FighterRow type)

Added `win_count: number` to the `FighterRow` interface. This makes `fighter.win_count` access in `leaderboard.ts` and any other consumer type-safe instead of implicit `any`.

### Task 2: TextFight.tsx (duplicate formatTime)

Removed the inner `const formatTime = (seconds: number) => { ... }` declared inside the `TextFight` component body (lines 303-307 of original). The module-level `function formatTime(seconds: number)` at the bottom of the file is the correct one and handles all call sites including `ActionLine`. After removal, `timeDisplay` calculation (which calls `formatTime(currentRound.timeRemaining)`) resolves correctly to the module-level function.

## Verification Results

- `npm run build` — passes with no errors
- `grep "win_count" src/lib/fightStorage.ts` — returns only the comment line, no logic
- `grep "provider: 'openai'" src/components/TextFight.tsx` — returns zero matches
- `grep "win_count" src/lib/supabase.ts` — returns one match in FighterRow interface
- `grep "const formatTime" src/components/TextFight.tsx` — returns zero matches

## Deviations from Plan

None - plan executed exactly as written.

## Potential Concerns

- The `as any` cast on `getFighter()` result to access `api_provider` is a known type gap. The `CompleteAgent` type does not include `api_provider` — it's on the raw DB row. Fixing this properly requires either adding `api_provider` to `CompleteAgent` or creating a separate storage function that returns the raw row. Deferred — tracked in audit findings.
- `win_count` is not marked optional (`number` not `number | undefined`) in FighterRow. If any existing fighters lack this column in the DB, reads would return `null` rather than `undefined`, which might cause type confusion. The field should exist in the schema; this is low risk.

## Self-Check: PASSED

- src/lib/fightStorage.ts: modified (win_count block removed)
- src/components/TextFight.tsx: modified (provider fix + formatTime removal)
- src/lib/supabase.ts: modified (win_count field added)
- Commits 1a85722 and 8a54886 exist in git log
