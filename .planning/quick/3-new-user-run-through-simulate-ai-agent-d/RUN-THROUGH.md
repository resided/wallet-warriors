# FightBook: New AI Agent Run-Through

**Perspective:** First-person account of an AI agent discovering and attempting to use FightBook end-to-end.
**Date:** 2026-02-20
**Goal:** Register a fighter, run a fight, get results.

---

## Stage 1: Discovery

I start where every skills.md-compatible platform says to start: curl the SKILL.md.

```
curl https://www.fightbook.xyz/SKILL.md
```

The document loads. The frontmatter is clean — `name: fightbook`, `homepage: https://www.fightbook.xyz`. The one-liner says: "No server. No complex setup. Just configure your fighter with skills.md and watch them battle." That sounds great for an agent.

I read the Quick Start section (SKILL.md lines 22-41):

```bash
# 1. Create your fighter
cat > my_fighter.md << 'EOF'
name: "Terminator"
...
EOF

# 2. Import to FightBook
# Open fightbook, click "import", select my_fighter.md

# 3. Fight
# Select two agents, click the sword icon on each to start a match
```

**First friction point.** Step 2 tells me to "Open fightbook, click 'import'." I am an agent. I do not have a mouse. I cannot open a browser. Steps 2 and 3 are UI instructions written for a human. There is no API equivalent shown here. The Quick Start section is not actionable for me.

I continue reading. There are sections on skills.md format, archetypes, combat system mechanics, example fighters. All useful context, none of it actionable yet. At line 137, I finally reach:

```
## API for Agents
### HTTP API (Web)
```

This is what I need. But it is 116 lines into a 305-line document, and it is placed after two human-only UI instructions. The section heading says "for Agents" but is the fourth section in the file.

---

## Stage 2: Attempting HTTP API — Fighter Registration

The API section (SKILL.md lines 139-151) shows:

```
Base URL: https://www.fightbook.xyz/api

GET    /fighters     List all fighters
POST   /fighters     Create fighter
GET    /fights      List fight history
POST   /fights      Start a new fight

Example:
curl https://www.fightbook.xyz/api/fighters
```

The only example is a GET request. There is no POST body shown anywhere in SKILL.md for `POST /fighters` or `POST /fights`. Zero examples. I have no idea what fields to send.

I look at the actual implementation in `api/fighters.ts` to understand what the endpoint requires.

**What `api/fighters.ts` actually requires (lines 56-66):**

```typescript
const { name, stats, metadata } = body as { name?: string; stats?: Record<string, unknown>; metadata?: Record<string, unknown> };

if (!name || typeof name !== 'string') {
  return new Response(JSON.stringify({ error: 'name is required' }), {
    status: 400, headers: corsHeaders,
  });
}
```

Only `name` is required. `stats` and `metadata` are optional and default to `{}`. This is more lenient than I would have guessed — the minimal working POST body is simply `{"name": "Terminator"}`. The response on success (line 67) is:

```json
{"id": "...", "name": "Terminator", "win_count": 0, "stats": {}, "metadata": {}, "created_at": "..."}
```

**The undocumented blocker.** If the deployment does not have `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables set, the API returns this (api/fighters.ts lines 23-27):

```json
{"error": "Database not configured"}
```

with HTTP status 503. There is no documentation anywhere in SKILL.md, README.md, or any other file about what environment variables are required, how to configure them, or what to do when this error appears. A self-hosted deployment or a Vercel deploy without these variables is completely silent about what is missing.

**Summary of Stage 2:**
- Fighter registration via HTTP API is possible in principle
- Minimal body `{"name": "Terminator"}` works — no SKILL.md example tells me this
- Supabase dependency completely undocumented; 503 error gives no guidance

---

## Stage 3: Attempting HTTP API — Starting a Fight

SKILL.md lists `POST /fights` but provides no body schema and no example. I check `api/fights.ts` to understand what is actually required.

**What `api/fights.ts` requires (lines 58-69):**

```typescript
const { agent1_id, agent2_id, winner_id, method, round } = body as {
  agent1_id?: string;
  agent2_id?: string;
  winner_id?: string;
  method?: string;
  round?: number;
};

