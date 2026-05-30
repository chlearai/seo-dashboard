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