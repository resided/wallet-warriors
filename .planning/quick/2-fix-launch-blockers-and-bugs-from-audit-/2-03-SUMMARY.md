---
phase: quick-2
plan: 03
subsystem: dead-code-cleanup
tags: [cleanup, dead-code, skill-md, imports]
dependency_graph:
  requires: []
  provides: [DEAD-CODE, SKILL-MD-LINKS]
  affects: [src/components, src/pages, SKILL.md]
tech_stack:
  added: []
  patterns: [surgical-deletion]
key_files:
  created: []
  modified:
    - SKILL.md
    - src/components/TerminalRoster.tsx
  deleted:
    - src/components/AgentRoster.tsx
    - src/components/FighterRegistration.tsx
    - src/components/FighterRoster.tsx
    - src/components/FightSelect.tsx
    - src/components/Leaderboard.tsx
    - src/components/LiveFightArena.tsx
    - src/components/OnboardingFlow.tsx
    - src/components/PrizeAward.tsx
    - src/components/StatsEditor.tsx
    - src/pages/Fighters.tsx
    - src/pages/Index.tsx
    - src/pages/NotFound.tsx
decisions:
  - "Confirmed each dead file had zero imports from App.tsx or live components before deleting"
  - "TerminalRoster.tsx dead import (getLeaderboard from @/lib/storage) was confirmed unused — the Rankings banner uses the agents prop directly"
metrics:
  duration: ~3 minutes
  completed: 2026-02-20
  tasks_completed: 2
  files_changed: 14
---

# Phase quick-2 Plan 03: Dead Code Deletion and Link Fixes Summary

Deleted 12 dead components and pages (3,816 lines removed), fixed SKILL.md links pointing to the wrong repo and staging URL, and removed the dead `getLeaderboard` import in TerminalRoster.tsx.

---

## Tasks Completed

### Task 1: Delete dead components and pages

**Commit:** `d7a88b4`

Deleted all 12 files confirmed unreferenced by App.tsx or any live component:

| File | Why Dead |
|------|----------|
| `src/components/AgentRoster.tsx` | Old router UI, never imported |
| `src/components/FighterRegistration.tsx` | Dead router page component |
| `src/components/FighterRoster.tsx` | Replaced by TerminalRoster |
| `src/components/FightSelect.tsx` | Old router UI |
| `src/components/Leaderboard.tsx` | Replaced by TerminalLeaderboard |
| `src/components/LiveFightArena.tsx` | Replaced by TextFight |
| `src/components/OnboardingFlow.tsx` | Old router flow |
| `src/components/PrizeAward.tsx` | Dead UI component |
| `src/components/StatsEditor.tsx` | Replaced by SkillsEditor |
| `src/pages/Fighters.tsx` | Dead router page |
| `src/pages/Index.tsx` | Dead router page, imported LiveFightArena |
| `src/pages/NotFound.tsx` | No router exists |

All deleted files contained `useNavigate()` calls from react-router-dom. Since the app has no Router provider in the tree, these would crash if accidentally rendered. Build passes after deletion.

### Task 2: Fix SKILL.md links and remove dead import

**Commit:** `bdacf55`

**SKILL.md:** Updated the Links section at the bottom of the file:
- Web: `https://fightbook-chi.vercel.app` → `https://www.fightbook.xyz`
- GitHub: `https://github.com/resided/wallet-warriors` → `https://github.com/resided/fightbook`

**TerminalRoster.tsx:** Removed line 5:
```typescript
import { getLeaderboard } from '@/lib/storage';
```
The Rankings banner in TerminalRoster uses the `agents` prop directly (sorted by `metadata.ranking`), not `getLeaderboard`. This import was dead.

---

## Verification Results

- `ls src/components/` — 8 files, none of the 9 deleted components present
- `ls src/pages/` — only `Landing.tsx` remains
- `grep "fightbook-chi.vercel.app" SKILL.md` — empty (old URL gone)
- `grep "wallet-warriors" SKILL.md` — empty (wrong repo gone)
- `grep "fightbook.xyz" SKILL.md` — matches
- `grep "getLeaderboard" src/components/TerminalRoster.tsx` — empty
- `npm run build` — passes, 2064 modules transformed, library built successfully

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Self-Check: PASSED

- SKILL.md: web link is `https://www.fightbook.xyz`, GitHub is `https://github.com/resided/fightbook`
- TerminalRoster.tsx: no `getLeaderboard` import
- All 12 dead files confirmed deleted
- Commits d7a88b4 and bdacf55 verified in git log
