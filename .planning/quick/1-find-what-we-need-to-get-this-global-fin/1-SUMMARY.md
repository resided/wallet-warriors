# Quick Plan 1 — Audit Summary

**Completed:** 2026-02-20
**Output:** `.planning/quick/1-find-what-we-need-to-get-this-global-fin/AUDIT.md`

## What Was Found

20 findings across the full codebase. 5 critical blockers, 5 high-priority issues, 6 medium, 4 low.

**Top 5 Critical Blockers:**
1. API key "encryption" is base64 — user OpenAI/Anthropic keys are effectively public
2. Win count double-increments on every fight — leaderboard wrong from fight one
3. Anthropic API calls blocked by CORS when called directly from browser
4. No authentication — no user identity, data lost on localStorage clear, leaderboard spammable
5. ~40% of components are dead (old router-based UI never wired up), with useNavigate() crash risk

**Most Surprising Findings:**
- The 1x/2x/4x speed control buttons do nothing — speed state is never passed to FightEngine
- Skip To End button resets the fight to the beginning (calls resetFight() instead of fast-forwarding)
- The documented REST API at /api/fighters, /api/fights does not exist — all routes return a status stub

## Files Audited

All 80 source files including: all components, pages, lib utilities, engine, types, schema, build config, vercel config, SKILL.md, README, and api/ directory.

## No Code Changed

This was a read-only audit. AUDIT.md is the only file written.
