# Organic Growth Cycle / Action Intelligence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the continuous RankFlow operating loop: Audit -> Analyse -> Act -> Report -> Re-audit, with action tracking, organic growth metrics, evidence, and SEO expert efficiency.

**Architecture:** Extend the existing typed fixture pattern before connecting Supabase. Shared types/helpers define growth cycles, action intelligence, metric snapshots, evidence, and expert performance. Backend exposes workspace-owned collections. Frontend adds an Organic Growth Cycle route and enriches existing modules so findings convert into tracked action items.

**Tech Stack:** TypeScript, Next.js App Router, Node HTTP backend, Vitest, Playwright, Supabase/Postgres migrations.

---

## Product Definition

RankFlow should operate as a continuous organic growth system, not a one-time audit dashboard.

Core loop:

```txt
AUDIT -> ANALYSE -> ACT -> REPORT -> RE-AUDIT
```

The product must answer four business questions:

1. What did we find across SEO, Local SEO, GBP, AEO, GEO, content, technical, authority, and conversions?
2. What should we do first and why?
3. Was the action completed inside RankFlow or outside the product, and what evidence proves it?
4. Did the brand improve after the action, and how efficient was the SEO expert/team?

## File Structure

Modify:

- `packages/shared/src/rankflow-types.ts`  
  Add `OrganicGrowthMetricSnapshot`, `OrganicGrowthCycle`, `ActionItem`, `ActionEvidence`, `ExpertEfficiency`, and summary interfaces.

- `packages/shared/src/rankflow-helpers.ts`  
  Add helpers for growth deltas, action summaries, evidence quality, cycle status, and expert efficiency.

- `apps/backend/src/rankflow-data.ts`  
  Add fixture data for growth cycles, action items, metric snapshots, and expert performance.

- `apps/backend/src/repositories/rankflow-repository.ts`  
  Add repository methods for cycles, actions, metrics, and expert efficiency.

- `apps/backend/src/server.ts`  
  Add API routes for the new collections.

- `apps/frontend/src/lib/rankflow-api.ts`  
  Add fetch helpers for the new API routes.

- `apps/frontend/src/components/workspace-modules.tsx`  
  Add `OrganicGrowthCycleModule` and supporting UI blocks.

- `apps/frontend/src/components/workspace-detail.tsx`  
  Add module card and high-level growth cycle summary.

- `apps/frontend/src/components/app-shell.tsx`  
  Add sidebar navigation for `Growth Cycle`.

- `apps/frontend/src/app/workspaces/[workspaceId]/growth-cycle/page.tsx`  
  Create dedicated page for the operating loop.

- `apps/frontend/src/app/globals.css`  
  Add responsive styles for cycle timeline, metric grid, action ledger, and expert scorecards.

- `apps/frontend/tests/browser-smoke.spec.ts`  
  Add route coverage for growth cycle, action evidence, and expert efficiency.

- `supabase/migrations/202605280002_rankflow_growth_cycle_action_intelligence.sql`  
  Add future persistence tables.

Create:

- `packages/shared/src/rankflow-action-intelligence-helpers.test.ts`
- `apps/backend/tests/rankflow-action-intelligence.test.ts`

---

## Data Model

The implementation should introduce these concepts.

