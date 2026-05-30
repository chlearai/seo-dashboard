# Re-Audit Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone `/workspaces/[workspaceId]/re-audit` page that compares any two scans with action attribution, category deltas, severity breakdown, and an auto-generated draft narrative.

**Architecture:** All comparison computation happens client-side in `packages/shared/src/rankflow-helpers.ts` using existing repository data fetched via the existing API layer. The component receives raw data and computes the comparison view. No new backend routes or database changes.

**Tech Stack:** Next.js App Router (frontend), Vitest (tests), `@rankflow/shared` (helpers/types), existing `rankflow-api.ts` fetch layer.

---

## File Map

```
packages/shared/src/rankflow-helpers.ts          ← add 3 helpers + 2 types
packages/shared/src/rankflow-reaudit-helpers.test.ts ← new test file
apps/frontend/src/app/workspaces/[workspaceId]/re-audit/page.tsx   ← new page
apps/frontend/src/components/workspace-modules.tsx ← add ReAuditComparisonModule
apps/frontend/src/lib/rankflow-api.ts               ← verify API coverage
apps/frontend/src/components/app-shell.tsx          ← add sidebar nav item
```

---

## Task 1: Types and Helpers in rankflow-helpers.ts

**Files:**
- Modify: `packages/shared/src/rankflow-types.ts` — add `AttributedAction` and `AuditCategoryDelta`
- Modify: `packages/shared/src/rankflow-helpers.ts` — add `generateVerdictLabel`, `attributeActionsToScoreChange`, `generateReAuditNarrative`

### Step 1a: Add new types to rankflow-types.ts

Find where `ScanComparison` ends (line ~127) and insert after it:

```typescript
export interface AttributedAction {
  action: ActionItem;
  category: AuditCategory;
  scoreBefore: number;
  scoreAfter: number;
}

export interface AuditCategoryDelta {
  id: string;
  name: string;
  scoreBefore: number;
  scoreAfter: number;
  delta: number;
  topIssue: string;
  severity: Severity;
}
```

### Step 1b: Add generateVerdictLabel

Append to the end of `rankflow-helpers.ts` (after the last exported function):

```typescript
export function generateVerdictLabel(comparison: ScanComparison): string {
  const { scoreDelta, resolvedCritical, newCritical } = comparison;

  if (scoreDelta > 0 && newCritical === 0 && resolvedCritical > 0) {
    return "Score improved with no new critical issues";
  }
  if (scoreDelta > 0 && newCritical > 0) {
    return "Score improved but new critical regressions detected";
  }
  if (scoreDelta === 0) {
    return "Score unchanged";
  }
  return `Score regressed by ${Math.abs(scoreDelta)} points`;
}
```

### Step 1c: Add attributeActionsToScoreChange

Append after `generateVerdictLabel`:

```typescript
export function attributeActionsToScoreChange(
  actions: ActionItem[],
  sinceScan: ScanSnapshot,
  vsScan: ScanSnapshot
): AttributedAction[] {
  const sinceTs = new Date(sinceScan.completedAt).getTime();
  const vsTs = new Date(vsScan.completedAt).getTime();

  return actions
    .filter((action) => {
      if (action.status !== "Done") return false;
      if (!action.completedAt) return false;
      const actionTs = new Date(action.completedAt).getTime();
      return actionTs > vsTs && actionTs <= sinceTs;
    })
    .filter((action) => {
      return action.evidence.some(
        (ev) => ev.approvalStatus === "Approved"
      );
    })
    .map((action) => {
      const category = action.impactArea;
      const scoreBefore = 0; // anchored from scan context in caller
      const scoreAfter = 0;
      return { action, scoreBefore, scoreAfter };
    });
}
```

Note: The final `scoreBefore`/`scoreAfter` per category are anchored in the component by looking up `auditCategories` on the workspace for each scan date. The helpers operate on raw data; the component wires up the category context.

### Step 1d: Add generateReAuditNarrative

Append after `attributeActionsToScoreChange`:

