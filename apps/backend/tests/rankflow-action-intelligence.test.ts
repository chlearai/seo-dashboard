import { describe, expect, it } from "vitest";
import { FixtureRankFlowRepository } from "../src/repositories/rankflow-repository";

describe("rankflow action intelligence repository", () => {
  const repository = new FixtureRankFlowRepository();

  it("returns growth cycles, metric snapshots, action items, and expert efficiency", async () => {
    await expect(repository.listGrowthCycles("aurora-education")).resolves.toHaveLength(2);
    await expect(repository.listOrganicMetricSnapshots("aurora-education")).resolves.toHaveLength(2);
    await expect(repository.listActionItems("aurora-education")).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Add scholarship services to Google Business Profile",
          executionMode: "outside-rankflow",
          evidenceRequired: true
        })
      ])
    );
    await expect(repository.listExpertEfficiency("aurora-education")).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ owner: "Rohan Mehta", completedActions: expect.any(Number) })
      ])
    );
  });

  it("returns empty action intelligence collections for unknown workspaces", async () => {
    await expect(repository.listGrowthCycles("missing")).resolves.toEqual([]);
    await expect(repository.listOrganicMetricSnapshots("missing")).resolves.toEqual([]);
    await expect(repository.listActionItems("missing")).resolves.toEqual([]);
    await expect(repository.listExpertEfficiency("missing")).resolves.toEqual([]);
  });
});