```ts
export type GrowthCycleStage = "Audit" | "Analyse" | "Act" | "Report" | "Re-audit";

export type OrganicMetricCategory =
  | "visibility"
  | "traffic"
  | "conversion"
  | "authority"
  | "local"
  | "aeo"
  | "geo"
  | "technical"
  | "execution";

export type ActionSource =
  | "audit"
  | "ai-suggestion"
  | "local-visibility"
  | "keyword"
  | "report"
  | "manual";

export type ActionExecutionMode = "inside-rankflow" | "outside-rankflow";

export type ActionStatus = "Backlog" | "Planned" | "In Progress" | "Evidence Review" | "Done" | "Blocked";

export interface OrganicGrowthMetricSnapshot {
  id: string;
  workspaceId: string;
  measuredAt: string;
  searchImpressions: number;
  organicClicks: number;
  organicCtr: number;
  averagePosition: number;
  keywordsTop3: number;
  keywordsTop10: number;
  rankingImproved: number;
  rankingDeclined: number;
  organicSessions: number;
  organicUsers: number;
  referralSessions: number;
  organicLeads: number;
  organicConversionRate: number;
  backlinks: number;
  referringDomains: number;
  newBacklinks: number;
  lostBacklinks: number;
  aeoVisibility: number;
  geoVisibility: number;
  localVisibility: number;
  technicalHealth: number;
}

export interface ActionEvidence {
  id: string;
  submittedAt: string;
  submittedBy: string;
  evidenceType: "url" | "screenshot" | "note" | "cms-log" | "analytics-snapshot";
  label: string;
  value: string;
  qualityScore: number;
  approvalStatus: "Pending" | "Approved" | "Rejected";
}

export interface ActionItem {
  id: string;
  workspaceId: string;
  source: ActionSource;
  sourceId: string;
  title: string;
  impactArea: OrganicMetricCategory;
  priority: Severity;
  status: ActionStatus;
  executionMode: ActionExecutionMode;
  owner: string;
  dueDate: string;
  expectedImpact: string;
  completedAt?: string;
  evidenceRequired: boolean;
  evidence: ActionEvidence[];
  impactScore: number;
  clientReportContribution: boolean;
}

export interface OrganicGrowthCycle {
  id: string;
  workspaceId: string;
  period: string;
  stage: GrowthCycleStage;
  auditId: string;
  baselineSnapshotId: string;
  latestSnapshotId: string;
  actionsCreated: number;
  actionsCompleted: number;
  actionsOverdue: number;
  reportsPublished: number;
  nextAuditDue: string;
}

export interface ExpertEfficiency {
  owner: string;
  assignedActions: number;
  completedActions: number;
  overdueActions: number;
  averageCompletionDays: number;
  evidenceApprovalRate: number;
  impactDelivered: number;
  clientReportContributions: number;
}
```

---

## Task 1: Shared Action Intelligence Types And Helpers

**Files:**
- Modify: `packages/shared/src/rankflow-types.ts`
- Modify: `packages/shared/src/rankflow-helpers.ts`
- Create: `packages/shared/src/rankflow-action-intelligence-helpers.test.ts`

- [ ] **Step 1: Write failing helper tests**

```ts
import { describe, expect, it } from "vitest";
import {
  getActionIntelligenceSummary,
  getExpertEfficiencySummary,
  getOrganicGrowthDelta
} from "./rankflow-helpers";
import type { ActionItem, ExpertEfficiency, OrganicGrowthMetricSnapshot } from "./rankflow-types";

describe("rankflow action intelligence helpers", () => {
  it("calculates organic growth deltas between repeated audits", () => {
    const baseline = metricSnapshot("base", 100000, 4200, 210, 64, 41);
    const latest = metricSnapshot("latest", 134000, 6100, 318, 72, 58);

    expect(getOrganicGrowthDelta(baseline, latest)).toEqual({
      searchImpressionsDelta: 34000,
      organicClicksDelta: 1900,
      organicLeadsDelta: 108,
      aeoVisibilityDelta: 8,
      geoVisibilityDelta: 17
    });
  });

  it("summarizes action execution and outside evidence load", () => {
    const actions: ActionItem[] = [
      action("a1", "Done", "inside-rankflow", true, 82),
      action("a2", "Evidence Review", "outside-rankflow", true, 64),
      action("a3", "Blocked", "outside-rankflow", false, 0)
    ];

    expect(getActionIntelligenceSummary(actions)).toEqual({
      total: 3,
      completed: 1,
      inProgress: 1,
      blocked: 1,
      outsideProduct: 2,
      evidencePending: 1,
      averageImpactScore: 49
    });
  });

  it("summarizes expert efficiency for team accountability", () => {
    const experts: ExpertEfficiency[] = [
      { owner: "Rohan Mehta", assignedActions: 8, completedActions: 6, overdueActions: 1, averageCompletionDays: 3, evidenceApprovalRate: 92, impactDelivered: 74, clientReportContributions: 4 },
      { owner: "Anika Rao", assignedActions: 6, completedActions: 3, overdueActions: 2, averageCompletionDays: 5, evidenceApprovalRate: 76, impactDelivered: 48, clientReportContributions: 2 }
    ];

    expect(getExpertEfficiencySummary(experts)).toEqual({
      teamAssigned: 14,
      teamCompleted: 9,
      completionRate: 64,
      overdue: 3,
      averageEvidenceApprovalRate: 84,
      impactDelivered: 122
    });
  });
});
```

- [ ] **Step 2: Run test to verify RED**

Run:

```bash
npm test -w @rankflow/shared -- rankflow-action-intelligence-helpers.test.ts
```

Expected: FAIL because the types/helpers do not exist.

- [ ] **Step 3: Add shared types and helpers**

Add the data model types from the Data Model section to `rankflow-types.ts`.

Add helper implementations to `rankflow-helpers.ts`:

