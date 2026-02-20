# FightBook — Global Launch Audit

**Date:** 2026-02-20
**Scope:** Full codebase audit — dead code, bugs, security issues, architectural gaps blocking global launch
**Method:** Static analysis of all source files

---

## Severity Scale

- **CRITICAL** — Breaks core function, causes data loss, or is a security risk. Fix before any public launch.
- **HIGH** — Wrong behavior users will hit. Fix before promoting globally.
- **MEDIUM** — Waste, confusion, or degraded experience. Fix when possible.
- **LOW** — Polish, minor inconsistencies, future-proofing.

---

## Findings

---

### FINDING 1 — Two Parallel UIs: ~40% of Components Are Dead

**Severity: CRITICAL**

The codebase has two entirely separate user interfaces that were never reconciled:

**LIVE UI** (what actually runs):
- `src/main.tsx` mounts `<App />` directly with no router
- `src/App.tsx` implements its own view-state router (`view: 'landing' | 'roster' | 'create' | 'edit' | 'fight' | 'leaderboard' | 'history'`)
- Active components: TerminalBoot, TerminalRoster, TerminalLeaderboard, SkillsEditor, TextFight, FightHistory, Landing

**DEAD UI** (never rendered, never reachable):
- `src/pages/Index.tsx` — old marketing landing page with hardcoded leaderboard data
- `src/pages/Fighters.tsx` — old fighter management page
- `src/pages/NotFound.tsx` — 404 page for a router that doesn't exist
- `src/components/FighterRegistration.tsx` — old registration form
- `src/components/FighterRoster.tsx` — old fighter card grid
- `src/components/StatsEditor.tsx` — old stats editor dialog
- `src/components/AgentRoster.tsx` — roster variant, never imported by anything that renders
- `src/components/OnboardingFlow.tsx` — onboarding flow, never imported from App
- `src/components/PrizeAward.tsx` — prize award dialog, never reachable
- `src/components/Leaderboard.tsx` — old leaderboard component (TerminalLeaderboard is used instead)
- `src/components/FightSelect.tsx` — old fight selection screen, never reachable
- `src/components/LiveFightArena.tsx` — old fight arena (TextFight is used instead)

**The crash risk:** `FighterRegistration.tsx:57`, `FighterRoster.tsx:68`, `FightSelect.tsx:26`, and `NotFound.tsx:1` all call `useNavigate()` from `react-router-dom`. There is no `BrowserRouter` provider in the tree. If any of these components are ever accidentally rendered (e.g., during development or a future refactor), the app crashes with "useNavigate() may be used only in the context of a Router component."

**Decision required:** Delete the dead UI (recommended) OR wire up react-router-dom. Leaving it as-is guarantees future confusion.

---

### FINDING 2 — Speed Control Does Nothing

**Severity: HIGH**

`src/components/TextFight.tsx:57` declares `const [speed, setSpeed] = useState(1)` and renders a 1x/2x/4x selector at line 366. The `FightEngine` has a hardcoded `tickRate: number = 1000` (`src/engine/FightEngine.ts:39`) and exposes no method to change it. The `speed` state is never passed to the engine. The speed buttons are purely cosmetic — clicking them changes the highlighted button and nothing else.

---

### FINDING 3 — Skip To End Restarts the Fight

**Severity: HIGH**

`src/components/TextFight.tsx:296` — `skipToEnd()`:

```typescript
const skipToEnd = () => {
  if (!engineRef.current) return;
  engineRef.current.pause();
  // Fast-forward simulation would go here
  resetFight();
};
```

The comment "Fast-forward simulation would go here" reveals this is a stub. `resetFight()` calls `initializeFight()` which creates a new engine from scratch. The SkipForward button displayed to users at line 445 **resets the fight to the beginning** instead of jumping to the result. It is the opposite of what the button's icon communicates.

---

### FINDING 4 — LLM Provider Hardcoded to OpenAI

**Severity: HIGH**

`src/components/TextFight.tsx:126-129` in the `llmCallback`:

```typescript
const llmConfig: LlmConfig = {
  provider: 'openai', // Could be stored in fighter data
  apiKey,
};
```

The comment acknowledges the bug. A fighter registered with `provider: 'anthropic'` via `FighterRegistration.tsx` will have their key fetched correctly but will be sent to the OpenAI endpoint, which will reject their Anthropic key format. The stored `api_provider` from the `fighters` table is never read back in this path.

---

### FINDING 5 — API Key "Encryption" Is Base64 (Plaintext-Equivalent)

**Severity: CRITICAL**

`src/lib/fighterStorage.ts:20-24`:

```typescript
function encryptApiKey(apiKey: string): string {
  // Simple base64 encoding - NOT secure for production
  // For production: use Web Crypto API with user-derived key
  return btoa(apiKey);
}
```

