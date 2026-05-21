import { describe, expect, it } from "vitest";
import type { AiSuggestion, ScanSnapshot, WorkbookTask } from "./rankflow-types";
import {
  compareScans,
  getSuggestionInboxSummary,
  groupTasksByStatus
} from "./rankflow-helpers";

describe("rankflow module helpers", () => {
  it("compares two scan snapshots for score and issue movement", () => {
    const previous: ScanSnapshot = {
      id: "scan-old",
      type: "Full Site Crawl",
      completedAt: "2026-05-01 09:00",
      status: "Completed",
      pagesCrawled: 420,
      keywordsChecked: 180,
      score: 72,
      delta: 0,
      issues: { critical: 6, high: 12, medium: 24, low: 40 },
      suggestionsGenerated: 21
    };
    const current: ScanSnapshot = {
      ...previous,
      id: "scan-new",
      completedAt: "2026-05-20 09:00",
      score: 81,
      delta: 9,
      issues: { critical: 2, high: 9, medium: 28, low: 35 },
      suggestionsGenerated: 34
    };

    expect(compareScans(current, previous)).toEqual({
      scoreDelta: 9,
      resolvedCritical: 4,
      newCritical: 0,
      issueDelta: {
        critical: -4,
        high: -3,
        medium: 4,
        low: -5
      },
      suggestionsDelta: 13
    });
  });

  it("summarizes AI suggestions by workflow status and quick-win candidates", () => {
    const suggestions: AiSuggestion[] = [
      suggestion("s1", "New", "High"),
      suggestion("s2", "Accepted", "Medium"),
      suggestion("s3", "Implemented", "Low"),
      suggestion("s4", "Rejected", "Medium")
    ];

    expect(getSuggestionInboxSummary(suggestions)).toEqual({
      total: 4,
      newCount: 1,
      acceptedCount: 1,
      implementedCount: 1,
      rejectedCount: 1,
      quickWins: 2
    });
  });

  it("groups workbook tasks into the kanban statuses in product order", () => {
    const tasks: WorkbookTask[] = [
      task("t1", "Review"),
      task("t2", "Backlog"),
      task("t3", "Done"),
      task("t4", "In Progress")
    ];

    expect(groupTasksByStatus(tasks).map((column) => [column.status, column.tasks.map((item) => item.id)])).toEqual([
      ["Backlog", ["t2"]],
      ["In Progress", ["t4"]],
      ["Review", ["t1"]],
      ["Done", ["t3"]]
    ]);
  });
});

function suggestion(id: string, status: AiSuggestion["status"], impact: AiSuggestion["estimatedImpact"]): AiSuggestion {
  return {
    id,
    checkId: "TT-03",
    page: "/mba/admissions",
    title: `Suggestion ${id}`,
    recommendation: "Improve the page based on the source check.",
    source: "On-Page Deep Audit, TT-03",
    status,
    severity: "high",
    estimatedImpact: impact
  };
}

function task(id: string, status: WorkbookTask["status"]): WorkbookTask {
  return {
    id,
    title: `Task ${id}`,
    owner: "Maya Iyer",
    priority: "high",
    status,
    dueDate: "2026-05-24",
    evidenceRequired: true
  };
}
