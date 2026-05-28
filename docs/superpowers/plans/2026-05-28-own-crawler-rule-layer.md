# Own Crawler Rule Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add RankFlow’s deterministic own crawler / rule engine as a first-class module that produces technical findings for titles, H1s, canonicals, indexability, links, schema, image alt text, and page speed.

**Architecture:** The rule engine evaluates normalized page snapshots in shared code and emits crawl findings, technical rule checks, and a source status summary. Backend fixtures and the workspace repository expose the crawler evaluation through a dedicated API route, while the frontend shows the crawl summary and URL-level issues in its own module. This keeps the crawler deterministic and reusable for future live fetchers.

**Tech Stack:** TypeScript, shared domain helpers, Node backend repository, Next.js App Router, Vitest, Playwright.

---

### Task 1: Shared Crawler Model

**Files:**
- Modify: `packages/shared/src/rankflow-types.ts`
- Modify: `packages/shared/src/rankflow-helpers.ts`
- Create: `packages/shared/src/rankflow-crawler-helpers.test.ts`

- [ ] **Step 1: Define crawler snapshot and evaluation types**
- [ ] **Step 2: Implement `evaluateCrawlerPages()`**
- [ ] **Step 3: Add the helper test**
- [ ] **Step 4: Run the helper test and verify it passes**

### Task 2: Backend Crawler Exposure

**Files:**
- Modify: `apps/backend/src/rankflow-data.ts`
- Modify: `apps/backend/src/repositories/rankflow-repository.ts`
- Modify: `apps/backend/src/server.ts`
- Create: `apps/backend/tests/own-crawler.test.ts`

- [ ] **Step 1: Add workspace crawler fixture pages**
- [ ] **Step 2: Add repository method `getOwnCrawler()`**
- [ ] **Step 3: Add `/api/workspaces/:id/own-crawler`**
- [ ] **Step 4: Add repository tests**
- [ ] **Step 5: Run backend tests and verify pass**

### Task 3: Frontend Crawler Surface

**Files:**
- Modify: `apps/frontend/src/lib/rankflow-api.ts`
- Modify: `apps/frontend/src/components/app-shell.tsx`
- Modify: `apps/frontend/src/components/workspace-detail.tsx`
- Modify: `apps/frontend/src/components/workspace-modules.tsx`
- Create: `apps/frontend/src/app/workspaces/[workspaceId]/own-crawler/page.tsx`
- Modify: `apps/frontend/tests/browser-smoke.spec.ts`

- [ ] **Step 1: Add the API fetch helper**
- [ ] **Step 2: Add the crawler module card and sidebar link**
- [ ] **Step 3: Add the dedicated crawler page**
- [ ] **Step 4: Add browser smoke coverage**
- [ ] **Step 5: Run lint, typecheck, build, and e2e**