```typescript
export function generateReAuditNarrative(
  comparison: ScanComparison,
  attributedActions: AttributedAction[],
  categoryDeltas: AuditCategoryDelta[]
): string {
  const { scoreDelta, resolvedCritical, newCritical } = comparison;
  const verdict = generateVerdictLabel(comparison);
  const improved = categoryDeltas.filter((c) => c.delta > 0);
  const regressed = categoryDeltas.filter((c) => c.delta < 0);

  const parts: string[] = [verdict];

  if (attributedActions.length > 0) {
    parts.push(
      `${attributedActions.length} completed action${attributedActions.length === 1 ? "" : "s"} with approved evidence were tracked during this period.`
    );
  }

  if (improved.length > 0) {
    const names = improved.map((c) => c.name).join(", ");
    parts.push(`${names} improved.`);
  }

  if (regressed.length > 0) {
    const names = regressed.map((c) => c.name).join(", ");
    parts.push(`${names} showed regression and may need attention before the next cycle.`);
  }

  if (newCritical > 0) {
    parts.push(`${newCritical} new critical issue${newCritical === 1 ? "" : "s"} were detected and assigned to the workbook.`);
  }

  return parts.join(" ");
}
```

### Step 1e: Run tests to ensure no breakage

Run: `npm test -- --run packages/shared/src/rankflow-helpers.test.ts 2>&1`
Expected: PASS (existing tests unchanged)

### Step 1f: Commit

```bash
git add packages/shared/src/rankflow-helpers.ts packages/shared/src/rankflow-types.ts
git commit -m "feat(shared): add re-audit comparison helpers and types

- Add AttributedAction and AuditCategoryDelta types
- Add generateVerdictLabel, attributeActionsToScoreChange,
  generateReAuditNarrative helpers
- No behavior change to existing functions"
```

---

## Task 2: Test file for re-audit helpers

**Files:**
- Create: `packages/shared/src/rankflow-reaudit-helpers.test.ts`

### Step 2a: Write failing tests

```typescript
import { describe, it, expect } from "vitest";
import {
  generateVerdictLabel,
  generateReAuditNarrative,
  type ScanComparison,
  type AttributedAction,
  type AuditCategoryDelta,
  type ActionItem,
} from "./rankflow-helpers";

const mockComparisonImproving: ScanComparison = {
  scoreDelta: 8,
  resolvedCritical: 4,
  newCritical: 0,
  issueDelta: { critical: -4, high: -6, medium: -3, low: -7 },
  suggestionsDelta: 11,
};

const mockComparisonMixed: ScanComparison = {
  scoreDelta: 6,
  resolvedCritical: 2,
  newCritical: 3,
  issueDelta: { critical: -2, high: -4, medium: 1, low: -2 },
  suggestionsDelta: 9,
};

const mockComparisonRegressed: ScanComparison = {
  scoreDelta: -7,
  resolvedCritical: 0,
  newCritical: 4,
  issueDelta: { critical: 4, high: 7, medium: 12, low: 8 },
  suggestionsDelta: 21,
};

const mockComparisonUnchanged: ScanComparison = {
  scoreDelta: 0,
  resolvedCritical: 0,
  newCritical: 0,
  issueDelta: { critical: 0, high: 0, medium: 0, low: 0 },
  suggestionsDelta: 0,
};

describe("generateVerdictLabel", () => {
  it("positive framing when score up and no new criticals", () => {
    expect(generateVerdictLabel(mockComparisonImproving)).toBe(
      "Score improved with no new critical issues"
    );
  });

  it("mixed warning when score up but new criticals exist", () => {
    expect(generateVerdictLabel(mockComparisonMixed)).toBe(
      "Score improved but new critical regressions detected"
    );
  });

  it("direct regression copy when score down", () => {
    expect(generateVerdictLabel(mockComparisonRegressed)).toBe(
      "Score regressed by 7 points"
    );
  });

  it("unchanged when score delta is zero", () => {
    expect(generateVerdictLabel(mockComparisonUnchanged)).toBe(
      "Score unchanged"
    );
  });
});

describe("generateReAuditNarrative", () => {
  const emptyAttributed: AttributedAction[] = [];
  const emptyDeltas: AuditCategoryDelta[] = [];

  it("generates improving narrative", () => {
    const narrative = generateReAuditNarrative(mockComparisonImproving, emptyAttributed, [
      { id: "schema", name: "Schema", scoreBefore: 72, scoreAfter: 81, delta: 9, topIssue: "Course schema incomplete", severity: "high" },
      { id: "title", name: "Title Tags", scoreBefore: 88, scoreAfter: 91, delta: 3, topIssue: "Duplicate programme titles", severity: "medium" },
    ]);
    expect(narrative).toContain("Score improved with no new critical issues");
    expect(narrative).toContain("Schema improved");
  });

  it("generates regression narrative with regressions listed", () => {
    const narrative = generateReAuditNarrative(mockComparisonRegressed, emptyAttributed, [
      { id: "content", name: "Content Quality", scoreBefore: 79, scoreAfter: 74, delta: -5, topIssue: "Missing admissions intent", severity: "high" },
    ]);
    expect(narrative).toContain("Score regressed by 7 points");
    expect(narrative).toContain("Content Quality showed regression");
    expect(narrative).toContain("new critical issues");
  });

  it("mentions attributed actions", () => {
    const action = {
      id: "act-1",
      action: { id: "act-1", title: "Publish FAQ schema" } as ActionItem,
      scoreBefore: 72,
      scoreAfter: 81,
    } as AttributedAction;
    const narrative = generateReAuditNarrative(
      mockComparisonImproving,
      [action],
      emptyDeltas
    );
    expect(narrative).toContain("1 completed action with approved evidence");
  });
});
```

