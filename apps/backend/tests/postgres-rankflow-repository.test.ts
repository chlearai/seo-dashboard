import { describe, expect, it } from "vitest";
import { JsonPostgresRankFlowRepository, type QueryClient } from "../src/repositories/postgres-rankflow-repository";
import type { ActionItem, AiBrainProfile, RankFlowSession, Workspace } from "@rankflow/shared";

class FakeQueryClient implements QueryClient {
  constructor(private readonly records: Record<string, unknown>) {}

  async query<T>(sql: string, params: unknown[]) {
    if (!sql.includes("rankflow_live_state")) {
      throw new Error(`Unexpected SQL: ${sql}`);
    }

    if (sql.includes("insert into public.rankflow_live_state")) {
      this.records[String(params[0])] = params[1];
      return { rows: [] as T[] };
    }

    const key = String(params[0]);
    const record = this.records[key];
    return {
      rows: record === undefined ? [] : [{ payload: record as T }]
    };
  }
}

const workspace: Workspace = {
  id: "aurora-education",
  clientName: "Aurora Education Group",
  primaryDomain: "aurora.edu",
  locale: {
    region: "South Asia",
    country: "India",
    language: "en-IN",
    currency: "INR",
    timeZone: "Asia/Kolkata"
  },
  industry: "Education",
  manager: "Maya Iyer",
  teamSize: 5,
  status: "Delivering",
  scores: { composite: 86, technical: 91, onPage: 84, offPage: 78, local: 82, aeo: 74, geo: 69 },
  scoreDeltaMom: 8,
  organicTrafficDelta: 18,
  keywordsTop10: 124,
  nextReportDue: "2026-05-24",
  lastScan: "2026-05-20",
  scans: [
    {
      id: "scan-aurora-0520",
      type: "Full Site Crawl",
      completedAt: "2026-05-20 09:15",
      status: "Completed",
      pagesCrawled: 842,
      keywordsChecked: 420,
      score: 86,
      delta: 8,
      issues: { critical: 2, high: 11, medium: 27, low: 44 },
      suggestionsGenerated: 38
    }
  ],
  auditCategories: [],
  suggestions: [],
  tasks: [],
  keywords: [],
  reports: []
};

const session: RankFlowSession = {
  activeWorkspaceId: "aurora-education",
  visibleModules: ["dashboard", "reports"],
  user: {
    id: "user-maya",
    email: "maya@example.com",
    fullName: "Maya Iyer",
    role: "hod",
    organizationName: "RankFlow Demo Agency",
    workspaceAccess: []
  }
};

const aiBrain: AiBrainProfile = {
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
    }
  ],
  narratives: [],
  risks: []
};

const action: ActionItem = {
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
};

describe("JsonPostgresRankFlowRepository", () => {
  it("loads session and workspaces from rankflow_live_state records", async () => {
    const repository = new JsonPostgresRankFlowRepository(
      new FakeQueryClient({
        session,
        workspaces: [workspace]
      })
    );

    await expect(repository.getSession()).resolves.toEqual(session);
    await expect(repository.listWorkspaces()).resolves.toEqual([workspace]);
    await expect(repository.getWorkspace("aurora-education")).resolves.toEqual(workspace);
    await expect(repository.listScans("aurora-education")).resolves.toEqual(workspace.scans);
  });

  it("throws a clear setup error when live state has not been seeded", async () => {
    const repository = new JsonPostgresRankFlowRepository(new FakeQueryClient({}));

    await expect(repository.listWorkspaces()).rejects.toThrow(
      "RankFlow live data is not initialized. Seed rankflow_live_state before using RANKFLOW_DATA_MODE=live."
    );
  });

  it("derives the AI workflow console from JSON live state", async () => {
    const repository = new JsonPostgresRankFlowRepository(
      new FakeQueryClient({
        aiBrainByWorkspace: { "aurora-education": aiBrain },
        actionItemsByWorkspace: { "aurora-education": [action] }
      })
    );

    await expect(repository.getAiWorkflowConsole("aurora-education")).resolves.toMatchObject({
      workspaceId: "aurora-education",
      summary: {
        recommendations: 1,
        needsApproval: 1,
        inExecution: 1
      },
      workflowItems: [
        expect.objectContaining({
          id: "rec-geo",
          status: "in-execution",
          actionId: "act-geo"
        })
      ]
    });
  });

  it("persists an AI workflow approval decision into JSON live state", async () => {
    const records = {
      aiBrainByWorkspace: { "aurora-education": aiBrain },
      actionItemsByWorkspace: { "aurora-education": [action] }
    };
    const repository = new JsonPostgresRankFlowRepository(new FakeQueryClient(records));

    await repository.saveAiWorkflowApproval("aurora-education", {
      recommendationId: "rec-geo",
      decision: "approved",
      decidedAt: "2026-06-03T09:00:00.000Z",
      decidedBy: "Maya Iyer"
    });

    await expect(repository.getAiWorkflowConsole("aurora-education")).resolves.toMatchObject({
      summary: {
        needsApproval: 0,
        approved: 1
      },
      workflowItems: [
        expect.objectContaining({
          id: "rec-geo",
          approvalDecision: "approved",
          humanGate: "Approved by Maya Iyer"
        })
      ]
    });
  });
});