`btoa()` is reversible with `atob()` — zero security. Anyone with read access to the `fighters` table (or the Supabase anon key, which is public) can decode every user's OpenAI/Anthropic API key in one line. The schema enables public reads on the fighters table (`schema.sql:32`). This means every stored API key is effectively public. This is a showstopper for any launch where users are asked to enter real API keys.

**Fix options:** Server-side encryption (never store keys client-side), Web Crypto AES-GCM with a user-derived key, or don't store API keys at all (require entry per session).

---

### FINDING 6 — Win Count Double-Increments on Every Fight

**Severity: CRITICAL**

When a non-practice fight ends, win/loss counts are updated in **two separate code paths** that both run:

**Path A** — `src/lib/fightStorage.ts:111-125` — inside `saveFightToDb()`, after saving the fight record, it immediately increments `win_count` on the winning fighter:
```typescript
await supabase.from('fighters').update({ win_count: (fighter.win_count || 0) + 1 }).eq('id', fightRecord.winnerId);
```

**Path B** — `src/components/TextFight.tsx:219-232` — the `onFightEnd` callback (which calls `saveFightToDb` and then separately) calls `incrementWinCount(winnerId)` from `src/lib/leaderboard.ts:104`, which also does a Supabase update of `win_count`.

Every win adds 2 to `win_count`. Every loss adds 2 to `losses` in metadata. The leaderboard is wrong from fight one.

---

### FINDING 7 — No User Authentication

**Severity: CRITICAL for global launch**

There is no login, no signup, no session management anywhere in the codebase. The Supabase schema permits null `user_id` on insert for both `fighters` and `fights` tables (`schema.sql:38, 100`):

```sql
with check (auth.uid() = user_id or user_id is null);
```

Consequences:
- Users have no persistent identity. Clear localStorage → lose all fighters.
- `fighters` rows written with `user_id = null` are orphaned — no owner, no way to edit/delete via RLS.
- The update policy (`auth.uid() = user_id`) will fail for null-user_id rows, so users cannot update fighters they created anonymously.
- Anyone can submit fights and inflate the leaderboard.

This is acceptable for a prototype but not for a global public launch with real API keys and prize systems.

---

### FINDING 8 — Documented API Endpoints Do Not Exist

**Severity: HIGH**

`SKILL.md` (lines 141-151) and `api/index.ts` document these endpoints:
```
GET  /api/fighters
POST /api/fighters
GET  /api/fights
POST /api/fights
```

`api/index.ts` contains only a status response listing these endpoints. The endpoints themselves do not exist. AI agents that follow the SKILL.md documentation and attempt to call `/api/fighters` will receive a 404 from Vercel (no matching serverless function).

The SKILL.md is the primary discoverability document for AI agents — it is fetched via `curl https://www.fightbook.xyz/SKILL.md`. The API section is completely non-functional.

---

### FINDING 9 — Anthropic API Called Directly from Browser (CORS Blocked)

**Severity: CRITICAL**

`src/lib/llmClient.ts:222` — `callAnthropic()` calls `https://api.anthropic.com/v1/messages` directly from browser JavaScript. Anthropic does not support CORS for browser-to-API calls. Every Anthropic-backed fighter will fail with a CORS error in the browser. This is not a configuration issue — it is a fundamental restriction of Anthropic's API. A server-side proxy is required.

OpenAI (`callOpenAi()` at line 182) supports browser-side calls, so OpenAI fighters work.

---

### FINDING 10 — FighterRow TypeScript Type Missing win_count

**Severity: MEDIUM**

`src/lib/supabase.ts:33-45` — the `FighterRow` interface does not include `win_count`:

```typescript
export interface FighterRow {
  id: string;
  user_id: string | null;
  name: string;
  api_key_encrypted: string;
  api_provider: 'openai' | 'anthropic';
  stats: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
```

But `src/lib/leaderboard.ts:39` accesses `row.win_count`, `src/lib/fightStorage.ts:122` accesses `fighter.win_count`. These are untyped accesses that TypeScript will flag as errors (`Property 'win_count' does not exist on type 'FighterRow'`). The actual DB column exists (`schema.sql:15`) — only the TypeScript type is wrong.

---

### FINDING 11 — Version Numbers Are Inconsistent Across Files

**Severity: LOW**

| Location | Reported Version |
|----------|-----------------|
| `package.json:3` | 1.1.9 |
| `src/index.ts:58` | 1.0.0 |
| `src/cli.ts:229` | v1.0.0 |
| `src/App.tsx:203` | v1.0 (in header) |
| `README.md` | references v1.0.0 implicitly |

There is no single source of truth. The exported npm package will claim v1.0.0 while the actual published version is 1.1.9.

