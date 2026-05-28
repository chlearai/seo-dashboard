# RankFlow Hybrid Audit Intelligence Stack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build RankFlow’s hybrid audit intelligence stack: own lightweight crawler/rule layer, Screaming Frog import, GSC/GA4 integrations, Ahrefs/Semrush/DataForSEO authority/rank inputs, and Claude SEO Brain interpretation.

**Architecture:** Evidence collection is separated from reasoning. Deterministic collectors and imports produce normalized audit evidence; Claude SEO Brain consumes that structured evidence to diagnose, prioritize, generate actions, and draft report narratives. RankFlow remains the system of record for cycles, action tracking, evidence, and expert efficiency.

**Tech Stack:** TypeScript, Node backend, Next.js App Router, shared domain package, Vitest, Playwright, Supabase/Postgres migrations, future provider adapters for Claude and third-party SEO APIs.

---

## Product Direction

Use this operating model:

```txt
Own crawler/rule layer -> Screaming Frog import -> GSC/GA4 -> Ahrefs/Semrush/DataForSEO -> Claude SEO Brain -> Action Intelligence -> Reports
```

Division of responsibility:

- Own lightweight crawler/rule layer: repeatable core technical checks.
- Screaming Frog import or API-style crawl integration: deep technical crawl coverage quickly.
- GSC + GA4: real performance, impressions, clicks, CTR, sessions, leads, conversions.
- Ahrefs/Semrush/DataForSEO: backlinks, authority, keyword ranks, competitors.
- Claude SEO Brain: deep interpretation, prioritization, why analysis, action generation, and client-ready reporting.

The important product boundary:

```txt
Tools collect facts.
Claude interprets facts.
RankFlow tracks decisions, actions, evidence, progress, and accountability.
```

---

## File Structure

Create:

- `packages/shared/src/rankflow-audit-intelligence-types.test.ts`
- `packages/shared/src/rankflow-audit-intelligence-helpers.test.ts`
- `apps/backend/tests/rankflow-audit-intelligence.test.ts`
- `apps/frontend/src/app/workspaces/[workspaceId]/audit-intelligence/page.tsx`
- `supabase/migrations/202605280004_rankflow_audit_intelligence_stack.sql`

Modify:

- `packages/shared/src/rankflow-types.ts`
- `packages/shared/src/rankflow-helpers.ts`
- `apps/backend/src/rankflow-data.ts`
- `apps/backend/src/repositories/rankflow-repository.ts`
- `apps/backend/src/server.ts`
- `apps/frontend/src/lib/rankflow-api.ts`
- `apps/frontend/src/components/app-shell.tsx`
- `apps/frontend/src/components/workspace-detail.tsx`
- `apps/frontend/src/components/workspace-modules.tsx`
- `apps/frontend/src/app/globals.css`
- `apps/frontend/tests/browser-smoke.spec.ts`
- `README.md`
- `PRODUCT.md`

---

## Domain Model

Add these types to `packages/shared/src/rankflow-types.ts`.

```ts
export type AuditEvidenceSource =
  | "own-crawler"
  | "screaming-frog"
  | "gsc"
  | "ga4"
  | "ahrefs"
  | "semrush"
  | "dataforseo"
  | "claude-brain";

export type AuditSignalCategory =
  | "technical"
  | "content"
  | "indexability"
  | "performance"
  | "internal-linking"
  | "schema"
  | "rankings"
  | "traffic"
  | "conversions"
  | "authority"
  | "competitors"
  | "local"
  | "aeo"
  | "geo";

export interface AuditEvidenceSourceStatus {
  source: AuditEvidenceSource;
  label: string;
  status: "Connected" | "Import Ready" | "Needs Setup" | "Error";
  coverageScore: number;
  lastSyncedAt: string;
  recordsAvailable: number;
  primaryUse: string;
}

export interface TechnicalRuleCheck {
  id: string;
  category: AuditSignalCategory;
  label: string;
  description: string;
  severity: Severity;
  affectedUrls: number;
  passedUrls: number;
  failedUrls: number;
  source: "own-crawler" | "screaming-frog";
}

export interface SearchPerformanceSignal {
  id: string;
  source: "gsc" | "ga4";
  label: string;
  value: number;
  delta: number;
  category: "impressions" | "clicks" | "ctr" | "sessions" | "leads" | "conversions";
}

export interface AuthoritySignal {
  id: string;
  source: "ahrefs" | "semrush" | "dataforseo";
  label: string;
  value: number;
  delta: number;
  category: "backlinks" | "referring-domains" | "keyword-rank" | "competitor-gap" | "authority-score";
}

export interface ClaudeBrainAuditRun {
  id: string;
  status: "Ready" | "Running" | "Needs Approval" | "Completed" | "Blocked";
  inputSources: AuditEvidenceSource[];
  confidenceScore: number;
  promptVersion: string;
  findingsGenerated: number;
  actionsGenerated: number;
  reportNarrativesGenerated: number;
  requiresHumanApproval: boolean;
  lastRunAt: string;
}

export interface AuditIntelligenceStack {
  workspaceId: string;
  sourceStatuses: AuditEvidenceSourceStatus[];
  technicalChecks: TechnicalRuleCheck[];
  searchPerformance: SearchPerformanceSignal[];
  authoritySignals: AuthoritySignal[];
  claudeBrain: ClaudeBrainAuditRun;
}

export interface AuditIntelligenceSummary {
  connectedSources: number;
  needsSetup: number;
  technicalIssues: number;
  criticalTechnicalIssues: number;
  performanceSignals: number;
  authoritySignals: number;
  claudeReady: boolean;
}
```