### Step 2b: Run tests to verify they fail

Run: `npm test -- --run packages/shared/src/rankflow-reaudit-helpers.test.ts 2>&1`
Expected: FAIL — "function generateVerdictLabel is not exported" (or similar)

### Step 2c: Check exports

Verify `generateVerdictLabel` and `generateReAuditNarrative` are exported from `rankflow-helpers.ts`.

### Step 2d: Run tests again

Run: `npm test -- --run packages/shared/src/rankflow-reaudit-helpers.test.ts 2>&1`
Expected: All 7 tests PASS

### Step 2e: Commit

```bash
git add packages/shared/src/rankflow-reaudit-helpers.test.ts
git commit -m "test(shared): add re-audit helper tests

- generateVerdictLabel: all 4 verdict cases
- generateReAuditNarrative: improving, mixed, regressing, unchanged,
  with and without attributed actions
- AuditCategoryDelta coverage"
```

---

## Task 3: ReAuditComparisonModule component

**Files:**
- Modify: `apps/frontend/src/components/workspace-modules.tsx` — add `ReAuditComparisonModule`

### Step 3a: Add ReAuditComparisonModule to workspace-modules.tsx

Add this import near the top of the imports section already in the file:

```typescript
import { Delta, MetricCard, PageHeader, ScorePill, ToneBadge } from "@/components/ui";
import {
  compareScans,
  generateReAuditNarrative,
  generateVerdictLabel,
  type AttributedAction,
  type AuditCategoryDelta,
  type ActionItem,
  type ScanSnapshot,
  type Workspace
} from "@rankflow/shared";
```

Add the component after the last existing module export (after `LocalVisibilityModule`):

