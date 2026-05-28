import { describe, expect, it } from "vitest";
import { FixtureRankFlowRepository } from "../src/repositories/rankflow-repository";

describe("rankflow audit intelligence repository", () => {
  const repository = new FixtureRankFlowRepository();

  it("returns the workspace hybrid audit intelligence stack", async () => {
    await expect(repository.getAuditIntelligence("aurora-education")).resolves.toMatchObject({
      workspaceId: "aurora-education",
      sourceStatuses: expect.arrayContaining([
        expect.objectContaining({ source: "own-crawler", status: "Connected" }),
        expect.objectContaining({ source: "gsc", status: "Connected" }),
        expect.objectContaining({ source: "ahrefs", status: "Needs Setup" })
      ]),
      claudeBrain: expect.objectContaining({
        status: "Ready",
        requiresHumanApproval: true
      })
    });
  });

  it("returns undefined for missing workspace audit intelligence", async () => {
    await expect(repository.getAuditIntelligence("missing")).resolves.toBeUndefined();
  });
});
