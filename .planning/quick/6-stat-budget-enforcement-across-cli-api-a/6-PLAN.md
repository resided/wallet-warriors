---
phase: quick-6
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - api/fighters.ts
  - src/cli.ts
  - SKILL.md
autonomous: true
requirements: []

must_haves:
  truths:
    - "POST /api/fighters rejects over-budget stats with 400 + error details"
    - "POST /api/fighters accepts snake_case stat keys and normalizes them to camelCase"
    - "POST /api/fighters accepts skills_md string and parses it into stats"
    - "fightbook validate prints budget usage and exits 1 on budget violations"
    - "SKILL.md documents the 1200-point budget before the yaml block"
  artifacts:
    - path: "api/fighters.ts"
      provides: "Budget enforcement + snake_case normalization in POST handler"
    - path: "src/cli.ts"
      provides: "Budget summary + error output in validateSkills()"
    - path: "SKILL.md"
      provides: "Budget documentation in skills.md Format section"
  key_links:
    - from: "api/fighters.ts"
      to: "src/types/agent"
      via: "relative import"
      pattern: "validateSkillsBudget|parseSkillsMd|DEFAULT_SKILLS"
    - from: "src/cli.ts"
      to: "src/types/agent"
      via: "existing import updated"
      pattern: "validateSkillsBudget|calculatePointsSpent|POINT_BUDGET"
---

<objective>
Enforce the stat budget system at every entry point: the REST API (POST /api/fighters), the CLI (fightbook validate), and the docs (SKILL.md).

Purpose: Agents can currently register fighters with unlimited stats or snake_case keys that silently get ignored. This closes that loophole.
Output: Budget-validated API, informative CLI validate output, documented budget in SKILL.md.
</objective>

<execution_context>
@/Users/jamesbennett/.claude/get-shit-done/workflows/execute-plan.md
@/Users/jamesbennett/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/types/agent.ts
@api/fighters.ts
@src/cli.ts
@SKILL.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Budget enforcement + snake_case normalization in POST /api/fighters</name>
  <files>api/fighters.ts</files>
  <action>
Rewrite the POST handler in api/fighters.ts to:

1. Import from ../src/types/agent (relative path — required for @vercel/node compatibility):
   - parseSkillsMd, validateSkillsBudget, DEFAULT_SKILLS
   - SkillsMdConfig type

2. Extend body destructuring to also pull `skills_md` (optional string):
   ```
   const { name, stats, metadata, skills_md } = body as { ... skills_md?: string };
   ```

3. Build normalized stats object:
   - If `skills_md` is provided, parse it with `parseSkillsMd(skills_md)` to get a Partial<SkillsMdConfig>
   - If `stats` (JSON object) is provided, normalize snake_case keys to camelCase using a local map. Keys to normalize:
     punch_speed → punchSpeed, head_movement → headMovement,
     takedown_defense → takedownDefense, clinch_control → clinchControl,
     submission_defense → submissionDefense, ground_and_pound → groundAndPound,
     guard_passing → guardPassing, top_control → topControl,
     bottom_game → bottomGame, fight_iq → fightIQ,
     ring_generalship → ringGeneralship, finishing_instinct → finishingInstinct,
     defensive_tendency → defensiveTendency, kick_power → kickPower
     (all other keys pass through as-is)
   - If both skills_md and stats are provided, merge: start from parseSkillsMd result, then overlay normalized stats on top
   - If neither provided, use empty object {}

4. Merge with DEFAULT_SKILLS to produce a complete SkillsMdConfig:
   ```
   const fullStats: SkillsMdConfig = { ...DEFAULT_SKILLS, ...normalizedPartial };
   ```

5. Validate budget:
   ```
   const validation = validateSkillsBudget(fullStats);
   if (!validation.valid) {
     return new Response(JSON.stringify({ error: 'Over budget', details: validation.errors }), {
       status: 400, headers: corsHeaders,
     });
   }
   ```

6. Store fullStats (the normalized, merged, validated object) — replace `stats: stats || {}` with `stats: fullStats`.

The snake_case normalization should be a simple local function, not an import. Example:
```typescript
function normalizeStats(raw: Record<string, unknown>): Partial<SkillsMdConfig> {
  const map: Record<string, string> = {
    punch_speed: 'punchSpeed', head_movement: 'headMovement',
    takedown_defense: 'takedownDefense', clinch_control: 'clinchControl',
    submission_defense: 'submissionDefense', ground_and_pound: 'groundAndPound',
    guard_passing: 'guardPassing', top_control: 'topControl',
    bottom_game: 'bottomGame', fight_iq: 'fightIQ',
    ring_generalship: 'ringGeneralship', finishing_instinct: 'finishingInstinct',
    defensive_tendency: 'defensiveTendency', kick_power: 'kickPower',
  };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    out[map[k] ?? k] = v;
  }
  return out as Partial<SkillsMdConfig>;
}
```
  </action>
  <verify>
