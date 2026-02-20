---
phase: quick-1
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/quick/1-find-what-we-need-to-get-this-global-fin/AUDIT.md
autonomous: true
requirements:
  - AUDIT-01
must_haves:
  truths:
    - "AUDIT.md exists with a complete, structured assessment"
    - "Every bug, dead component, logic error, and global-readiness gap is documented with file + line references"
    - "A prioritized action list tells the developer exactly what to fix and in what order"
  artifacts:
    - path: ".planning/quick/1-find-what-we-need-to-get-this-global-fin/AUDIT.md"
      provides: "Full codebase audit report"
      min_lines: 100
  key_links: []
---

<objective>
Produce AUDIT.md — a comprehensive, file-referenced audit of the FightBook codebase covering dead code, logical errors, architectural gaps, and everything blocking a credible global launch.

Purpose: The developer needs a single document to understand what is broken, what is unused, and what is missing before shipping publicly. No code changes in this plan.
Output: .planning/quick/1-find-what-we-need-to-get-this-global-fin/AUDIT.md
</objective>

<execution_context>
@/Users/jamesbennett/.claude/get-shit-done/workflows/execute-plan.md
@/Users/jamesbennett/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write AUDIT.md — complete codebase analysis</name>
  <files>.planning/quick/1-find-what-we-need-to-get-this-global-fin/AUDIT.md</files>
  <action>
    Write a structured audit document covering every category below. Each finding must cite the file path and, where meaningful, the line number or function name. Use severity labels: CRITICAL (breaks core function or is a security risk), HIGH (wrong behavior users will hit), MEDIUM (waste/confusion/degraded experience), LOW (polish/future-proofing).

    The audit must cover:

    1. TWO PARALLEL UIs — DEAD vs LIVE
    The app has two completely separate UIs that were never cleaned up:
    - OLD UI (react-router-dom SPA, NOT used): src/pages/Index.tsx, src/pages/Fighters.tsx, src/pages/NotFound.tsx, src/components/FighterRegistration.tsx, src/components/FighterRoster.tsx, src/components/StatsEditor.tsx, src/components/AgentRoster.tsx, src/components/OnboardingFlow.tsx, src/components/PrizeAward.tsx, src/components/Leaderboard.tsx, src/components/FightSelect.tsx, src/components/LiveFightArena.tsx.
    - LIVE UI (used): src/App.tsx (single-file router with view state), with TerminalBoot, TerminalRoster, TerminalLeaderboard, SkillsEditor, TextFight, FightHistory.
    - main.tsx mounts App directly (no BrowserRouter) — so useNavigate() calls in FighterRegistration, FighterRoster, FightSelect, NotFound will CRASH at runtime if those components are ever rendered.
    - Severity: CRITICAL — dead code is ~40% of components. Must either wire up react-router-dom or delete the old UI.

    2. SPEED CONTROL IS NOT WIRED
    TextFight.tsx (line 57) has a `speed` state and a UI to set 1x/2x/4x. The FightEngine tickRate is hardcoded at 1000ms and is never changed based on `speed`. The speed control is a purely cosmetic button that does nothing.
    Severity: HIGH — prominent UI feature that silently has no effect.

    3. SKIP TO END IS BROKEN
    TextFight.tsx skipToEnd() (line 296) pauses the engine and calls resetFight() — it resets the fight instead of skipping to the end. The SkipForward button is displayed but effectively restarts the fight.
    Severity: HIGH — button does the opposite of what it says.

    4. LLM PROVIDER HARDCODED TO OPENAI
    TextFight.tsx llmCallback (line 126): `provider: 'openai'` is hardcoded. Even if an agent was registered with 'anthropic', it will always call OpenAI. The provider should come from the fighter's stored data (via getFighter()) or be passed in.
    Severity: HIGH — Anthropic-registered fighters will fail or hit the wrong API.

    5. API KEY ENCRYPTION IS JUST BASE64
    fighterStorage.ts (line 20): encryptApiKey() uses btoa() — this is base64 encoding, NOT encryption. The comment even says "NOT secure for production." The API key is trivially reversible for anyone with DB access.
    Severity: CRITICAL for a global launch — user API keys are stored in plaintext-equivalent. Must use real encryption (Web Crypto AES-GCM with user-derived key, or server-side encryption).

    6. SUPABASE FIGHTROW TYPE MISSING win_count FIELD
    supabase.ts FighterRow interface (line 33) does not declare `win_count`. But fightStorage.ts (line 115) and leaderboard.ts (lines 26, 39, 78, 86, 118) access `data.win_count` — these will be typed as `any` or cause TypeScript errors. The schema.sql has the column; the TS type is missing it.
    Severity: MEDIUM — TypeScript safety gap, runtime works but unmaintainable.

    7. DUPLICATE WIN-COUNT INCREMENT LOGIC
    After a fight ends, win_count is incremented in TWO places:
    - fightStorage.ts saveFightToDb() (line 111): increments fighters.win_count directly via Supabase update.
    - TextFight.tsx onFightEnd (line 219): calls incrementWinCount() from leaderboard.ts, which also updates fighters.win_count.
    Both run for the same fight. Every win double-counts on the leaderboard.
    Severity: CRITICAL — leaderboard rankings will be wrong for every fight.

    8. NO AUTHENTICATION — ANYONE CAN WRITE DATA
    The Supabase schema allows `user_id is null` inserts on fighters and fights tables (schema.sql line 38: `with check (auth.uid() = user_id or user_id is null)`). There is no auth UI, no login, no session. Any anonymous user can insert fighters and fights with null user_id. There is no way to associate data with a returning user across sessions.
    Severity: CRITICAL for global launch — data is ephemeral and ungated. Agents could spam the leaderboard. Users lose their fighters if they clear localStorage.

    9. API ENDPOINTS DOCUMENTED BUT NOT IMPLEMENTED
    SKILL.md and api/index.ts document endpoints: GET /api/fighters, POST /api/fighters, GET /api/fights, POST /api/fights. Only api/index.ts exists (returns a status page). The actual endpoints do not exist. AI agents that try to use the documented API will get 404s.
    Severity: HIGH — core value prop for AI agent integration is missing.

    10. FIGHTBOOK VERSION MISMATCH
    package.json: version "1.1.9". src/index.ts: `export const VERSION = '1.0.0'`. cli.ts prints "fightbook v1.0.0". App.tsx header shows "v1.0". README says "v1.0.0". Three different version references, none matching package.json.
    Severity: LOW — confusing but not functional.

    11. INSTALL COMMAND ON LANDING PAGE IS WRONG
    Landing.tsx (line 22): `installCommand = 'curl -s https://www.fightbook.xyz/SKILL.md'`. This gives the user the SKILL.md file (the agent manifest), not the package. The npm install line below it is correct (`npm install fightbook`). SKILL.md (line 298) also links to `https://fightbook-chi.vercel.app` (old staging URL) and `https://github.com/resided/wallet-warriors` (wrong repo name — should be `resided/fightbook`). README links to `https://github.com/resided/fightbook` (correct).
    Severity: MEDIUM — broken external links, confusing onboarding for AI agents.

    12. SOCIAL FIELDS COLLECTED BUT NEVER USED
    AgentSocial interface (agent.ts lines 21-28) defines twitterHandle, discordId, walletAddress, rewardsOptIn. DEFAULT_SOCIAL sets rewardsOptIn: false. None of these fields are surfaced in any UI or used in any business logic. The share-to-X feature in TextFight uses a hardcoded intent URL format, not the stored twitterHandle.
    Severity: MEDIUM — dead data model fields creating maintenance confusion.

    13. DOUBLE-REGISTERED formatTime FUNCTION
    TextFight.tsx defines formatTime twice: as a method inside the component (line 303) and as a standalone module-level function (line 758). The ActionLine sub-component at line 549 calls `formatTime(action.timeRemaining)` — which one? The module-level one. The component method is dead.
    Severity: LOW — dead code, minor confusion.

    14. APP.tsx CREATES CPU AGENT INLINE (DUPLICATE LOGIC)
    App.tsx handleFightCpu() (line 84) creates a CPU agent inline with hardcoded skills. TerminalRoster.tsx generateCpuOpponent() (line 41) also creates a CPU agent inline. cpuOpponent.ts createCpuFighter() provides a proper abstraction for this. Three implementations of the same thing.
    Severity: MEDIUM — inconsistent CPU opponent quality and stat ranges across code paths.

    15. GETLEADERBOARD IMPORT MISMATCH IN TerminalRoster
    TerminalRoster.tsx (line 5): `import { getLeaderboard } from '@/lib/storage'`. storage.ts does export a synchronous getLeaderboard() that reads from localStorage only. But TerminalRoster never actually calls getLeaderboard() — the rankings banner (line 146) sorts `agents` prop directly. The import is unused.
    Severity: LOW — unused import, dead code.

    16. MISSING INDEX.HTML OG/SEO META TAGS
    No Open Graph tags, no Twitter card tags, no description meta tag checked (not read but standard gap for global launches). The page title is likely just "FightBook" with no description.
    Severity: MEDIUM for global launch — unfurling on social media will be bare/broken when fights are shared.

    17. SKILL.md LINKS TO WRONG GITHUB REPO
    SKILL.md (line 299): GitHub URL is `https://github.com/resided/wallet-warriors` — this is the old project name. Current correct URL per package.json and README is `https://github.com/resided/fightbook`.
    Severity: MEDIUM — SKILL.md is the primary document AI agents discover. Wrong GitHub link erodes trust.

    18. NO ERROR BOUNDARY
    The React app has no error boundary. A runtime error in any component (e.g., the useNavigate crash from dead components, a null dereference in FightEngine) will unmount the entire app with a blank white screen and no recovery path.
    Severity: HIGH for global launch — any uncaught error is a total app failure for that user.

    19. VITE BUILD DOES NOT TREE-SHAKE DEAD PAGES
    vite.config.ts has a single entry point (index.html → main.tsx → App.tsx). App.tsx does NOT import any of the dead pages (Index, Fighters, NotFound). So those pages ARE tree-shaken from the web bundle. However: they import react-router-dom, framer-motion, and shadcn components that DO remain in the bundle because other live components use them. The dead pages themselves add ~zero bundle weight. This is actually fine — the concern is the dev confusion, not bundle bloat.
    Severity: LOW — clarification note, not a bug.

    20. ANTHROPIC API CALLED FROM BROWSER (CORS)
    llmClient.ts callAnthropic() (line 222) calls `https://api.anthropic.com/v1/messages` directly from the browser. Anthropic's API does NOT support CORS for browser-side calls. This will fail with a CORS error for every Anthropic-provider fighter. OpenAI supports CORS and works. Anthropic requires a server-side proxy.
    Severity: CRITICAL — half the LLM provider support is broken in browser environments.

    Document a PRIORITIZED ACTION LIST at the end of the audit, grouped into:
    - Must fix before any public launch (CRITICAL items)
    - Should fix before promoting globally (HIGH items)
    - Cleanup when possible (MEDIUM/LOW items)

    Be direct. No hedging. Cite exact files/lines. Do not soften findings.
  </action>
  <verify>File exists at .planning/quick/1-find-what-we-need-to-get-this-global-fin/AUDIT.md with at least 100 lines and contains all 20 findings with severity labels and file references.</verify>
  <done>AUDIT.md is a complete, frank assessment that the developer can hand to anyone and immediately understand what needs fixing before global launch.</done>
</task>

</tasks>

<verification>
AUDIT.md exists, contains all 20 findings with file/line citations and severity ratings, and ends with a prioritized action list.
</verification>

<success_criteria>
Developer reads AUDIT.md and knows exactly: (1) what is broken, (2) what is dead, (3) what is a security risk, (4) what to fix first.
</success_criteria>

<output>
After completion, create `.planning/quick/1-find-what-we-need-to-get-this-global-fin/1-SUMMARY.md` with what was found and what was produced.
</output>