---

## Task 1: Shared Hybrid Stack Types And Summary Helper

**Files:**
- Modify: `packages/shared/src/rankflow-types.ts`
- Modify: `packages/shared/src/rankflow-helpers.ts`
- Create: `packages/shared/src/rankflow-audit-intelligence-helpers.test.ts`

- [ ] **Step 1: Write failing summary helper test**

```ts
import { describe, expect, it } from "vitest";
import { getAuditIntelligenceSummary } from "./rankflow-helpers";
import type { AuditIntelligenceStack } from "./rankflow-types";

describe("rankflow audit intelligence helpers", () => {
  it("summarizes hybrid evidence coverage and Claude readiness", () => {
    const stack: AuditIntelligenceStack = {
      workspaceId: "aurora-education",
      sourceStatuses: [
        { source: "own-crawler", label: "Own crawler", status: "Connected", coverageScore: 84, lastSyncedAt: "2026-05-28", recordsAvailable: 842, primaryUse: "Core technical checks" },
        { source: "screaming-frog", label: "Screaming Frog", status: "Import Ready", coverageScore: 72, lastSyncedAt: "2026-05-27", recordsAvailable: 2100, primaryUse: "Deep crawl import" },
        { source: "gsc", label: "Google Search Console", status: "Connected", coverageScore: 91, lastSyncedAt: "2026-05-28", recordsAvailable: 18400, primaryUse: "Queries and impressions" },
        { source: "ahrefs", label: "Ahrefs", status: "Needs Setup", coverageScore: 0, lastSyncedAt: "Not connected", recordsAvailable: 0, primaryUse: "Backlinks and authority" }
      ],
      technicalChecks: [
        { id: "tc-1", category: "technical", label: "Missing titles", description: "Pages without title tags", severity: "high", affectedUrls: 12, passedUrls: 830, failedUrls: 12, source: "own-crawler" },
        { id: "tc-2", category: "indexability", label: "Blocked important pages", description: "Important pages with noindex", severity: "critical", affectedUrls: 3, passedUrls: 839, failedUrls: 3, source: "own-crawler" }
      ],
      searchPerformance: [
        { id: "sp-1", source: "gsc", label: "Search impressions", value: 134000, delta: 34000, category: "impressions" }
      ],
      authoritySignals: [
        { id: "as-1", source: "dataforseo", label: "Referring domains", value: 348, delta: 26, category: "referring-domains" }
      ],
      claudeBrain: {
        id: "brain-run-1",
        status: "Ready",
        inputSources: ["own-crawler", "gsc", "ga4", "dataforseo"],
        confidenceScore: 86,
        promptVersion: "seo-brain-v1",
        findingsGenerated: 18,
        actionsGenerated: 9,
        reportNarrativesGenerated: 2,
        requiresHumanApproval: true,
        lastRunAt: "2026-05-28 15:00"
      }
    };

    expect(getAuditIntelligenceSummary(stack)).toEqual({
      connectedSources: 2,
      needsSetup: 1,
      technicalIssues: 15,
      criticalTechnicalIssues: 3,
      performanceSignals: 1,
      authoritySignals: 1,
      claudeReady: true
    });
  });
});
```