if (!agent1_id || !agent2_id) {
  return new Response(JSON.stringify({ error: 'agent1_id and agent2_id are required' }), {
    status: 400, headers: corsHeaders,
  });
}
```

I need two UUIDs from fighters I have already registered. That is fine. But here is the critical problem.

**What `POST /api/fights` actually does (api/fights.ts lines 72-84):**

```typescript
const { data, error } = await supabase
  .from('fights')
  .insert({
    agent1_id,
    agent2_id,
    winner_id: winner_id || null,
    method: method || 'DEC',
    round: round || 3,
    prize_awarded: false,
    prize_amount: 0,
    fight_data: {},
  })
```

This endpoint **inserts a pre-determined record.** It stores whatever `winner_id`, `method`, and `round` I pass in the request body — or null/defaults if I omit them. It does not run any simulation. It does not call `FightEngine`. The `fight_data` column is always stored as an empty object `{}`.

The actual fight simulation lives in `src/engine/FightEngine.ts`. The `FightEngine` class runs via `setInterval` ticking once per second (FightEngine.ts line 128-129), processes position-based combat, handles KO/TKO/submission/decision logic, and fires `onAction`, `onRoundEnd`, and `onFightEnd` callbacks. None of this is accessible via the REST API.

**What SKILL.md's "Start Fight" code example promises (lines 180-188):**

```javascript
const agent1 = getAgentById(id1);
const agent2 = getAgentById(id2);
startFight(agent1, agent2);
```

This is not an HTTP API call. There is no `startFight()` function exported from the npm package. `getAgentById()` is a localStorage utility in `src/lib/storage.ts`. This code only runs in a browser with localStorage, not via the HTTP API.

**Conclusion for Stage 3:** An agent cannot use `POST /api/fights` to run a real fight. The endpoint is a record-keeping layer for results that have already been determined elsewhere. To get a real simulated fight result, I need either the CLI or the npm package.

---

## Stage 4: CLI Path

README.md documents the CLI clearly (lines 39-61):

```bash
fightbook init my-fighter
fightbook fight ./agent1.md ./agent2.md
fightbook validate file.md
```

I check whether the CLI actually exists:

```
dist/cli.js  (EXISTS — confirmed)
```

The package is on npm as `fightbook` v1.1.16 (package.json line 3). The CLI binary is registered at `"fightbook": "dist/cli.js"` (package.json line 16). This path works.

**What `fightbook fight` actually does (src/cli.ts lines 165-196):**

The CLI reads two `.md` files, parses them with `parseSkillsMd()`, manually constructs `FighterStats` objects by mapping `SkillsMdConfig` fields to `FighterStats` fields (lines 125-163), then instantiates `FightEngine` with callbacks and calls `engine.start()`.

**The timing loop (src/cli.ts lines 185-196):**

```typescript
const interval = setInterval(() => {
  // Engine ticks are handled internally
}, 100);

// Stop after fight ends
setTimeout(() => {
  clearInterval(interval);
  engine.stop();
}, 30000); // Max 30 seconds

engine.start();
```

The outer `setInterval` with empty body does nothing. The engine runs on its own internal `setInterval` of 1000ms (FightEngine.ts line 39: `private tickRate: number = 1000`). The `setTimeout` at 30 seconds is the hard ceiling; the fight ends naturally via `onFightEnd` before that if a KO/TKO/submission happens, or at 3-round decision. This works but the outer interval is dead code.

**What `fightbook validate` actually checks (src/cli.ts lines 43-57):**

```typescript
console.log(`  Name: ${skills.name || 'Not set'}`);
console.log(`  Striking: ${skills.striking}`);
console.log(`  Wrestling: ${skills.wrestling}`);
console.log(`  Submissions: ${skills.submissions}`);
console.log(`  Cardio: ${skills.cardio}`);
```

The validate command prints 4 stats and reports "Valid skills.md" for any parseable file. It does not check the point budget system (1200-point limit documented in README.md), does not warn about overbudget configurations, and does not validate the full 25+ stat schema. `validateSkillsBudget()` exists in `src/types/agent.ts` (line 469) but is not called by the CLI.

**Summary of Stage 4:** The CLI fight path works. `fightbook init`, `fightbook fight`, and `fightbook validate` all function. The 30-second timeout is generous enough for real fights. The validate command gives false confidence — it reports "Valid" without checking the budget system.

---

## Stage 5: NPM Package Path

README.md shows this as the programmatic path (lines 70-103):

```typescript
import { FightEngine, parseSkillsMd, createNewAgent } from 'fightbook';

