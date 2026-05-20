import { describe, expect, it } from "vitest";
import {
  getHodSummary,
  getSeverityTotals,
  getWorkspaceById,
  scoreHealth,
  workspaces
} from "../src/rankflow-data";

describe("rankflow domain data", () => {
  it("classifies score health with operational labels", () => {
    expect(scoreHealth(91)).toEqual({ label: "Excellent", tone: "success" });
    expect(scoreHealth(74)).toEqual({ label: "Watch", tone: "warning" });
    expect(scoreHealth(52)).toEqual({ label: "At Risk", tone: "critical" });
  });

  it("computes the HOD summary from all workspaces", () => {
    const summary = getHodSummary(workspaces);

    expect(summary.activeWorkspaces).toBe(4);
    expect(summary.accountsImproved).toBe(2);
    expect(summary.accountsAtRisk).toBe(1);
    expect(summary.openCriticalIssues).toBe(13);
    expect(summary.tasksDueThisWeek).toBe(18);
    expect(summary.reportsDue).toBe(3);
  });

  it("adds severity totals from the latest scan of every workspace", () => {
    expect(getSeverityTotals(workspaces)).toEqual({
      critical: 13,
      high: 41,
      medium: 93,
      low: 156
    });
  });

  it("finds known workspaces and returns undefined for unknown ones", () => {
    expect(getWorkspaceById("aurora-education")?.clientName).toBe("Aurora Education Group");
    expect(getWorkspaceById("missing-workspace")).toBeUndefined();
  });
});