- [ ] **Step 2: Run test to verify RED**

```bash
npm test -w @rankflow/shared -- rankflow-audit-intelligence-helpers.test.ts
```

Expected: FAIL because `getAuditIntelligenceSummary` and the types do not exist.

- [ ] **Step 3: Implement types and helper**

Add the domain model types above.

Add to `rankflow-helpers.ts`:

```ts
export function getAuditIntelligenceSummary(stack: AuditIntelligenceStack): AuditIntelligenceSummary {
  return {
    connectedSources: stack.sourceStatuses.filter((source) => source.status === "Connected").length,
    needsSetup: stack.sourceStatuses.filter((source) => source.status === "Needs Setup").length,
    technicalIssues: stack.technicalChecks.reduce((sum, check) => sum + check.failedUrls, 0),
    criticalTechnicalIssues: stack.technicalChecks
      .filter((check) => check.severity === "critical")
      .reduce((sum, check) => sum + check.failedUrls, 0),
    performanceSignals: stack.searchPerformance.length,
    authoritySignals: stack.authoritySignals.length,
    claudeReady: stack.claudeBrain.status === "Ready" || stack.claudeBrain.status === "Needs Approval"
  };
}
```

- [ ] **Step 4: Run test to verify GREEN**

```bash
npm test -w @rankflow/shared -- rankflow-audit-intelligence-helpers.test.ts
```

Expected: PASS.

---

## Task 2: Backend Fixture And API Endpoint

**Files:**
- Modify: `apps/backend/src/rankflow-data.ts`
- Modify: `apps/backend/src/repositories/rankflow-repository.ts`
- Modify: `apps/backend/src/server.ts`
- Create: `apps/backend/tests/rankflow-audit-intelligence.test.ts`

- [ ] **Step 1: Write failing repository test**

```ts
import { describe, expect, it } from "vitest";
import { FixtureRankFlowRepository } from "../src/repositories/rankflow-repository";

describe("rankflow audit intelligence repository", () => {
  const repository = new FixtureRankFlowRepository();

  it("returns the workspace hybrid audit intelligence stack", async () => {
    await expect(repository.getAuditIntelligence("aurora-education")).resolves.toMatchObject({
      workspaceId: "aurora-education",
      sourceStatuses: expect.arrayContaining([
        expect.objectContaining({ source: "own-crawler", status: "Connected" }),
        expect.objectContaining({ source: "gsc", status: "Connected" }),
        expect.objectContaining({ source: "ahrefs", status: "Needs Setup" })
      ]),
      claudeBrain: expect.objectContaining({
        status: "Ready",
        requiresHumanApproval: true
      })
    });
  });
});
```

- [ ] **Step 2: Run test to verify RED**

```bash
npm test -w @rankflow/backend -- rankflow-audit-intelligence.test.ts
```

Expected: FAIL because repository method does not exist.

- [ ] **Step 3: Add fixture stack**

Add `auditIntelligenceByWorkspace` in `apps/backend/src/rankflow-data.ts`.

It must include:

- Own crawler connected.
- Screaming Frog import ready.
- GSC connected.
- GA4 connected.
- DataForSEO import ready.
- Ahrefs/Semrush needs setup.
- Claude Brain ready and approval-gated.
- Core technical checks:
  - missing titles
  - duplicate meta
  - canonical conflicts
  - noindex important pages
  - broken internal links
  - schema missing
  - image alt missing
  - slow pages

- [ ] **Step 4: Add repository method**

```ts
getAuditIntelligence(workspaceId: string): Promise<AuditIntelligenceStack | undefined>;
```

- [ ] **Step 5: Add backend route**

Add:

```txt
GET /api/workspaces/:id/audit-intelligence
```

- [ ] **Step 6: Run backend test**

```bash
npm test -w @rankflow/backend -- rankflow-audit-intelligence.test.ts
```

Expected: PASS.

---

## Task 3: Supabase Migration

**Files:**
- Create: `supabase/migrations/202605280004_rankflow_audit_intelligence_stack.sql`

- [ ] **Step 1: Add migration**

Create tables:

- `audit_evidence_source_statuses`
- `technical_rule_checks`
- `search_performance_signals`
- `authority_signals`
- `claude_brain_audit_runs`