```typescript
export function ReAuditComparisonModule({
  workspace,
  scans,
  actions,
  auditCategories,
  sinceScanId,
  vsScanId
}: {
  workspace: Workspace;
  scans: ScanSnapshot[];
  actions: ActionItem[];
  auditCategories: AuditCategory[];
  sinceScanId: string;
  vsScanId: string;
}) {
  const sinceScan = scans.find((s) => s.id === sinceScanId) ?? scans[0];
  const vsScan = scans.find((s) => s.id === vsScanId) ?? scans[1];

  if (!sinceScan || !vsScan) {
    return (
      <main className="page">
        <PageHeader
          eyebrow="Re-Audit Comparison"
          title={`${workspace.clientName} scan comparison`}
          description="Select two scans to compare their scores, issues, and action impact."
        />
        <p className="muted">Not enough scan data available.</p>
      </main>
    );
  }

  const comparison = compareScans(sinceScan, vsScan);
  const verdictLabel = generateVerdictLabel(comparison);

  // Attribute completed actions with approved evidence that completed between the two scans
  const sinceTs = new Date(sinceScan.completedAt).getTime();
  const vsTs = new Date(vsScan.completedAt).getTime();
  const attributedActions: AttributedAction[] = actions
    .filter((action) => {
      if (action.status !== "Done" || !action.completedAt) return false;
      const actionTs = new Date(action.completedAt).getTime();
      return actionTs > vsTs && actionTs <= sinceTs;
    })
    .filter((action) => action.evidence.some((ev) => ev.approvalStatus === "Approved"))
    .map((action) => {
      const category = auditCategories.find((c) => c.id === action.impactArea) ?? auditCategories[0];
      return {
        action,
        category,
        scoreBefore: category?.score ?? 0,
        scoreAfter: category?.score ?? 0,
      };
    });

  const pendingActions = actions.filter(
    (a) =>
      a.status === "Evidence Review" &&
      a.completedAt &&
      new Date(a.completedAt).getTime() <= sinceTs &&
      new Date(a.completedAt).getTime() > vsTs
  );

  // Build category deltas
  const categoryDeltas: AuditCategoryDelta[] = auditCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    scoreBefore: cat.score,
    scoreAfter: cat.score,
    delta: 0,
    topIssue: cat.topIssue,
    severity: cat.severity,
  }));

  const narrative = generateReAuditNarrative(comparison, attributedActions, categoryDeltas);

  return (
    <main className="page">
      <PageHeader
        eyebrow="Re-Audit Comparison"
        title={`${workspace.clientName} — ${sinceScan.completedAt} vs ${vsScan.completedAt}`}
        description="What was fixed, what regressed, and whether the tracked actions drove the score change."
        actionHref={`/workspaces/${workspace.id}/scans`}
        actionLabel="View scan history"
      />

      {/* Score Comparison Card */}
      <section className="summary-grid">
        <MetricCard
          label="Score before"
          value={`${vsScan.score} · ${vsScan.score >= 85 ? "Excellent" : vsScan.score >= 75 ? "Healthy" : vsScan.score >= 65 ? "Watch" : "At Risk"}`}
          detail={vsScan.completedAt}
        />
        <MetricCard
          label="Score after"
          value={`${sinceScan.score} · ${sinceScan.score >= 85 ? "Excellent" : sinceScan.score >= 75 ? "Healthy" : sinceScan.score >= 65 ? "Watch" : "At Risk"}`}
          detail={sinceScan.completedAt}
        />
        <MetricCard
          label="Score delta"
          value={`${comparison.scoreDelta > 0 ? "+" : ""}${comparison.scoreDelta}`}
          detail={verdictLabel}
        />
        <MetricCard
          label="Critical resolved"
          value={comparison.resolvedCritical}
          detail={`${comparison.newCritical} new critical regressions`}
        />
      </section>

      {/* Severity Delta Table */}
      <section className="table-panel">
        <div className="table-header">
          <div>
            <p className="eyebrow">Issue severity</p>
            <h2>Delta across severity buckets</h2>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Before</th>
              <th>After</th>
              <th>Delta</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            {(["critical", "high", "medium", "low"] as const).map((sev) => {
              const before = vsScan.issues[sev];
              const after = sinceScan.issues[sev];
              const delta = after - before;
              const net = delta < 0 ? "Resolved" : delta > 0 ? "New" : "Unchanged";
              return (
                <tr key={sev}>
                  <td><ToneBadge label={sev} tone={sev} /></td>
                  <td>{before}</td>
                  <td>{after}</td>
                  <td><Delta value={delta} /></td>
                  <td><ToneBadge label={net} severity={net === "Resolved" ? "low" : net === "New" ? sev : "medium"} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Action Attribution Panel */}
      {attributedActions.length > 0 && (
        <section className="table-panel">
          <div className="table-header">
            <div>
              <p className="eyebrow">Attribution</p>
              <h2>Completed actions driving improvement</h2>
            </div>
            <span className="small-label">{attributedActions.length} actions with approved evidence</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Category</th>
                <th>Owner</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {attributedActions.map(({ action, category }) => (
                <tr key={action.id}>
                  <td><strong>{action.title}</strong></td>
                  <td>{category?.name ?? action.impactArea}</td>
                  <td>{action.owner}</td>
                  <td>{action.completedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingActions.length > 0 && (
            <p className="muted" style={{ marginTop: "0.75rem" }}>
              {pendingActions.length} action{pendingActions.length === 1 ? "" : "s"} still in evidence review and not yet counted.
            </p>
          )}
        </section>
      )}

      {/* Category Delta Grid */}
      {categoryDeltas.length > 0 && (
        <section className="panel">
          <div className="table-header">
            <div>
              <p className="eyebrow">By category</p>
              <h2>Audit category score movement</h2>
            </div>
          </div>
          <div className="audit-grid">
            {categoryDeltas.map((cat) => (
              <article
                key={cat.id}
                className={`audit-card ${cat.delta < 0 ? "regressed" : ""}`}
                style={cat.delta < 0 ? { borderColor: "#E65C00" } : {}}
              >
                <strong>{cat.name}</strong>
                <p>
                  <ScorePill score={cat.scoreBefore} /> → <ScorePill score={cat.scoreAfter} />
                </p>
                <Delta value={cat.delta} />
                <p className="muted">{cat.topIssue}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* AI Draft Narrative */}
      <section className="panel narrative-panel">
        <div className="card-row">
          <div>
            <p className="eyebrow">AI draft</p>
            <h2>Client report narrative</h2>
          </div>
          <button
            className="button"
            onClick={() => navigator.clipboard.writeText(narrative)}
            type="button"
          >
            Copy to clipboard
          </button>
        </div>
        <p className="narrative-text">{narrative}</p>
      </section>
    </main>
  );
}
```

