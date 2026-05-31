# RankFlow Live Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make RankFlow deployable as a private staging/live demo without weakening the guardrail that real production must use a live data store.

**Architecture:** Keep the existing fixture repository for local/demo data, but require an explicit `RANKFLOW_DATA_MODE=seed` opt-in before it can run with `NODE_ENV=production`. Add deployment configuration and CI so the app can be verified consistently before deploy. Leave true customer production behind `RANKFLOW_DATA_MODE=live`, which must be backed by a Supabase repository in a later slice.

**Tech Stack:** TypeScript, Node HTTP backend, Next.js frontend, Vitest, Playwright, GitHub Actions, Railway/Vercel-compatible environment variables.

---

### Task 1: Production Data Mode Guardrail

**Files:**
- Modify: `apps/backend/src/repositories/rankflow-repository.ts`
- Modify: `apps/backend/tests/rankflow-repository.test.ts`
- Modify: `README.md`

- [ ] Add tests proving production still fails closed by default.
- [ ] Add tests proving `NODE_ENV=production RANKFLOW_DATA_MODE=seed` explicitly enables seeded staging/demo data.
- [ ] Implement a `getRankFlowDataMode()` helper and use it in the fixture repository guard.
- [ ] Document `RANKFLOW_DATA_MODE=seed` as staging/demo only and `RANKFLOW_DATA_MODE=live` as the real production target.

### Task 2: Deployment Runtime Files

**Files:**
- Create: `railway.json`
- Create: `apps/backend/railway.toml`
- Create: `apps/frontend/railway.toml`
- Create: `.env.example`

- [ ] Add deploy commands for backend and frontend workspaces.
- [ ] Add health check target for backend.
- [ ] Add env examples for frontend API URL, CORS, data mode, and live connectors.

### Task 3: CI Verification

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] Run install, lint, typecheck, unit tests, build, and Playwright e2e on pull requests and main.
- [ ] Cache npm dependencies through `actions/setup-node`.

### Task 4: Verification

- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Run `npm run test:e2e`.
- [ ] Start local dev server and verify `/health` and `/workspaces/aurora-education/re-audit`.
