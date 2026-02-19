---
phase: 02-combat-system
plan: 01
subsystem: combat
tags: [cpu-opponent, llm, fight-selection]
dependency_graph:
  requires: []
  provides: [cpu-fighter, llm-decisions, fight-select-ui]
  affects: [TextFight]
tech_stack:
  added: [cpuOpponent.ts, llmClient.ts, FightSelect.tsx]
  patterns: [callback-pattern, mixed-mode-fight]
key_files:
  created:
    - src/lib/cpuOpponent.ts
    - src/lib/llmClient.ts
    - src/components/FightSelect.tsx
  modified:
    - src/engine/FightEngine.ts
    - src/components/TextFight.tsx
decisions:
  - "Used callback pattern for LLM and CPU decisions"
  - "CPU difficulty scales stats, aggression, and randomness"
  - "LLM uses OpenAI/Anthropic with 5s timeout"
metrics:
  duration: ~20 minutes
  completed_date: 2026-02-19
---

# Phase 2 Plan 1: CPU opponent + fight selection + LLM integration Summary

## Overview
Implemented CPU opponent system, fight selection UI, and LLM integration for user move decisions.

## Key Features Implemented

### 1. CPU Opponent System (`src/lib/cpuOpponent.ts`)
- `createCpuFighter(name, difficulty)` - Creates CPU fighter with stats scaled by difficulty (easy/medium/hard)
- `getCpuDecision(actor, target, context)` - Strategic AI that makes decisions based on:
  - Position (standing/clinch/ground)
  - Health differential
  - Stamina levels
  - Difficulty level (affects randomness)

### 2. LLM Client Integration (`src/lib/llmClient.ts`)
- `buildBattlePrompt(actor, target, gameState)` - Builds detailed prompt with fight context
- `getLlmDecision(agent, opponent, gameState, config)` - Calls OpenAI or Anthropic API
- `mapTechniqueName(name)` - Maps LLM response to actual Technique objects
- 5-second timeout to prevent hanging

### 3. Fight Selection UI (`src/components/FightSelect.tsx`)
- Displays user's fighters with stats preview
- Difficulty selector (Easy/Medium/Hard)
- "Fight CPU" button that launches fight
- Empty state when no fighters exist

### 4. FightEngine Updates
- Added `llmCallback` and `cpuCallback` options
- Added `mixedMode` flag for LLM vs CPU fights
- Added `getGameState()` method for LLM/CPU context
- Added `generateLlmAction()` for async LLM decisions

### 5. TextFight Integration
- Detects CPU opponents and sets up appropriate callbacks
- Shows "thinking" indicator when LLM is deciding
- Passes difficulty to CPU opponent

## Verification

- [x] CPU opponent can be created with configurable difficulty
- [x] LLM receives battle state and returns move decisions
- [x] FightSelect shows user's fighters with fight button
- [x] FightEngine accepts llmCallback and cpuCallback
- [x] Fight runs with real-time text scrolling (existing)
- [x] Winner declared at end (existing)

## Deviations from Plan

None - plan executed exactly as written.

## Notes

- CPU uses basic strategic AI - no learning/adaptation
- LLM requires API key to be configured on fighter
- Falls back to random technique on API errors