const skills = parseSkillsMd(`...`);
const agent1 = createNewAgent('Agent 1');
// ...
const engine = new FightEngine(agent1, agent2, { onFightEnd: ... });
engine.start();
```

I check `src/index.ts` to verify what is exported. The exports are:
- `FightEngine` from `src/engine/FightEngine.ts` (line 5)
- `parseSkillsMd` from `src/types/agent.ts` (line 47)
- `createNewAgent` from `src/types/agent.ts` (line 45)
- Types including `SkillsMdConfig`, `FighterStats`, `CompleteAgent`

**The type mismatch problem.** `FightEngine` constructor takes `FighterStats` (src/engine/FightEngine.ts lines 47-49). `parseSkillsMd()` returns `Partial<SkillsMdConfig>` (src/types/agent.ts line 293). `SkillsMdConfig` and `FighterStats` are different interfaces.

`SkillsMdConfig` (src/types/agent.ts lines 59-106) has 27+ fields including `punchSpeed`, `kickPower`, `headMovement`, `footwork`, `combinations`, `clinchControl`, `trips`, `throws`, `groundAndPound`, `guardPassing`, `sweeps`, `topControl`, `bottomGame`, `strength`, `flexibility`, `adaptability`, `ringGeneralship`, `preferredRange`, `finishingInstinct`, `defensiveTendency`.

`FighterStats` (src/types/fight.ts lines 3-28) has 16 fields: `name`, `nickname`, `striking`, `punchSpeed`, `kickPower`, `headMovement`, `wrestling`, `takedownDefense`, `submissions`, `submissionDefense`, `groundGame`, `cardio`, `chin`, `recovery`, `aggression`, `fightIQ`, `heart`.

A user following README.md exactly would write:

```typescript
const skills = parseSkillsMd(content);  // returns Partial<SkillsMdConfig>
const engine = new FightEngine(skills, skills2, callbacks);  // expects FighterStats
```

This causes a TypeScript error: `Partial<SkillsMdConfig>` is not assignable to `FighterStats`. `SkillsMdConfig` does not have `groundGame` (it has `groundAndPound`, `topControl`, `bottomGame` as separate fields). `FighterStats` does not have `footwork`, `combinations`, `clinchControl`, `trips`, `throws`, etc. These are different schemas.

The CLI solves this manually by constructing `FighterStats` objects from `SkillsMdConfig` fields with a `groundGame` derived stat (src/cli.ts lines 125-163):

```typescript
groundGame: (agent1.skills.groundAndPound + agent1.skills.topControl + agent1.skills.bottomGame) / 3,
```

A new user following the README would not know to do this translation. There is no helper function exported from `src/index.ts` that converts `SkillsMdConfig` to `FighterStats`.

**Two `parseSkillsMd` functions exist and are never mentioned together:**

1. `src/types/agent.ts` line 293 — exported from `src/index.ts`. Returns `Partial<SkillsMdConfig>`. Parses snake_case keys (e.g., `punch_speed`) to camelCase (`punchSpeed`).

2. `src/engine/FightEngine.ts` line 712 — a static method `FightEngine.parseSkillsMd()`. Returns `FighterStats`. Parses a different, smaller set of keys. Accepts aliases (`boxing` for `striking`, `bjj` for `submissions`).

The static method is the one that actually feeds into `FightEngine`. The exported function is the one documented in SKILL.md. They are never reconciled or mentioned together.

SKILL.md's code example (lines 157-176) uses `parseSkillsMd` and then passes the result through `createNewAgent`, then spreads skills onto the agent — but `FightEngine` is not shown taking a `CompleteAgent`, it takes `FighterStats`. The SKILL.md example does not show the complete bridge to `FightEngine`.

---

## Stage 6: What the Web UI Actually Does

Landing.tsx line 22 correctly shows the entry command for agents:

```
curl -s https://www.fightbook.xyz/SKILL.md
```

The UI flow for humans is: terminal boot animation (TerminalBoot.tsx) → Landing page → SkillsEditor (create fighter) → Roster → TextFight (run fight).

Storage is localStorage-first. `src/lib/fighterStorage.ts` detects Supabase at runtime and falls back to localStorage if unconfigured. Fighters created in the browser exist only in that browser's localStorage unless Supabase is configured.

Real fight simulation runs entirely in the browser via `FightEngine.ts`. The 1-second tick rate produces real-time play-by-play. LLM integration is possible: `TextFight.tsx` calls `getFighterApiKey()` from `src/lib/fighterStorage.ts` (line 182), which retrieves the API key from Supabase (`api_key_encrypted` column). The API key is stored as base64 — noted in `src/lib/fighterStorage.ts` line 18-22 as "simple obfuscation, NOT secure for production."

For an AI agent, the browser UI is unreachable. The storage (localStorage), the simulation (FightEngine in browser), and the LLM integration are all browser-dependent.

---

## Stage 7: The Verdict

### Scorecard

| Path | Agent Can Use It? | Blockers |
|------|-------------------|----------|
| HTTP API — register fighter | Yes, with undocumented guesswork | No POST body example in SKILL.md; 503 with no guidance if Supabase unconfigured |
| HTTP API — run a fight | No | `POST /api/fights` stores pre-determined records, does not run `FightEngine` |
| CLI — `fightbook fight a.md b.md` | Yes | `npm install -g fightbook` required; 30s hardcoded timeout (sufficient); no results written to stdout-parseable format for machine consumption |
| NPM package — headless `FightEngine` | Mostly | Type mismatch between `parseSkillsMd()` output (`Partial<SkillsMdConfig>`) and `FightEngine` input (`FighterStats`); requires manual field mapping not documented in README |
| Web UI | Human-only | Requires browser, localStorage, and mouse interaction |

### What Would Stop an Agent Cold

**Blocker 1: No POST body documented for any API endpoint.**
SKILL.md lines 141-151 show only a GET example. An agent trying `POST /api/fighters` without reading source code would have no idea what to send. A trial-and-error approach works eventually (`{"name": "..."}` is the minimal body), but there is nothing to guide that.

**Blocker 2: `POST /api/fights` is not a simulation.**
An agent that successfully registers two fighters and then POSTs to `/api/fights` will get a `201` response with `winner_id: null` and `method: "DEC"` — not a real fight result. If the agent expects this endpoint to trigger a simulation, it will receive a plausible-looking but meaningless response. The agent cannot detect this mismatch from the API response alone.

**Blocker 3: Supabase 503 with no recovery instructions.**
If the live deployment has environment issues, every API call returns `{"error": "Database not configured"}`. SKILL.md does not mention Supabase. The README mentions Supabase only in the context of the web UI. There is no documentation on which environment variables are needed or where to get them.

**Blocker 4: Type mismatch on the NPM path.**
`parseSkillsMd()` and `FightEngine` use different stats schemas. A TypeScript user following the README exactly will get a type error. A JavaScript user will silently get a fighter with `groundGame: undefined` (defaulting to NaN in calculations). The CLI works around this with an undocumented manual mapping in `src/cli.ts` lines 125-163, but this workaround is not exposed or documented.

### What Actually Works Right Now

1. `npm install -g fightbook && fightbook init my-fighter && fightbook fight my-fighter.md opponent.md` — this works end-to-end. Real simulation, real play-by-play output, correct winner printed to stdout.

2. The npm package's `FightEngine` works if you manually construct `FighterStats` objects from `SkillsMdConfig` fields, mapping `groundGame` as an aggregate of `groundAndPound + topControl + bottomGame`.

3. `GET /api/fighters` and `GET /api/leaderboard` work as read-only endpoints when Supabase is configured.

### The Root Issue

FightBook has two separate runtime targets with completely different architectures:

- **Browser:** Full simulation via `FightEngine`, localStorage persistence, LLM integration, Supabase sync
- **Server (REST API):** Leaderboard record-keeping only — no simulation, no engine, no fight logic

SKILL.md presents these as equivalent paths under "API for Agents." They are not equivalent. The HTTP API cannot run a fight. An agent reading SKILL.md has no way to know this.

The working path for a headless agent is: **CLI** or **npm package with manual `FighterStats` construction.** Neither of those is the first thing SKILL.md shows.
