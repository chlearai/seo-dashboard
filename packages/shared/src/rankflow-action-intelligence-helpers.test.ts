import { describe, expect, it } from "vitest";
import {
  getActionIntelligenceSummary,
  getExpertEfficiencySummary,
  getOrganicGrowthDelta
} from "./rankflow-helpers";
import type {
  ActionExecutionMode,
  ActionItem,
  ActionStatus,
  ExpertEfficiency,
  OrganicGrowthMetricSnapshot
} from "./rankflow-types";

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
      {
        owner: "Rohan Mehta",
        assignedActions: 8,
        completedActions: 6,
        overdueActions: 1,
        averageCompletionDays: 3,
        evidenceApprovalRate: 92,
        impactDelivered: 74,
        clientReportContributions: 4
      },
      {
        owner: "Anika Rao",
        assignedActions: 6,
        completedActions: 3,
        overdueActions: 2,
        averageCompletionDays: 5,
        evidenceApprovalRate: 76,
        impactDelivered: 48,
        clientReportContributions: 2
      }
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

function metricSnapshot(
  id: string,
  searchImpressions: number,
  organicClicks: number,
  organicLeads: number,
  aeoVisibility: number,
  geoVisibility: number
): OrganicGrowthMetricSnapshot {
  return {
    id,
    workspaceId: "aurora-education",
    measuredAt: "2026-05-20",
    searchImpressions,
    organicClicks,
    organicCtr: 4.2,
    averagePosition: 18,
    keywordsTop3: 18,
    keywordsTop10: 124,
    rankingImproved: 38,
    rankingDeclined: 17,
    organicSessions: 7600,
    organicUsers: 6100,
    referralSessions: 920,
    organicLeads,
    organicConversionRate: 2.8,
    backlinks: 1840,
    referringDomains: 322,
    newBacklinks: 42,
    lostBacklinks: 11,
    aeoVisibility,
    geoVisibility,
    localVisibility: 72,
    technicalHealth: 86
  };
}

function action(
  id: string,
  status: ActionStatus,
  executionMode: ActionExecutionMode,
  pendingEvidence: boolean,
  impactScore: number
): ActionItem {
  return {
    id,
    workspaceId: "aurora-education",
    source: "manual",
    sourceId: id,
    title: `Action ${id}`,
    impactArea: "visibility",
    priority: "high",
    status,
    executionMode,
    owner: "Rohan Mehta",
    dueDate: "2026-05-28",
    expectedImpact: "Improve search visibility",
    evidenceRequired: true,
    evidence: pendingEvidence
      ? [
          {
            id: `${id}-evidence`,
            submittedAt: "2026-05-22",
            submittedBy: "Rohan Mehta",
            evidenceType: "url",
            label: "Published URL",
            value: "https://example.com/page",
            qualityScore: 72,
            approvalStatus: "Pending"
          }
        ]
      : [],
    impactScore,
    clientReportContribution: status === "Done"
  };
}
