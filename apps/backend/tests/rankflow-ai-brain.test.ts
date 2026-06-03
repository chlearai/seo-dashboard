import { describe, expect, it } from "vitest";
import { FixtureRankFlowRepository } from "../src/repositories/rankflow-repository";

describe("rankflow AI brain repository", () => {
  const repository = new FixtureRankFlowRepository();

  it("returns the workspace AI brain profile", async () => {
    await expect(repository.getAiBrain("aurora-education")).resolves.toMatchObject({
      status: "Active",
      automationMode: "approval-required",
      insights: expect.arrayContaining([
        expect.objectContaining({
          title: "Organic leads rose after FAQ schema and title updates"
        })
      ]),
      recommendations: expect.arrayContaining([
        expect.objectContaining({
          title: "Prioritize GEO evidence blocks on MBA pages",
          requiresApproval: true
        })
      ])
    });
  });

  it("returns undefined for missing workspace AI brain profile", async () => {
    await expect(repository.getAiBrain("missing")).resolves.toBeUndefined();
  });

  it("returns the derived human-approved AI workflow console", async () => {
    await expect(repository.getAiWorkflowConsole("aurora-education")).resolves.toMatchObject({
      workspaceId: "aurora-education",
      title: "AI-native SEO operating system",
      automationMode: "approval-required",
      summary: {
        recommendations: 3,
        needsApproval: 2,
        inExecution: 1,
        blockedByProof: 1,
        reportReady: 2,
        measured: 2
      },
      workflowItems: expect.arrayContaining([
        expect.objectContaining({
          id: "brain-rec-aurora-1",
          status: "in-execution",
          actionId: "act-aurora-geo-evidence"
        }),
        expect.objectContaining({
          id: "brain-rec-aurora-3",
          status: "blocked-by-proof",
          actionId: "act-aurora-gbp-services"
        })
      ])
    });
  });
});