Each table must include `workspace_id` and indexes on workspace/date/status fields.

Minimum SQL:

```sql
create table if not exists public.audit_evidence_source_statuses (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source text not null,
  label text not null,
  status text not null,
  coverage_score integer not null default 0 check (coverage_score between 0 and 100),
  last_synced_at timestamptz,
  records_available integer not null default 0 check (records_available >= 0),
  primary_use text not null,
  updated_at timestamptz not null default now()
);
```

- [ ] **Step 2: Verify migration shape**

```bash
rg -n "create table|create index|references public.workspaces" supabase/migrations/202605280004_rankflow_audit_intelligence_stack.sql
```

Expected: all five tables and their indexes appear.

---

## Task 4: Frontend Audit Intelligence Module

**Files:**
- Modify: `apps/frontend/src/lib/rankflow-api.ts`
- Create: `apps/frontend/src/app/workspaces/[workspaceId]/audit-intelligence/page.tsx`
- Modify: `apps/frontend/src/components/workspace-modules.tsx`
- Modify: `apps/frontend/src/components/app-shell.tsx`
- Modify: `apps/frontend/src/components/workspace-detail.tsx`
- Modify: `apps/frontend/src/app/globals.css`

- [ ] **Step 1: Add API client**

```ts
export async function getWorkspaceAuditIntelligence(workspaceId: string) {
  return fetchJson<AuditIntelligenceStack>(`/api/workspaces/${workspaceId}/audit-intelligence`);
}
```

- [ ] **Step 2: Add route page**

```tsx
export default async function AuditIntelligencePage({ params }: AuditIntelligencePageProps) {
  const { workspaceId } = await params;

  try {
    const [workspace, stack] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceAuditIntelligence(workspaceId)
    ]);

    return <AuditIntelligenceModule workspace={workspace} stack={stack} />;
  } catch {
    notFound();
  }
}
```

- [ ] **Step 3: Add `AuditIntelligenceModule`**

The module must show:

- Evidence stack health:
  - own crawler
  - Screaming Frog
  - GSC
  - GA4
  - Ahrefs/Semrush/DataForSEO
  - Claude Brain
- Technical checks table.
- Performance signals from GSC/GA4.
- Authority/rank signals from Ahrefs/Semrush/DataForSEO.
- Claude Brain readiness panel with approval gate.

- [ ] **Step 4: Add navigation**

Add module:

```ts
{ id: "audit-intelligence", label: "Audit Intelligence", href: "/workspaces/aurora-education/audit-intelligence", Icon: ScanSearch }
```

Also add `"audit-intelligence"` to `RankFlowModule`, session visible modules, and access module lists.

- [ ] **Step 5: Add workspace card**

Card copy:

```txt
Audit Intelligence
Crawler, imports, analytics, authority data, and Claude SEO Brain
```

---

## Task 5: Playwright And Verification

**Files:**
- Modify: `apps/frontend/tests/browser-smoke.spec.ts`

- [ ] **Step 1: Add smoke test**

```ts
test("audit intelligence route renders hybrid evidence stack", async ({ page }) => {
  await page.goto("/workspaces/aurora-education/audit-intelligence");
  await expect(page.getByRole("heading", { name: /Aurora Education Group audit intelligence/i })).toBeVisible();
  await expect(page.getByText("Own crawler")).toBeVisible();
  await expect(page.getByText("Screaming Frog")).toBeVisible();
  await expect(page.getByText("Google Search Console")).toBeVisible();
  await expect(page.getByText("Claude SEO Brain")).toBeVisible();
  await expect(page.getByText("Missing titles")).toBeVisible();
  await expect(page.getByText("Referring domains")).toBeVisible();
});
```

- [ ] **Step 2: Run full verification**

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Expected:

- lint exits 0
- typecheck exits 0
- backend/shared tests pass
- build includes `/workspaces/[workspaceId]/audit-intelligence`
- Playwright passes all smoke tests

---

## Implementation Notes

Do not connect live external APIs in this slice. This slice builds the product contract and UI for the hybrid architecture. Live connectors should be added in later slices behind explicit credentials, sync jobs, rate limits, error states, and approval controls.

First live connector priority after this slice:

1. GSC
2. GA4
3. Own crawler
4. Screaming Frog CSV import
5. DataForSEO
6. Claude provider adapter