```ts
export function getOrganicGrowthDelta(
  baseline: OrganicGrowthMetricSnapshot,
  latest: OrganicGrowthMetricSnapshot
) {
  return {
    searchImpressionsDelta: latest.searchImpressions - baseline.searchImpressions,
    organicClicksDelta: latest.organicClicks - baseline.organicClicks,
    organicLeadsDelta: latest.organicLeads - baseline.organicLeads,
    aeoVisibilityDelta: latest.aeoVisibility - baseline.aeoVisibility,
    geoVisibilityDelta: latest.geoVisibility - baseline.geoVisibility
  };
}

export function getActionIntelligenceSummary(actions: ActionItem[]) {
  const impactTotal = actions.reduce((sum, action) => sum + action.impactScore, 0);

  return {
    total: actions.length,
    completed: actions.filter((action) => action.status === "Done").length,
    inProgress: actions.filter((action) => action.status === "In Progress" || action.status === "Evidence Review").length,
    blocked: actions.filter((action) => action.status === "Blocked").length,
    outsideProduct: actions.filter((action) => action.executionMode === "outside-rankflow").length,
    evidencePending: actions.filter((action) =>
      action.evidenceRequired && action.evidence.some((evidence) => evidence.approvalStatus === "Pending")
    ).length,
    averageImpactScore: actions.length ? Math.round(impactTotal / actions.length) : 0
  };
}

export function getExpertEfficiencySummary(experts: ExpertEfficiency[]) {
  const teamAssigned = experts.reduce((sum, expert) => sum + expert.assignedActions, 0);
  const teamCompleted = experts.reduce((sum, expert) => sum + expert.completedActions, 0);
  const evidenceApprovalTotal = experts.reduce((sum, expert) => sum + expert.evidenceApprovalRate, 0);

  return {
    teamAssigned,
    teamCompleted,
    completionRate: teamAssigned ? Math.round((teamCompleted / teamAssigned) * 100) : 0,
    overdue: experts.reduce((sum, expert) => sum + expert.overdueActions, 0),
    averageEvidenceApprovalRate: experts.length ? Math.round(evidenceApprovalTotal / experts.length) : 0,
    impactDelivered: experts.reduce((sum, expert) => sum + expert.impactDelivered, 0)
  };
}
```

- [ ] **Step 4: Run test to verify GREEN**

Run:

```bash
npm test -w @rankflow/shared -- rankflow-action-intelligence-helpers.test.ts
```

Expected: PASS.

---

## Task 2: Fixture Data And Backend API

**Files:**
- Modify: `apps/backend/src/rankflow-data.ts`
- Modify: `apps/backend/src/repositories/rankflow-repository.ts`
- Modify: `apps/backend/src/server.ts`
- Create: `apps/backend/tests/rankflow-action-intelligence.test.ts`

- [ ] **Step 1: Write failing backend repository tests**

```ts
import { describe, expect, it } from "vitest";
import { FixtureRankFlowRepository } from "../src/repositories/rankflow-repository";

describe("rankflow action intelligence repository", () => {
  const repository = new FixtureRankFlowRepository();

  it("returns growth cycles, metric snapshots, action items, and expert efficiency", async () => {
    await expect(repository.listGrowthCycles("aurora-education")).resolves.toHaveLength(2);
    await expect(repository.listOrganicMetricSnapshots("aurora-education")).resolves.toHaveLength(2);
    await expect(repository.listActionItems("aurora-education")).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Add scholarship services to Google Business Profile",
          executionMode: "outside-rankflow",
          evidenceRequired: true
        })
      ])
    );
    await expect(repository.listExpertEfficiency("aurora-education")).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ owner: "Rohan Mehta", completedActions: expect.any(Number) })
      ])
    );
  });
});
```

- [ ] **Step 2: Run test to verify RED**

```bash
npm test -w @rankflow/backend -- rankflow-action-intelligence.test.ts
```

Expected: FAIL because repository methods do not exist.

- [ ] **Step 3: Add fixture collections**

Add workspace-owned arrays in `rankflow-data.ts`:

```ts
export const organicMetricSnapshotsByWorkspace: Record<string, OrganicGrowthMetricSnapshot[]> = {
  "aurora-education": [
    {
      id: "metrics-aurora-2026-05-01",
      workspaceId: "aurora-education",
      measuredAt: "2026-05-01",
      searchImpressions: 100000,
      organicClicks: 4200,
      organicCtr: 4.2,
      averagePosition: 18,
      keywordsTop3: 18,
      keywordsTop10: 124,
      rankingImproved: 38,
      rankingDeclined: 17,
      organicSessions: 7600,
      organicUsers: 6100,
      referralSessions: 920,
      organicLeads: 210,
      organicConversionRate: 2.8,
      backlinks: 1840,
      referringDomains: 322,
      newBacklinks: 42,
      lostBacklinks: 11,
      aeoVisibility: 64,
      geoVisibility: 41,
      localVisibility: 72,
      technicalHealth: 86
    }
  ]
};
```