Test 1 — over budget:
```bash
curl -s -X POST https://localhost:3000/api/fighters \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","stats":{"striking":95,"punchSpeed":95,"kickPower":95,"headMovement":95,"footwork":95,"combinations":95,"wrestling":95,"takedownDefense":95,"clinchControl":95,"trips":95,"throws":95,"submissions":95,"submissionDefense":95,"groundAndPound":95,"guardPassing":95,"sweeps":95,"topControl":95,"bottomGame":95,"cardio":95,"chin":95,"recovery":95,"strength":95,"flexibility":95}}' | jq .
```
Should return 400 with `{ "error": "Over budget", "details": [...] }`.

Test 2 — snake_case normalization:
```bash
curl -s -X POST https://localhost:3000/api/fighters \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","stats":{"striking":70,"punch_speed":75,"head_movement":65}}' | jq .stats
```
Should return stats with camelCase keys (punchSpeed, headMovement), not snake_case.

Test 3 — valid budget succeeds:
```bash
curl -s -X POST https://localhost:3000/api/fighters \
  -H "Content-Type: application/json" \
  -d '{"name":"Valid","stats":{"striking":70,"wrestling":60,"cardio":80}}' | jq .
```
Should return 201 with fighter object.
  </verify>
  <done>
POST /api/fighters returns 400 with { error: "Over budget", details: [...] } when stats exceed 1200-point budget. Snake_case keys in the stats object are silently normalized to camelCase before storage. Valid fighters register successfully with fully merged camelCase stats.
  </done>
</task>

<task type="auto">
  <name>Task 2: Budget summary in fightbook validate</name>
  <files>src/cli.ts</files>
  <action>
Update the import at the top of src/cli.ts to add the missing exports:

Change:
```typescript
import { parseSkillsMd, createNewAgent, generateFullSkillsMd } from './types/agent';
```
To:
```typescript
import { parseSkillsMd, createNewAgent, generateFullSkillsMd, validateSkillsBudget, DEFAULT_SKILLS, POINT_BUDGET, calculatePointsSpent } from './types/agent';
```

Update the `validateSkills()` function. After printing the existing stat lines, add:

```typescript
  // Merge with defaults to get complete config for budget calculation
  const fullSkills = { ...DEFAULT_SKILLS, ...skills };
  const spent = calculatePointsSpent(fullSkills);
  const validation = validateSkillsBudget(fullSkills);

  console.log(`  Budget: ${spent} / ${POINT_BUDGET.TOTAL} points used`);

  if (validation.warnings.length > 0) {
    for (const warn of validation.warnings) {
      console.log(`  Warning: ${warn}`);
    }
  }

  if (!validation.valid) {
    for (const err of validation.errors) {
      console.error(`  Error: ${err}`);
    }
    process.exit(1);
  }
```

The existing "Valid skills.md" line should remain at the top of the function (printed before the stat lines). The budget block goes after the stat lines.
  </action>
  <verify>
Build and run validate against a known-good file:
```bash
npx ts-node src/cli.ts validate ./test-agent.md
```
Should print "Budget: XXX / 1200 points used" and exit 0 for a valid file.

For an invalid file (manually set striking: 95 on every stat), it should print errors and exit 1:
```bash
echo $?
```
Should be 1.
  </verify>
  <done>
fightbook validate prints "Budget: X / 1200 points used" after the stat summary. Files with over-budget configs print error messages and exit with code 1. Valid files exit 0.
  </done>
</task>

<task type="auto">
  <name>Task 3: Document budget in SKILL.md</name>
  <files>SKILL.md</files>
  <action>
In the "## skills.md Format" section, insert a budget note BEFORE the opening yaml code block.

Find the line:
```
Your fighter is defined by a simple YAML-like format:
```

Replace it with:
```
Your fighter is defined by a simple YAML-like format:

**Budget: 1200 points to distribute across physical stats. Max 95 per stat, min 20.**
Each stat starts at a base of 30 — you spend points to raise stats above 30.
Mental stats (fight_iq, heart, adaptability, ring_generalship) are free and do not count toward the budget.

Run `fightbook validate your-fighter.md` to check your budget before registering.
```

The text goes between "Your fighter is defined by a simple YAML-like format:" and the opening triple-backtick of the yaml block.

No other sections of SKILL.md should be changed.
  </action>
  <verify>
Read SKILL.md and confirm the budget note appears between the intro sentence and the yaml block in the "skills.md Format" section.
  </verify>
  <done>
SKILL.md "skills.md Format" section has the budget note (1200 points, max 95, min 20, mental stats free) prominently placed before the yaml block, plus the validate command hint.
  </done>
</task>

</tasks>

<verification>
1. api/fighters.ts builds without TypeScript errors: `npx tsc --noEmit`
2. src/cli.ts builds without TypeScript errors: `npx tsc --noEmit`
3. POST /api/fighters returns 400 for over-budget submissions
4. POST /api/fighters normalizes snake_case keys in stats
5. fightbook validate prints budget line and exits 1 for invalid files
6. SKILL.md budget note is present and accurate
</verification>

<success_criteria>
- Budget enforcement active at API layer (400 on violation)
- Snake_case stat keys accepted and silently normalized
- skills_md string accepted as alternative to stats JSON
- CLI validate shows budget usage and fails on violations
- SKILL.md budget documented before the yaml format block
</success_criteria>

<output>
After completion, create `.planning/quick/6-stat-budget-enforcement-across-cli-api-a/6-SUMMARY.md`
</output>
