---
status: testing
phase: 01-fighter-registration
source: [01-02-SUMMARY.md, 02-01-SUMMARY.md, 02-02-SUMMARY.md, 03-01-SUMMARY.md, 03-02-SUMMARY.md, quick-tasks]
started: 2026-02-21T19:50:22Z
updated: 2026-02-21T19:52:00Z
---

## Current Test

number: 1
name: fightbook init creates a template
expected: |
  Run: fightbook init my-fighter
  A file called my-fighter.md is created in the current directory
  with name, striking, wrestling, etc. pre-filled.
awaiting: user response

## Tests

### 1. fightbook init creates a template
expected: Run `fightbook init my-fighter`. A file my-fighter.md is created with all the skill fields pre-filled.
result: [pending]

### 2. fightbook fight runs a fight and prints output
expected: Run `fightbook fight a.md b.md` with two .md files. Fight plays out in the terminal — round-by-round moves printed, winner declared at the end.
result: [pending]

### 3. fightbook validate checks a file
expected: Run `fightbook validate my-fighter.md`. Prints the fighter's stats (name, striking, wrestling, etc.) with no errors for a valid file.
result: [pending]

### 4. POST /api/fighters registers a fighter
expected: Run `curl -X POST https://www.fightbook.xyz/api/fighters -H "Content-Type: application/json" -d '{"name":"Test Bot","stats":{"striking":70,"wrestling":50}}'`. Returns a 201 with the fighter's ID.
result: [pending]

### 5. POST /api/fights runs a real fight
expected: POST to /api/fights with two fighter IDs (or use the curl example in SKILL.md). Response comes back with a winner, method, and fight log — not just an empty row.
result: [pending]

### 6. GET /api/leaderboard returns ranked fighters
expected: `curl https://www.fightbook.xyz/api/leaderboard`. Returns a JSON array of fighters sorted by wins.
result: [pending]

### 7. Web: fight history is visible
expected: Open www.fightbook.xyz, enter the arena, go to "history". Past fights (including any run via CLI or API) appear with fighter names, result, method, round.
result: [pending]

### 8. Web: leaderboard is visible
expected: Click "board" in the nav. Ranked list of fighters appears. If no API fights yet, shows empty state gracefully.
result: [pending]

### 9. Web: landing page is clear
expected: Visit www.fightbook.xyz fresh. See "FightBook — AI Combat Arena", 3-step how-it-works, and two copyable commands (curl and npm). No confusion about what the product is.
result: [pending]

### 10. npm package: skillsToFighterStats + FightEngine work
expected: `const { parseSkillsMd, skillsToFighterStats, FightEngine } = require('fightbook')`. Parse a skills.md string, convert to FighterStats, pass to FightEngine — no type errors, fight runs.
result: [pending]

### 11. Web: mobile layout works for spectators
expected: On a phone browser, the fight history, leaderboard, and landing page are readable without horizontal scrolling or cut-off buttons.
result: [pending]

## Summary

total: 11
passed: 0
issues: 0
pending: 11
skipped: 0

## Gaps

[none yet]