Add at least:

- 2 metric snapshots for repeated audit comparison.
- 2 cycles: current and previous.
- 5 actions across audit, AEO, GEO, GBP, and manual.
- 2 experts with efficiency metrics.

- [ ] **Step 4: Add repository methods**

```ts
listGrowthCycles(workspaceId: string): Promise<OrganicGrowthCycle[]>;
listOrganicMetricSnapshots(workspaceId: string): Promise<OrganicGrowthMetricSnapshot[]>;
listActionItems(workspaceId: string): Promise<ActionItem[]>;
listExpertEfficiency(workspaceId: string): Promise<ExpertEfficiency[]>;
```

- [ ] **Step 5: Add backend routes**

Extend `apps/backend/src/server.ts` collection matching:

```txt
/api/workspaces/:id/growth-cycles
/api/workspaces/:id/organic-metrics
/api/workspaces/:id/action-items
/api/workspaces/:id/expert-efficiency
```

- [ ] **Step 6: Run backend tests**

```bash
npm test -w @rankflow/backend
```

Expected: all backend tests pass.

---

## Task 3: Supabase Migration For Continuous Organic Growth

**Files:**
- Create: `supabase/migrations/202605280002_rankflow_growth_cycle_action_intelligence.sql`

- [ ] **Step 1: Add migration**

Create tables:

```sql
create table if not exists public.organic_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  measured_at timestamptz not null,
  search_impressions integer not null default 0,
  organic_clicks integer not null default 0,
  organic_ctr numeric(6, 2) not null default 0,
  average_position numeric(6, 2) not null default 0,
  keywords_top_3 integer not null default 0,
  keywords_top_10 integer not null default 0,
  ranking_improved integer not null default 0,
  ranking_declined integer not null default 0,
  organic_sessions integer not null default 0,
  organic_users integer not null default 0,
  referral_sessions integer not null default 0,
  organic_leads integer not null default 0,
  organic_conversion_rate numeric(6, 2) not null default 0,
  backlinks integer not null default 0,
  referring_domains integer not null default 0,
  new_backlinks integer not null default 0,
  lost_backlinks integer not null default 0,
  aeo_visibility integer not null default 0,
  geo_visibility integer not null default 0,
  local_visibility integer not null default 0,
  technical_health integer not null default 0
);

create table if not exists public.action_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source text not null,
  source_id text not null,
  title text not null,
  impact_area text not null,
  priority text not null check (priority in ('critical', 'high', 'medium', 'low')),
  status text not null,
  execution_mode text not null check (execution_mode in ('inside-rankflow', 'outside-rankflow')),
  owner_name text not null,
  due_date date,
  expected_impact text not null,
  completed_at timestamptz,
  evidence_required boolean not null default true,
  impact_score integer not null default 0 check (impact_score between 0 and 100),
  client_report_contribution boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Also add:

- `action_evidence`
- `organic_growth_cycles`
- `expert_efficiency_snapshots`
- indexes on `workspace_id`, `status`, `owner_name`, `due_date`, and measured dates.

- [ ] **Step 2: Validate migration syntax by inspection**

Run:

```bash
rg -n "create table|create index|references public.workspaces" supabase/migrations/202605280002_rankflow_growth_cycle_action_intelligence.sql
```

Expected: all new tables and indexes appear.

---

## Task 4: Frontend API And Growth Cycle Page

**Files:**
- Modify: `apps/frontend/src/lib/rankflow-api.ts`
- Create: `apps/frontend/src/app/workspaces/[workspaceId]/growth-cycle/page.tsx`
- Modify: `apps/frontend/src/components/workspace-modules.tsx`

- [ ] **Step 1: Add API client methods**

```ts
export async function getWorkspaceGrowthCycles(workspaceId: string) {
  return fetchJson<OrganicGrowthCycle[]>(`/api/workspaces/${workspaceId}/growth-cycles`);
}

export async function getWorkspaceOrganicMetrics(workspaceId: string) {
  return fetchJson<OrganicGrowthMetricSnapshot[]>(`/api/workspaces/${workspaceId}/organic-metrics`);
}

export async function getWorkspaceActionItems(workspaceId: string) {
  return fetchJson<ActionItem[]>(`/api/workspaces/${workspaceId}/action-items`);
}