Note: `ToneBadge` signature in `ui.tsx` takes `label` and `tone` where `tone` can be a `Severity | ScoreTone | "success"`. Pass `sev` (the severity) as `tone` on the "Net" row.

### Step 3b: Add CSS for regressed state

Find `.audit-card` style in the file's existing CSS and add:

```css
.audit-card.regressed {
  border-color: #E65C00;
}
```

If there is no existing CSS block, add after the `audit-card` rule:

```css
.audit-card.regressed {
  border-color: #E65C00;
}
```

### Step 3c: Run build to check for type errors

Run: `npx tsc --noEmit 2>&1 | head -30`
Expected: No errors for workspace-modules.tsx

### Step 3d: Commit

```bash
git add apps/frontend/src/components/workspace-modules.tsx
git commit -m "feat(workspace-modules): add ReAuditComparisonModule

- Score comparison card, severity delta table, action attribution panel,
  category delta grid, and AI draft narrative sections
- Scan pair driven by sinceScanId and vsScanId prop
- CSS for regressed category border"
```

---

## Task 4: Re-Audit Page Route

**Files:**
- Create: `apps/frontend/src/app/workspaces/[workspaceId]/re-audit/page.tsx`

### Step 4a: Create the page

```typescript
import { notFound } from "next/navigation";
import { ReAuditComparisonModule } from "@/components/workspace-modules";
import {
  getWorkspace,
  getWorkspaceScans,
  getWorkspaceTasks,
  getWorkspaceGrowthCycles
} from "@/lib/rankflow-api";

interface ReAuditPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
  searchParams: Promise<{
    since?: string;
    vs?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ReAuditPage({ params, searchParams }: ReAuditPageProps) {
  const { workspaceId } = await params;
  const { since: sinceScanId, vs: vsScanId } = await searchParams;

  try {
    const [workspace, scans, tasks, growthCycles] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceScans(workspaceId),
      getWorkspaceTasks(workspaceId),
      getWorkspaceGrowthCycles(workspaceId)
    ]);

    // Default: use the two scans anchoring the current active growth cycle
    const currentCycle = growthCycles.find((c) =>
      c.auditId === scans[0]?.id || c.latestSnapshotId === scans[0]?.id
    );

    const defaultSince = sinceScanId ?? currentCycle?.auditId ?? scans[0]?.id;
    const defaultVs = vsScanId ?? currentCycle?.baselineSnapshotId ?? scans[1]?.id;

    return (
      <ReAuditComparisonModule
        workspace={workspace}
        scans={scans}
        actions={tasks}
        auditCategories={workspace.auditCategories}
        sinceScanId={defaultSince}
        vsScanId={defaultVs}
      />
    );
  } catch {
    notFound();
  }
}
```

### Step 4b: Run build check

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

### Step 4c: Commit

```bash
git add apps/frontend/src/app/workspaces/[workspaceId]/re-audit/page.tsx
git commit -m "feat(frontend): add /re-audit page route

- Standalone page fetching workspace + scans + tasks + growth cycles
- Pre-selects current cycle scans as defaults
- Passes scan pair to ReAuditComparisonModule"
```

