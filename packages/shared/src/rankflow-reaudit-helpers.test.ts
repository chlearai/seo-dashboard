import { describe, it, expect } from "vitest";
import {
  generateVerdictLabel,
  generateReAuditNarrative,
  attributeActionsToScoreChange,
} from "./rankflow-helpers";
import type {
  ActionItem,
  AttributedAction,
  AuditCategoryDelta,
  ScanComparison,
  ScanSnapshot,
} from "./rankflow-types";

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

const mockSinceScan: ScanSnapshot = {
  id: "scan-new",
  type: "Full Site Crawl" as const,
  completedAt: "2026-05-20",
  status: "Completed" as const,
  pagesCrawled: 1000,
  keywordsChecked: 500,
  score: 81,
  delta: 9,
  issues: { critical: 2, high: 9, medium: 22, low: 44 },
  suggestionsGenerated: 55,
};

const mockVsScan: ScanSnapshot = {
  id: "scan-old",
  type: "Full Site Crawl" as const,
  completedAt: "2026-05-01",
  status: "Completed" as const,
  pagesCrawled: 900,
  keywordsChecked: 450,
  score: 72,
  delta: -3,
  issues: { critical: 6, high: 15, medium: 25, low: 51 },
  suggestionsGenerated: 44,
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
    expect(narrative).toContain("Schema, Title Tags improved");
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
      category: {
        id: "schema",
        name: "Schema",
        score: 81,
        failedChecks: 2,
        totalChecks: 12,
        topIssue: "Course schema incomplete",
        severity: "high",
      },
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

  it("generates mixed narrative with improvement language and new criticals", () => {
    const narrative = generateReAuditNarrative(
      mockComparisonMixed,
      emptyAttributed,
      [
        { id: "schema", name: "Schema", scoreBefore: 72, scoreAfter: 81, delta: 9, topIssue: "Course schema incomplete", severity: "high" },
      ]
    );
    expect(narrative).toContain("Score improved but new critical regressions detected");
    expect(narrative).toContain("Schema improved");
    expect(narrative).toContain("new critical issues");
  });
});

describe("attributeActionsToScoreChange", () => {
  const makeAction = (overrides: Partial<ActionItem>): ActionItem =>
    ({
      id: "act-1",
      workspaceId: "ws-1",
      source: "ai-suggestion" as const,
      sourceId: "src-1",
      title: "Test action",
      impactArea: "technical-seo" as const,
      priority: "high" as const,
      status: "Done" as const,
      executionMode: "inside-rankflow" as const,
      owner: "User",
      dueDate: "2026-05-15",
      expectedImpact: "High",
      completedAt: "2026-05-10",
      evidenceRequired: true,
      evidence: [
        {
          id: "ev-1",
          submittedAt: "2026-05-09",
          submittedBy: "User",
          evidenceType: "url" as const,
          label: "Proof",
          value: "https://example.com",
          qualityScore: 5,
          approvalStatus: "Approved" as const,
        },
      ],
      impactScore: 85,
      clientReportContribution: false,
      ...overrides,
    } as ActionItem);

  it("includes actions completed in range with approved evidence", () => {
    const actions: ActionItem[] = [
      makeAction({ id: "act-1", completedAt: "2026-05-10" }),
      makeAction({ id: "act-2", completedAt: "2026-05-15" }),
    ];
    const result = attributeActionsToScoreChange(actions, mockSinceScan, mockVsScan);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.action.id)).toEqual(["act-1", "act-2"]);
  });

  it("excludes actions completed before the vs scan", () => {
    const actions: ActionItem[] = [
      makeAction({ id: "act-old", completedAt: "2026-04-15" }),
    ];
    const result = attributeActionsToScoreChange(actions, mockSinceScan, mockVsScan);
    expect(result).toHaveLength(0);
  });

  it("excludes actions without approved evidence", () => {
    const actions: ActionItem[] = [
      makeAction({
        id: "act-pending",
        completedAt: "2026-05-10",
        evidence: [
          {
            id: "ev-1",
            submittedAt: "2026-05-09",
            submittedBy: "User",
            evidenceType: "url" as const,
            label: "Proof",
            value: "https://example.com",
            qualityScore: 5,
            approvalStatus: "Pending" as const,
          },
        ],
      }),
    ];
    const result = attributeActionsToScoreChange(actions, mockSinceScan, mockVsScan);
    expect(result).toHaveLength(0);
  });

  it("returns empty array when no actions provided", () => {
    const result = attributeActionsToScoreChange([], mockSinceScan, mockVsScan);
    expect(result).toHaveLength(0);
  });
});
