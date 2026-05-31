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
- `GET /api/workspaces/:id/own-crawler`
- `GET /api/workspaces/:id/screaming-frog`
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

## Runtime Modes

RankFlow is safe to run locally and as a private staging/demo deployment with seeded data. Real customer production still requires the live repository/auth slice.

- Local development: leave `NODE_ENV=development`.
- Private staging/demo: set `NODE_ENV=production` and `RANKFLOW_DATA_MODE=seed`.
- Customer production: set `NODE_ENV=production` and `RANKFLOW_DATA_MODE=live`, then wire the backend to Supabase/Postgres before serving traffic.

The backend intentionally refuses to serve seeded fixture data in production unless `RANKFLOW_DATA_MODE=seed` is explicitly set. This prevents accidentally launching demo data as a customer production system.

Copy `.env.example` into your deploy provider and set service-specific values:

- Backend: `PORT`, `CORS_ORIGIN`, `RANKFLOW_DATA_MODE`, connector secrets.
- Frontend: `RANKFLOW_API_URL`.
- Railway/Nixpacks: set `NIXPACKS_NODE_VERSION=24` for both services because Next.js 16 requires Node 20.9+.

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

Authority and reasoning connectors use real provider credentials:

- `RANKFLOW_DATAFORSEO_LIVE_MODE=1`
- `RANKFLOW_DATAFORSEO_LOGIN=...`
- `RANKFLOW_DATAFORSEO_PASSWORD=...`
- `RANKFLOW_DATAFORSEO_LOCATION_NAME=United States`
- `RANKFLOW_DATAFORSEO_LANGUAGE_NAME=English`
- `RANKFLOW_AHREFS_LIVE_MODE=1`
- `RANKFLOW_AHREFS_API_KEY=...`
- `RANKFLOW_SEMRUSH_LIVE_MODE=1`
- `RANKFLOW_SEMRUSH_API_KEY=...`
- `RANKFLOW_SEMRUSH_DATABASE=us`
- `RANKFLOW_CLAUDE_BRAIN_LIVE_MODE=1`
- `RANKFLOW_CLAUDE_BRAIN_API_KEY=...`
- `RANKFLOW_CLAUDE_BRAIN_MODEL=claude-sonnet-4-20250514`

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

The backend currently uses a fixture repository for local development and private staging/demo mode. In production with `RANKFLOW_DATA_MODE=live`, a Supabase/Postgres repository must be wired before customer use.

## Deployment

Railway-oriented service configs are included:

- `apps/backend/railway.toml` builds and starts the backend service, with `/health` as the health check.
- `apps/frontend/railway.toml` builds and starts the frontend service.

Recommended staging setup:

- Backend service root: repo root, config: `apps/backend/railway.toml`
- Frontend service root: repo root, config: `apps/frontend/railway.toml`
- Backend env: `NODE_ENV=production`, `RANKFLOW_DATA_MODE=seed`, `CORS_ORIGIN=<frontend-url>`
- Frontend env: `RANKFLOW_API_URL=<backend-url>`
- Both services: `NIXPACKS_NODE_VERSION=24`

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```