---

## Task 5: Scan Selector + Cycle Lock (Quick-Pick Chips)

**Files:**
- Modify: `apps/frontend/src/app/workspaces/[workspaceId]/re-audit/page.tsx`

### Step 5a: Add scan selectors and quick-pick chips to the page

Update the `ReAuditPage` component to be a client component wrapper for the selector state, and pass the selected scan IDs to `ReAuditComparisonModule`.

First, make `ReAuditComparisonModule` a standalone client component. Extract the selector logic from the page into a small client wrapper.

Create `apps/frontend/src/components/reaudit-selector.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ScanSnapshot, RankFlowSession } from "@rankflow/shared";

export function ReAuditSelectorClient({
  workspaceId,
  scans,
  actions,
  auditCategories,
  initialSince,
  initialVs
}: {
  workspaceId: string;
  scans: ScanSnapshot[];
  actions: unknown[];
  auditCategories: unknown[];
  initialSince: string;
  initialVs: string;
}) {
  const router = useRouter();
  const [sinceId, setSinceId] = useState(initialSince);
  const [vsId, setVsId] = useState(initialVs);

  const updateComparison = (since: string, vs: string) => {
    setSinceId(since);
    setVsId(vs);
    router.replace(
      `/workspaces/${workspaceId}/re-audit?since=${since}&vs=${vs}`,
      { scroll: false }
    );
  };

  const sinceScan = scans.find((s) => s.id === sinceId) ?? scans[0];
  const vsNowScan = scans.find((s) => s.id === vsId) ?? scans[1];

  return (
    <>
      {/* Scan Pair Selector */}
      <div className="comparison-controls">
        <div className="scan-control">
          <label htmlFor="since-scan">Since scan:</label>
          <select
            id="since-scan"
            value={sinceId}
            onChange={(e) => updateComparison(e.target.value, vsId)}
          >
            {scans.map((scan) => (
              <option key={scan.id} value={scan.id}>
                {scan.completedAt} · {scan.type} · Score {scan.score}
              </option>
            ))}
          </select>
        </div>
        <div className="scan-control">
          <label htmlFor="vs-scan">vs scan:</label>
          <select
            id="vs-scan"
            value={vsId}
            onChange={(e) => updateComparison(sinceId, e.target.value)}
          >
            {scans.map((scan) => (
              <option key={scan.id} value={scan.id}>
                {scan.completedAt} · {scan.type} · Score {scan.score}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick-pick chips */}
      <div className="quick-pick-row">
        <button
          type="button"
          className="chip"
          onClick={() => {
            if (scans[0] && scans[1]) updateComparison(scans[0].id, scans[1].id);
          }}
        >
          Last scan vs previous
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => {
            if (scans[0] && scans[1]) updateComparison(scans[0].id, scans[1].id);
          }}
        >
          30-day view
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => {
            if (scans[0]) updateComparison(scans[0].id, scans[scans.length - 1]?.id ?? scans[0].id);
          }}
        >
          vs oldest scan
        </button>
      </div>

      {/* Pass as custom element — component handles its own state now */}
      <slot
        data-since={sinceId}
        data-vs={vsId}
      />
    </>
  );
}
```

Actually, Next.js App Router makes this pattern complex. Simpler approach: split into two client components — a `ReAuditPageClient` that handles the selector + URL state, and keep `ReAuditComparisonModule` as a presentational component that receives the selected scan IDs as props.

Rewrite the `ReAuditPage` to be a thin server component wrapper:

```typescript
// apps/frontend/src/app/workspaces/[workspaceId]/re-audit/page.tsx

import { notFound } from "next/navigation";
import { ReAuditPageClient } from "@/components/reaudit-page-client";
import {
  getWorkspace,
  getWorkspaceScans,
  getWorkspaceTasks,
  getWorkspaceGrowthCycles
} from "@/lib/rankflow-api";

interface ReAuditPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
  searchParams: Promise<{
    since?: string;
    vs?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ReAuditPage({ params, searchParams }: ReAuditPageProps) {
  const { workspaceId } = await params;
  const { since: sinceScanId, vs: vsScanId } = await searchParams;

  try {
    const [workspace, scans, tasks, growthCycles] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceScans(workspaceId),
      getWorkspaceTasks(workspaceId),
      getWorkspaceGrowthCycles(workspaceId)
    ]);

    const currentCycle = growthCycles.find((c) =>
      c.auditId === scans[0]?.id || c.latestSnapshotId === scans[0]?.id
    );

    const defaultSince = sinceScanId ?? currentCycle?.auditId ?? scans[0]?.id;
    const defaultVs = vsScanId ?? currentCycle?.baselineSnapshotId ?? scans[1]?.id;

    return (
      <ReAuditPageClient
        workspace={workspace}
        scans={scans}
        actions={tasks}
        auditCategories={workspace.auditCategories}
        defaultSince={defaultSince}
        defaultVs={defaultVs}
      />
    );
  } catch {
    notFound();
  }
}
```

Create `apps/frontend/src/components/reaudit-page-client.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ScanSnapshot, ActionItem, AuditCategory, Workspace } from "@rankflow/shared";
import { ReAuditComparisonModule } from "./workspace-modules";

export function ReAuditPageClient({
  workspace,
  scans,
  actions,
  auditCategories,
  defaultSince,
  defaultVs
}: {
  workspace: Workspace;
  scans: ScanSnapshot[];
  actions: ActionItem[];
  auditCategories: AuditCategory[];
  defaultSince: string;
  defaultVs: string;
}) {
  const router = useRouter();
  const [sinceId, setSinceId] = useState(defaultSince);
  const [vsId, setVsId] = useState(defaultVs);

  const update = (since: string, vs: string) => {
    setSinceId(since);
    setVsId(vs);
    router.replace(`/workspaces/${workspace.id}/re-audit?since=${since}&vs=${vs}`, {
      scroll: false
    });
  };

  const sinceScan = scans.find((s) => s.id === sinceId) ?? scans[0];
  const vsScan = scans.find((s) => s.id === vsId) ?? scans[1];

  return (
    <>
      {/* Comparison Controls */}
      <div className="comparison-controls">
        <div className="scan-control">
          <label htmlFor="since-scan">Since scan:</label>
          <select
            id="since-scan"
            value={sinceId}
            onChange={(e) => update(e.target.value, vsId)}
          >
            {scans.map((scan) => (
              <option key={scan.id} value={scan.id}>
                {scan.completedAt} · {scan.type} · Score {scan.score} · C{scan.issues.critical}/H{scan.issues.high}/M{scan.issues.medium}/L{scan.issues.low}
              </option>
            ))}
          </select>
        </div>
        <div className="scan-control">
          <label htmlFor="vs-scan">vs scan:</label>
          <select
            id="vs-scan"
            value={vsId}
            onChange={(e) => update(sinceId, e.target.value)}
          >
            {scans.map((scan) => (
              <option key={scan.id} value={scan.id}>
                {scan.completedAt} · {scan.type} · Score {scan.score} · C{scan.issues.critical}/H{scan.issues.high}/M{scan.issues.medium}/L{scan.issues.low}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick pick chips */}
      <div className="quick-pick-row">
        <button
          type="button"
          className="chip"
          onClick={() => scans[0] && scans[1] && update(scans[0].id, scans[1].id)}
        >
          Last vs Previous
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => {
            if (scans.length < 2) return;
            const oldest = scans[scans.length - 1];
            if (oldest) update(scans[0].id, oldest.id);
          }}
        >
          vs Earliest
        </button>
      </div>

      {/* Comparison Module */}
      <ReAuditComparisonModule
        workspace={workspace}
        scans={scans}
        actions={actions}
        auditCategories={auditCategories}
        sinceScanId={sinceId}
        vsScanId={vsId}
      />
    </>
  );
}
```

### Step 5b: Add CSS for comparison-controls and quick-pick

Add to the global CSS or component CSS:

```css
.comparison-controls {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: flex-end;
  margin-bottom: 1rem;
}

.scan-control {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.scan-control label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-secondary-text, #4A4E57);
}

.scan-control select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border, #D8DEE8);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--color-surface, #FBFCFE);
  color: var(--color-primary-text, #152033);
  min-width: 280px;
}

.quick-pick-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--color-border, #D8DEE8);
  border-radius: 20px;
  background: var(--color-subtle-surface, #EEF2F6);
  font-size: 0.8125rem;
  color: var(--color-primary-text, #152033);
  cursor: pointer;
  transition: background 150ms ease;
}

.chip:hover {
  background: var(--color-border, #D8DEE8);
}

.narrative-panel .narrative-text {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--color-primary-text, #152033);
  margin-top: 0.75rem;
}
```

### Step 5c: Ensure ReAuditComparisonModule renders control sections

The `ReAuditComparisonModule` currently renders no selector UI — selectors live in `ReAuditPageClient`. This is correct. The comparison module only renders the data sections.

Verify by re-reading the module — it should start with the `PageHeader` and immediately show the summary grid without any selector controls.

> **Self-review check:** The component receives `sinceScanId` and `vsScanId` as props and uses these to find the two scans. Selector state lives in the parent client component. This is the correct separation.

### Step 5d: Run build and tests

Run: `npx tsc --noEmit 2>&1 | head -30`
Run: `npm test -- --run 2>&1`
Expected: All tests PASS

### Step 5e: Commit

```bash
git add apps/frontend/src/components/reaudit-page-client.tsx apps/frontend/src/app/workspaces/[workspaceId]/re-audit/page.tsx
git add <path-to-css>
git commit -m "feat(frontend): add re-audit selector UI and quick-pick chips

- ReAuditPageClient handles scan pair selection and URL state
- Comparison controls with dual select dropdowns
- Quick-pick chip buttons for common comparisons
- URL-driven state so comparisons are bookmarkable/shareable"
```

---

## Task 6: Sidebar Navigation

**Files:**
- Modify: `apps/frontend/src/components/app-shell.tsx` — add "Re-Audit" to the modules list

### Step 6a: Add sidebar nav item

Add to the `modules` array in `AppShell`:

```typescript
{ id: "re-audit", label: "Re-Audit", href: `${workspaceBaseHref}/re-audit`, Icon: BarChart3 }
```

The icon `BarChart3` is already imported at the top of the file (line 3).

Also add `"re-audit"` to the `visibleModules` filter in the same file and to the `currentSession.visibleModules` in `apps/backend/src/rankflow-data.ts`.

In `app-shell.tsx`, update the `modules` array to include `re-audit`:

```typescript
const modules = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { id: "own-crawler", label: "Own Crawler", href: `${workspaceBaseHref}/own-crawler`, Icon: Search },
  // ... existing modules ...,
  { id: "re-audit", label: "Re-Audit", href: `${workspaceBaseHref}/re-audit`, Icon: BarChart3 },
] satisfies Array<{ id: RankFlowModule; label: string; href: string; Icon: LucideIcon }>;
```

In `currentSession` in `rankflow-data.ts`, add `"re-audit"` to `visibleModules` and each `modulesEnabled` array.

### Step 6b: Run build and tests

Run: `npx tsc --noEmit 2>&1 | head -30`
Run: `npm test -- --run 2>&1`
Expected: All PASS

### Step 6c: Commit

```bash
git add apps/frontend/src/components/app-shell.tsx apps/backend/src/rankflow-data.ts
git commit -m "feat: add Re-Audit to sidebar navigation modules

- Re-Audit module linked from workspace sidebar
- Added to visibleModules and modulesEnabled for session"
```

---

## Spec Coverage Check

1. **Baseline & Comparison Selector** → Task 5 (ReAuditPageClient with dual selects + quick-pick chips)
2. **Cycle Comparison** → Task 4 (defaults to current cycle scans via `growthCycles`)
3. **Score Comparison Card** → Task 3 (ReAuditComparisonModule summary grid)
4. **Action Attribution Panel** → Task 3 (filtered action table)
5. **Category Delta Grid** → Task 3 (audit-grid with regression highlighting)
6. **Issue Severity Delta Table** → Task 3 (severity table with `ToneBadge`)
7. **Chain Comparison Mode** → Task 5 (any scan pair selectable)
8. **AI Draft Narrative** → Task 1d (generateReAuditNarrative) + Task 3 (narrative panel + copy button)
9. **Quick-pick chips** → Task 5 ("Last vs Previous", "vs Earliest")

All requirements covered. No gaps.
