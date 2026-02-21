# Vercel API 404 Debug Report

## Root Cause

**Uncommitted change reverted `api/index.ts`** - The file no longer handles `/api/health` or other endpoints.

### Evidence

1. **Current api/index.ts** (lines 1-10):
   - Only returns generic `{ message: 'FightBook API', path: req.url }`
   - No health check logic

2. **Committed version in 3c7723b** had:
   ```typescript
   if (path === '/api/health' || path === '/health') {
     return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), { status: 200, headers });
   }
   ```

3. **.vercel/output/config.json** only has routes for:
   - `/api/fighters` → fighters.func
   - `/api/fights` → fights.func
   - `/api/index` → index.func (but this doesn't handle health!)
   - `/api/leaderboard` → leaderboard.func

4. **vercel.json** has rewrite rule for `/api/(.*)` → `/api/index.ts` but index.ts doesn't process it

## The Fix

Restore the health check handler in `api/index.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url?.split('?')[0] || '';
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (path === '/api/health' || path === '/health') {
    return res.status(200).json({ status: 'ok', timestamp: Date.now() });
  }

  // ... other routes

  res.status(200).json({ message: 'FightBook API' });
}
```

Or revert to the committed version: `git checkout -- api/index.ts`
