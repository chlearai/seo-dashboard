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
});