---

### FINDING 12 — Landing Page Install Command is Misleading

**Severity: MEDIUM**

`src/pages/Landing.tsx:22` (note: this is the LIVE landing page, not the dead Index.tsx):
```typescript
const installCommand = 'curl -s https://www.fightbook.xyz/SKILL.md';
```

This is labeled "For AI Agents" and is displayed as the install command. It downloads the SKILL.md manifest file, not any installable package. There is no explanation that this is a "discover the API" command rather than an install. Immediately below it (line 113) the npm install command `npm install fightbook` is shown correctly. The curl command conflates discovery with installation.

Additionally, SKILL.md at line 298 links to `https://fightbook-chi.vercel.app` (old staging deployment) and line 299 links to `https://github.com/resided/wallet-warriors` (wrong repo). The correct links are `https://fightbook.xyz` and `https://github.com/resided/fightbook`.

---

### FINDING 13 — Social Fields Are Defined But Never Used

**Severity: MEDIUM**

`src/types/agent.ts:21-28` — `AgentSocial` defines:
- `twitterHandle?: string`
- `discordId?: string`
- `walletAddress?: string` (for $FIGHT rewards)
- `rewardsOptIn: boolean`

None of these fields are surfaced in any UI component or used in any business logic. `DEFAULT_SOCIAL` sets `rewardsOptIn: false` and `agentName: 'agent007'`. The wallet address is never stored to DB (`agentToRow()` in `fighterStorage.ts` does not map social fields). The share-to-X feature uses a hardcoded intent URL that does not reference `twitterHandle`. These are dead model fields that bloat every serialized agent object.

---

### FINDING 14 — Duplicate CPU Opponent Creation Logic

**Severity: MEDIUM**

CPU opponent generation exists in three places with different behavior:

1. `src/App.tsx:84-152` — `handleFightCpu()` creates a CPU agent inline with stats spread from `currentAgent.skills` but overriding with random 50-80 range values
2. `src/components/TerminalRoster.tsx:41-105` — `generateCpuOpponent()` creates a CPU agent using DEFAULT_SKILLS with random 40-90 range values and archetype bonuses
3. `src/lib/cpuOpponent.ts:73-116` — `createCpuFighter()` is the proper abstraction with difficulty scaling

The live app uses path 2 (TerminalRoster), which does not use the difficulty system from cpuOpponent.ts. Path 1 (App.tsx) is called when `onFightCpu` prop is provided but TerminalRoster never passes it through — it uses its own internal `handleFightCpu` instead. Path 3 is used by the dead `FightSelect.tsx` component.

---

### FINDING 15 — formatTime Defined Twice in TextFight

**Severity: LOW**

`src/components/TextFight.tsx`:
- Line 303: `const formatTime = (seconds: number)` — defined inside the `TextFight` component function
- Line 758: `function formatTime(seconds: number)` — defined at module level

The `ActionLine` sub-component at line 549 calls `formatTime(action.timeRemaining)` — it resolves to the module-level version. The component-level version is dead. Duplicate function definitions with identical logic.

---

### FINDING 16 — getLeaderboard Imported But Never Called in TerminalRoster

**Severity: LOW**

`src/components/TerminalRoster.tsx:5`:
```typescript
import { getLeaderboard } from '@/lib/storage';
```

`getLeaderboard` from storage.ts is never called anywhere in this file. The rankings banner at line 146 sorts the `agents` prop directly with `.sort((a, b) => b.metadata.ranking - a.metadata.ranking)`. This is a dead import.

---

### FINDING 17 — No Error Boundary

**Severity: HIGH for global launch**

`src/main.tsx` renders `<App />` with no error boundary wrapper. Any unhandled JavaScript error thrown during React rendering will unmount the entire application, leaving users with a blank white screen and no recovery path. In a global context with varied environments (different browsers, localStorage quirks, malformed fight data), this is a near-certainty.

At minimum, a root-level error boundary with a "Something went wrong — reload" message is needed.

---

### FINDING 18 — Index.tsx Leaderboard Has Hardcoded Fake Data

**Severity: MEDIUM**

`src/pages/Index.tsx:255-265` — the leaderboard preview section renders hardcoded placeholder fighters:
```typescript
{ rank: 1, name: 'Knockout King', record: '12-0-0', kos: 9, rating: 1850 },
{ rank: 2, name: 'Ground Game', record: '10-2-0', kos: 2, rating: 1720 },
...
```

This page is currently dead (not rendered), but it will mislead any developer who looks at it — it appears to be a functional leaderboard when it is static fiction. The "Connect Wallet" button in the header (line 91) also leads nowhere.

---

### FINDING 19 — AgentSocial Type Missing rewardsOptIn in DEFAULT_SOCIAL but Required in Interface

