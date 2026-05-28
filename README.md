# RankFlow SEO Dashboard

RankFlow is an SEO Intelligence SaaS platform with a separated frontend and backend architecture.

## Project Structure

```txt
apps/
  frontend/   Next.js product UI
  backend/    Node TypeScript API service
packages/
  shared/     Shared RankFlow domain types and helpers
```

## Local Development

Run both services together:

```bash
npm run dev
```

Service URLs:

- Frontend: `http://127.0.0.1:3000`
- Backend health: `http://127.0.0.1:4000/health`

Run services separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Backend API

- `GET /health`
- `GET /api/hod/summary`
- `GET /api/session`
- `GET /api/workspaces`
- `GET /api/workspaces/:id`
- `GET /api/workspaces/:id/ai-brain`
- `GET /api/workspaces/:id/audit-intelligence`
- `GET /api/workspaces/:id/growth-cycles`
- `GET /api/workspaces/:id/organic-metrics`
- `GET /api/workspaces/:id/action-items`
- `GET /api/workspaces/:id/expert-efficiency`
- `GET /api/workspaces/:id/scans`
- `GET /api/workspaces/:id/audit-categories`
- `GET /api/workspaces/:id/suggestions`
- `GET /api/workspaces/:id/tasks`
- `GET /api/workspaces/:id/local-visibility`
- `GET /api/workspaces/:id/keywords`
- `GET /api/workspaces/:id/reports`

The frontend reads RankFlow data through backend APIs. Shared TypeScript contracts live in `packages/shared`.

## Live Connector Mode

The backend can merge live Google Search Console data into the audit intelligence stack when these env vars are set:

- `RANKFLOW_GSC_LIVE_MODE=1`
- `RANKFLOW_GSC_SITE_URL=sc-domain:example.com`
- `RANKFLOW_GSC_ACCESS_TOKEN=...`

If live mode is disabled or the connector fails, the backend falls back to the fixture-backed audit stack.

The same pattern is available for Google Analytics 4:

- `RANKFLOW_GA4_LIVE_MODE=1`
- `RANKFLOW_GA4_PROPERTY_ID=123456789`
- `RANKFLOW_GA4_ACCESS_TOKEN=...`

## Database

The initial Supabase/Postgres schema lives in:

```txt
supabase/migrations/202605200001_rankflow_backend_foundation.sql
supabase/migrations/202605210001_rankflow_growth_modules.sql
supabase/migrations/202605220001_rankflow_access_control.sql
supabase/migrations/202605280001_rankflow_local_visibility.sql
supabase/migrations/202605280002_rankflow_growth_cycle_action_intelligence.sql
supabase/migrations/202605280003_rankflow_ai_brain.sql
supabase/migrations/202605280004_rankflow_audit_intelligence_stack.sql
```

The backend currently uses a fixture repository that implements the same repository interface planned for Supabase-backed data access.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```
