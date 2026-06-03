import { describe, expect, it } from "vitest";
import { buildAiWorkflowConsole } from "./rankflow-helpers";
import type { ActionItem, AiBrainProfile } from "./rankflow-types";

const brain: AiBrainProfile = {
  status: "Active",
  lastRunAt: "2026-05-28 14:30",
  confidenceScore: 86,
  dataCoverageScore: 78,
  automationMode: "approval-required",
  insights: [],
  recommendations: [
    {
      id: "rec-geo",
      title: "Prioritize GEO evidence blocks on MBA pages",
      reason: "GEO visibility remains the weakest growth lever.",
      targetAction: "act-geo",
      priority: "high",
      expectedLift: "Improve AI answer presence by 8-12 points",
      requiresApproval: true
    },
    {
      id: "rec-report",
      title: "Generate draft client narrative for May report",
      reason: "The latest cycle has enough approved evidence to explain gains.",
      targetAction: "rep-may",
      priority: "medium",
      expectedLift: "Reduce reporting time",
      requiresApproval: false
    },
    {
      id: "rec-proof",
      title: "Request proof for external GBP service update",
      reason: "GBP action should not be counted until approved.",
      targetAction: "act-proof",
      priority: "high",
      expectedLift: "Protect action quality",
      requiresApproval: true
    }
  ],
  narratives: [
    {
      id: "nar-client",
      audience: "client",
      title: "May organic growth story",
      summary: "Visibility and answer readiness improved."
    }
  ],
  risks: []
};

const actions: ActionItem[] = [
  {
    id: "act-geo",
    workspaceId: "aurora-education",
    source: "local-visibility",
    sourceId: "aurora-geo",
    title: "Add cited outcomes evidence to MBA program pages",
    impactArea: "geo",
    priority: "high",
    status: "In Progress",
    executionMode: "outside-rankflow",
    owner: "Rohan Mehta",
    dueDate: "2026-05-30",
    expectedImpact: "Increase AI answer presence",
    evidenceRequired: true,
    evidence: [],
    impactScore: 51,
    clientReportContribution: false
  },
  {
    id: "act-proof",
    workspaceId: "aurora-education",
    source: "local-visibility",
    sourceId: "aurora-gbp",
    title: "Add scholarship services to Google Business Profile",
    impactArea: "local",
    priority: "high",
    status: "Evidence Review",
    executionMode: "outside-rankflow",
    owner: "Rohan Mehta",
    dueDate: "2026-05-28",
    expectedImpact: "Improve local pack relevance",
    evidenceRequired: true,
    evidence: [
      {
        id: "ev-proof",
        submittedAt: "2026-05-22",
        submittedBy: "Rohan Mehta",
        evidenceType: "screenshot",
        label: "GBP service screenshot",
        value: "gbp-services.png",
        qualityScore: 78,
        approvalStatus: "Pending"
      }
    ],
    impactScore: 64,
    clientReportContribution: true
  },
  {
    id: "act-done",
    workspaceId: "aurora-education",
    source: "ai-suggestion",
    sourceId: "sug-1",
    title: "Publish eligibility FAQ schema on course pages",
    impactArea: "aeo",
    priority: "medium",
    status: "Done",
    executionMode: "inside-rankflow",
    owner: "Anika Rao",
    dueDate: "2026-05-22",
    expectedImpact: "Lift answer-block eligibility coverage",
    completedAt: "2026-05-22",
    evidenceRequired: true,
    evidence: [
      {
        id: "ev-done",
        submittedAt: "2026-05-22",
        submittedBy: "Anika Rao",
        evidenceType: "url",
        label: "Validated schema URL",
        value: "https://aurora.example/courses/data-science",
        qualityScore: 92,
        approvalStatus: "Approved"
      }
    ],
    impactScore: 82,
    clientReportContribution: true
  }
];

describe("rankflow AI workflow helpers", () => {
  it("derives a human-approved AI OS workflow from recommendations and actions", () => {
    const console = buildAiWorkflowConsole({
      workspaceId: "aurora-education",
      brain,
      actions
    });

    expect(console).toMatchObject({
      workspaceId: "aurora-education",
      title: "AI-native SEO operating system",
      automationMode: "approval-required",
      summary: {
        recommendations: 3,
        needsApproval: 2,
        inExecution: 1,
        blockedByProof: 1,
        reportReady: 2,
        measured: 1
      }
    });

    expect(console.workflowItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "rec-geo",
          status: "in-execution",
          humanGate: "Needs HOD approval",
          evidenceState: "No proof submitted",
          actionId: "act-geo"
        }),
        expect.objectContaining({
          id: "rec-proof",
          status: "blocked-by-proof",
          humanGate: "Needs HOD approval",
          evidenceState: "Pending evidence approval",
          actionId: "act-proof"
        }),
        expect.objectContaining({
          id: "rec-report",
          status: "report-ready",
          humanGate: "Human approved narrative",
          evidenceState: "Ready for report"
        })
      ])
    );

    expect(console.reAuditProof).toMatchObject({
      measuredActions: 1,
      label: "Measured in re-audit"
    });
  });

  it("returns an empty console when the workspace has no AI brain profile", () => {
    expect(
      buildAiWorkflowConsole({
        workspaceId: "missing",
        brain: undefined,
        actions: []
      })
    ).toMatchObject({
      workspaceId: "missing",
      summary: {
        recommendations: 0,
        needsApproval: 0,
        inExecution: 0,
        blockedByProof: 0,
        reportReady: 0,
        measured: 0
      },
      workflowItems: []
    });
  });
});
