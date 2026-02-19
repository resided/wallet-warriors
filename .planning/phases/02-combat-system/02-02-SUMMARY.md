---
phase: 02-combat-system
plan: 02
subsystem: combat
tags: [persistence, database, prizes]
dependency_graph:
  requires: [02-01]
  provides: [fight-history, prize-awarding]
  affects: [TextFight]
tech_stack:
  added: [fightStorage.ts, FightHistory.tsx, PrizeAward.tsx]
  patterns: [supabase-integration, manual-prize]
key_files:
  created:
    - src/lib/fightStorage.ts
    - src/components/FightHistory.tsx
    - src/components/PrizeAward.tsx
  modified:
    - supabase/schema.sql
    - src/components/TextFight.tsx
decisions:
  - "Falls back to localStorage when Supabase not configured"
  - "Manual prize awarding - not automatic"
  - "Prize shown in fight history after awarded"
metrics:
  duration: ~15 minutes
  completed_date: 2026-02-19
---

# Phase 2 Plan 2: Battle log persistence + prize system Summary

## Overview
Implemented fight persistence to Supabase database and manual prize awarding system.

## Key Features Implemented

### 1. Database Schema (`supabase/schema.sql`)
- Added `fights` table with columns:
  - id, user_id, agent1_id, agent2_id, winner_id
  - method (KO/TKO/SUB/DEC/DRAW)
  - round, end_time
  - fight_data (JSONB for full FightState)
  - prize_awarded (boolean), prize_amount (integer)
- RLS policies for user-specific access

### 2. Fight Storage API (`src/lib/fightStorage.ts`)
- `saveFightToDb(agent1, agent2, fightState)` - Saves fight to Supabase
- `getFightHistory()` - Returns all fights for user
- `getFightsByAgent(agentId)` - Returns fights for specific agent
- `getFightById(id)` - Returns single fight
- `awardPrize(fightId, amount)` - Updates prize fields
- Falls back to localStorage when Supabase not configured

### 3. TextFight Database Integration
- Saves fights to both localStorage and Supabase
- Shows toast notifications on save success/failure
- Keeps localStorage save for offline capability

### 4. Fight History View (`src/components/FightHistory.tsx`)
- Displays all past fights with filtering (All/Wins/Losses)
- Shows: fighter names, winner, method, round, date
- Expanded view shows fight stats
- Prize badge shown if prize awarded

### 5. Prize Awarding UI (`src/components/PrizeAward.tsx`)
- Input for prize amount with quick-select buttons
- Award button that calls `awardPrize()`
- Shows "Prize Awarded" state after submission
- Displays awarded amount

## Verification

- [x] fights table exists in schema.sql
- [x] fightStorage.ts has saveFightToDb and awardPrize
- [x] TextFight saves fights to Supabase on completion
- [x] FightHistory.tsx displays past fights
- [x] PrizeAward.tsx allows manual prize awarding
- [x] Prize shows in fight history after awarded

## Deviations from Plan

None - plan executed exactly as written.

## Notes

- Manual prize system - admin/user manually awards after verifying win
- Works offline via localStorage fallback
- Fight history uses Supabase when configured
