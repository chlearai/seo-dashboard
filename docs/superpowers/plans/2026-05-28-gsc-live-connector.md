# Google Search Console Live Connector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first live connector layer for Google Search Console with env-backed live mode and fixture fallback.

**Architecture:** A small backend connector adapter reads GSC config from environment variables, fetches live Search Analytics data when enabled, and returns a normalized snapshot. The existing RankFlow repository merges live GSC data into the current audit intelligence fixture so the UI can use one stable contract. If live mode is disabled or fails, the repository falls back to fixture data without changing the frontend.

**Tech Stack:** TypeScript, Node fetch API, backend repository layer, Vitest, existing RankFlow shared types and fixtures.

---

### Task 1: Connector Contract And Tests

**Files:**
- Create: `apps/backend/src/connectors/google-search-console.ts`
- Create: `apps/backend/tests/google-search-console-connector.test.ts`

- [ ] **Step 1: Write the failing connector tests**

```ts
import { describe, expect, it, vi } from "vitest";
import { createGoogleSearchConsoleConnector } from "../src/connectors/google-search-console";

describe("google search console connector", () => {
  it("returns null when live mode is disabled", async () => {
    const connector = createGoogleSearchConsoleConnector({
      enabled: false,
      siteUrl: "sc-domain:aurora.edu",
      accessToken: "token",
      fetchImpl: vi.fn()
    });

    await expect(connector.getSnapshot()).resolves.toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -w @rankflow/backend -- google-search-console-connector.test.ts`

Expected: FAIL because the connector file does not exist.

- [ ] **Step 3: Implement the connector**

Create a connector that:

- returns `null` when `enabled` is false
- calls the Search Console Search Analytics API when enabled
- converts the API response into a GSC source status and search performance signals
- throws a controlled error on missing config or HTTP failures

- [ ] **Step 4: Run the test to verify GREEN**

Run: `npm test -w @rankflow/backend -- google-search-console-connector.test.ts`

Expected: PASS.

### Task 2: Repository Merge And Fallback

**Files:**
- Modify: `apps/backend/src/rankflow-data.ts`
- Modify: `apps/backend/src/repositories/rankflow-repository.ts`
- Modify: `apps/backend/src/server.ts`
- Create: `apps/backend/tests/rankflow-gsc-live.test.ts`

- [ ] **Step 1: Write a repository test**

```ts
import { describe, expect, it } from "vitest";
import { FixtureRankFlowRepository } from "../src/repositories/rankflow-repository";

describe("gsc live connector fallback", () => {
  it("falls back to fixture audit intelligence when live mode is off", async () => {
    const repository = new FixtureRankFlowRepository();
    await expect(repository.getAuditIntelligence("aurora-education")).resolves.toMatchObject({
      sourceStatuses: expect.arrayContaining([
        expect.objectContaining({ source: "gsc", status: "Connected" })
      ])
    });
  });
});
```

- [ ] **Step 2: Add repository merge logic**

Merge live GSC data into the existing `auditIntelligenceByWorkspace` fixture so only the GSC source status and GSC signals are overridden when live mode is available.

- [ ] **Step 3: Add env wiring**

Use these env vars:

- `RANKFLOW_GSC_LIVE_MODE`
- `RANKFLOW_GSC_SITE_URL`
- `RANKFLOW_GSC_ACCESS_TOKEN`

- [ ] **Step 4: Run backend tests**

Run: `npm test -w @rankflow/backend`

Expected: PASS.

### Task 3: Verification

**Files:**
- Modify: `apps/backend/tests/rankflow-repository.test.ts` if needed

- [ ] **Step 1: Run repo-wide checks**

Run:

```bash
npm run lint
npm run typecheck
npm test
```

- [ ] **Step 2: Confirm no frontend changes are required**

The frontend should continue using the same audit intelligence API contract.
