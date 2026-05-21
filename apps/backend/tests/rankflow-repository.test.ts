import { describe, expect, it } from "vitest";
import { FixtureRankFlowRepository } from "../src/repositories/rankflow-repository";

describe("FixtureRankFlowRepository", () => {
  const repository = new FixtureRankFlowRepository();

  it("lists workspaces and HOD summary through the repository boundary", async () => {
    const [workspaces, summary] = await Promise.all([
      repository.listWorkspaces(),
      repository.getHodSummary()
    ]);

    expect(workspaces).toHaveLength(4);
    expect(summary).toMatchObject({
      activeWorkspaces: 4,
      accountsAtRisk: 1,
      openCriticalIssues: 13
    });
  });

  it("returns workspace-owned collections independently", async () => {
    await expect(repository.listScans("aurora-education")).resolves.toHaveLength(2);
    await expect(repository.listAuditCategories("aurora-education")).resolves.toHaveLength(3);
    await expect(repository.listSuggestions("aurora-education")).resolves.toHaveLength(3);
    await expect(repository.listTasks("aurora-education")).resolves.toHaveLength(4);
  });

  it("returns empty collections for unknown workspaces", async () => {
    await expect(repository.getWorkspace("missing")).resolves.toBeUndefined();
    await expect(repository.listScans("missing")).resolves.toEqual([]);
    await expect(repository.listSuggestions("missing")).resolves.toEqual([]);
    await expect(repository.listTasks("missing")).resolves.toEqual([]);
  });
});