**Severity: LOW**

`src/components/TerminalRoster.tsx:101` creates CPU agents with:
```typescript
social: {
  agentName: `cpu_${now}`,
},
```

`AgentSocial` interface (`agent.ts:27`) requires `rewardsOptIn: boolean` (not optional). This CPU agent creation is missing the required field. TypeScript should be catching this. If it isn't, `strict` mode may not be fully enabled or this particular shape is cast through `any` somewhere.

---

### FINDING 20 — Vercel Route Configuration Has Dead API Route

**Severity: LOW**

`vercel.json:9`:
```json
{ "src": "/api/(.*)", "dest": "/api/index.ts" }
```

All API requests are routed to `api/index.ts`, which only returns a status JSON. There are no other files in `api/`. Requests to `/api/fighters`, `/api/fights`, etc. will be handled by this single stub handler, returning the status object instead of a 404. This masks the missing endpoints and could confuse debugging.

---

## Summary Counts

| Severity | Count |
|----------|-------|
| CRITICAL | 5 |
| HIGH | 5 |
| MEDIUM | 6 |
| LOW | 4 |
| **Total** | **20** |

---

## Prioritized Action List

### Must Fix Before Any Public Launch (CRITICAL)

1. **API Key Security** (`src/lib/fighterStorage.ts:20`) — Replace btoa() with real encryption or a server-side key vault. Do not ship real user API keys stored as base64.

2. **Win Count Double-Increment** (`src/lib/fightStorage.ts:111-125` + `src/components/TextFight.tsx:219`) — Remove one of the two win_count increment paths. The cleanest fix: remove the inline update inside `saveFightToDb()` and keep only the explicit `incrementWinCount()` call in TextFight.

3. **Anthropic CORS** (`src/lib/llmClient.ts:222`) — Anthropic calls must go through a serverless proxy (e.g., a Vercel API route). This blocks any fighter using Anthropic as their LLM provider.

4. **Authentication** — Without auth, no user can manage their data across sessions, data ownership is unenforceable, and the leaderboard can be freely spammed. At minimum: Supabase anonymous auth + upgrade to linked account.

5. **Dead UI Decision** — Either delete the ~12 dead components (Index.tsx, Fighters.tsx, NotFound.tsx, FighterRegistration.tsx, FighterRoster.tsx, StatsEditor.tsx, AgentRoster.tsx, OnboardingFlow.tsx, PrizeAward.tsx, Leaderboard.tsx, FightSelect.tsx, LiveFightArena.tsx) or commit to a router-based architecture. The current split creates maintenance landmines.

### Should Fix Before Promoting Globally (HIGH)

6. **Speed Control** (`src/components/TextFight.tsx:57`, `src/engine/FightEngine.ts:39`) — Either wire speed to tickRate or remove the speed buttons. Do not ship non-functional UI controls.

7. **Skip To End** (`src/components/TextFight.tsx:296`) — Implement actual fast-forward or change the button to "Restart" to match what it actually does.

8. **LLM Provider Hardcoded** (`src/components/TextFight.tsx:126`) — Read `api_provider` from the fighter's stored data and pass it to the LLM config.

9. **Missing API Endpoints** (`api/index.ts`) — Implement at least `GET /api/fighters` and `GET /api/fights` as documented in SKILL.md, or remove the documentation. AI agents will attempt to use these.

10. **Error Boundary** (`src/main.tsx`) — Wrap the app in an error boundary. A crash in production currently shows a blank page with no recovery.

### Clean Up When Possible (MEDIUM/LOW)

11. **FighterRow TypeScript type** (`src/lib/supabase.ts:33`) — Add `win_count: number` to the interface to restore type safety.

12. **SKILL.md links** — Fix GitHub URL from `wallet-warriors` to `fightbook`. Fix demo URL from `fightbook-chi.vercel.app` to `fightbook.xyz`.

13. **Version numbers** — Sync all version references to package.json. Use `import { version } from '../package.json'` or a single VERSION constant.

14. **Dead imports** — Remove unused `getLeaderboard` import in `TerminalRoster.tsx`.

15. **Duplicate formatTime** (`src/components/TextFight.tsx:303, 758`) — Delete the component-scoped version, use the module-level one.

16. **Social fields** — Either wire twitterHandle/walletAddress/rewardsOptIn into meaningful UI and storage, or remove them from the type definition to reduce noise.

17. **CPU opponent consolidation** — Delete inline CPU creation in App.tsx and TerminalRoster.tsx; use `createCpuFighter()` from cpuOpponent.ts everywhere for consistent behavior.

18. **OG/SEO meta tags** — Add Open Graph and Twitter card meta tags to `index.html` so fight shares on social media unfurl correctly.

---

*End of audit. No code was modified during this analysis.*
