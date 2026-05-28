# Screaming Frog Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Screaming Frog as a normalized crawl import source that feeds the same technical evidence model as the own crawler.

**Architecture:** A shared importer parses Screaming Frog CSV exports into normalized page snapshots, then runs the same deterministic technical rule evaluation used by the own crawler. The backend exposes the imported crawl as a workspace-owned source and merges its rule checks into audit intelligence. The frontend gets a dedicated Screaming Frog page that shows the import status, rule checks, and URL-level findings without introducing a separate data shape.

**Tech Stack:** TypeScript, shared domain helpers, Node backend repository, Next.js App Router, Vitest, Playwright.

---

### Task 1: Shared Importer

**Files:**
- Modify: `packages/shared/src/rankflow-types.ts`
- Modify: `packages/shared/src/rankflow-helpers.ts`
- Create: `packages/shared/src/rankflow-screaming-frog-helpers.test.ts`

- [ ] **Step 1: Add Screaming Frog row and source types**
- [ ] **Step 2: Add CSV parsing and evaluation helpers**
- [ ] **Step 3: Write importer tests**
- [ ] **Step 4: Run shared tests and verify pass**

### Task 2: Backend Exposure

**Files:**
- Modify: `apps/backend/src/rankflow-data.ts`
- Modify: `apps/backend/src/repositories/rankflow-repository.ts`
- Modify: `apps/backend/src/server.ts`
- Create: `apps/backend/tests/screaming-frog.test.ts`

- [ ] **Step 1: Add workspace Screaming Frog fixture import**
- [ ] **Step 2: Add repository method `getScreamingFrog()`**
- [ ] **Step 3: Add `/api/workspaces/:id/screaming-frog`**
- [ ] **Step 4: Add repository tests**
- [ ] **Step 5: Run backend tests and verify pass**

### Task 3: Frontend Surface

**Files:**
- Modify: `apps/frontend/src/lib/rankflow-api.ts`
- Modify: `apps/frontend/src/components/app-shell.tsx`
- Modify: `apps/frontend/src/components/workspace-detail.tsx`
- Modify: `apps/frontend/src/components/workspace-modules.tsx`
- Create: `apps/frontend/src/app/workspaces/[workspaceId]/screaming-frog/page.tsx`
- Modify: `apps/frontend/tests/browser-smoke.spec.ts`

- [ ] **Step 1: Add the API helper**
- [ ] **Step 2: Add nav and module card**
- [ ] **Step 3: Add the dedicated Screaming Frog page**
- [ ] **Step 4: Add browser smoke coverage**
- [ ] **Step 5: Run lint, typecheck, build, and e2e**