export async function getWorkspaceExpertEfficiency(workspaceId: string) {
  return fetchJson<ExpertEfficiency[]>(`/api/workspaces/${workspaceId}/expert-efficiency`);
}
```

- [ ] **Step 2: Add route page**

```tsx
export default async function GrowthCyclePage({ params }: GrowthCyclePageProps) {
  const { workspaceId } = await params;

  try {
    const [workspace, cycles, metrics, actions, experts] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceGrowthCycles(workspaceId),
      getWorkspaceOrganicMetrics(workspaceId),
      getWorkspaceActionItems(workspaceId),
      getWorkspaceExpertEfficiency(workspaceId)
    ]);

    return (
      <OrganicGrowthCycleModule
        workspace={workspace}
        cycles={cycles}
        metrics={metrics}
        actions={actions}
        experts={experts}
      />
    );
  } catch {
    notFound();
  }
}
```

- [ ] **Step 3: Add `OrganicGrowthCycleModule`**

The page must include:

- cycle stage strip: Audit, Analyse, Act, Report, Re-audit
- executive growth metric cards:
  - search impressions
  - ranking improvement
  - organic traffic
  - referral traffic
  - backlinks/referring domains
  - organic leads
  - AEO visibility
  - GEO visibility
- action ledger:
  - source
  - owner
  - inside/outside RankFlow
  - evidence status
  - due date
  - impact area
- expert efficiency scorecards:
  - assigned
  - completed
  - overdue
  - evidence approval rate
  - impact delivered
  - client/report contribution

---

## Task 5: Navigation, Workspace Context, And Styling

**Files:**
- Modify: `apps/frontend/src/components/app-shell.tsx`
- Modify: `apps/frontend/src/components/workspace-detail.tsx`
- Modify: `apps/frontend/src/app/globals.css`

- [ ] **Step 1: Add module enum**

Add `"growth-cycle"` to `RankFlowModule`, `visibleModules`, and workspace access module lists.

- [ ] **Step 2: Add sidebar item**

Add `Growth Cycle` with a suitable Lucide icon such as `RefreshCcwDot` or `Activity`.

- [ ] **Step 3: Add workspace module card**

Add card copy:

```txt
Growth Cycle
Audit, analyse, act, report, and re-audit progress
```

- [ ] **Step 4: Add CSS**

Add responsive layout classes:

```css
.cycle-stage-grid {}
.growth-metric-grid {}
.action-ledger {}
.expert-grid {}
.evidence-chip {}
```

Keep the interface dense, restrained, and enterprise SaaS-oriented.

---

## Task 6: Browser Smoke Coverage

**Files:**
- Modify: `apps/frontend/tests/browser-smoke.spec.ts`

- [ ] **Step 1: Add e2e test**

```ts
test("growth cycle route renders audit analyse act report loop", async ({ page }) => {
  await page.goto("/workspaces/aurora-education/growth-cycle");
  await expect(page.getByRole("heading", { name: /Aurora Education Group organic growth cycle/i })).toBeVisible();
  await expect(page.getByText("Audit", { exact: true })).toBeVisible();
  await expect(page.getByText("Analyse", { exact: true })).toBeVisible();
  await expect(page.getByText("Act", { exact: true })).toBeVisible();
  await expect(page.getByText("Report", { exact: true })).toBeVisible();
  await expect(page.getByText("Re-audit", { exact: true })).toBeVisible();
  await expect(page.getByText("Organic Leads")).toBeVisible();
  await expect(page.getByText("Add scholarship services to Google Business Profile")).toBeVisible();
  await expect(page.getByText("SEO Expert Efficiency")).toBeVisible();
});
```

- [ ] **Step 2: Run e2e**

```bash
npm run test:e2e
```

Expected: all smoke tests pass.

---

## Task 7: Final Verification

Run the full verification sequence:

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
- backend and shared tests pass
- build includes `/workspaces/[workspaceId]/growth-cycle`
- Playwright passes all smoke tests

If browser QA is available:

```bash
browse goto http://127.0.0.1:3000/workspaces/aurora-education/growth-cycle
browse snapshot
browse viewport 390x844
browse snapshot
```

Expected:

- no text overlap
- action ledger readable on mobile
- stage strip wraps cleanly
- expert cards remain scan-friendly

---

## Implementation Order

1. Shared types/helpers/tests.
2. Backend fixture data/repository/API/tests.
3. Supabase migration.
4. Frontend API/page/component.
5. Navigation and styling.
6. Playwright coverage.
7. Full verification.

This order keeps the product loop testable at each layer and avoids building UI around untyped data.

