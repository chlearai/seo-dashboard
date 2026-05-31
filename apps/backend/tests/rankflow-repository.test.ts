import { describe, expect, it } from "vitest";
import { FixtureRankFlowRepository } from "../src/repositories/rankflow-repository";

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}

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

  it("returns the active RBAC session", async () => {
    await expect(repository.getSession()).resolves.toMatchObject({
      activeWorkspaceId: "aurora-education",
      user: {
        role: "hod",
        organizationName: "RankFlow Demo Agency"
      },
      visibleModules: expect.arrayContaining(["dashboard", "workbook", "reports"])
    });
  });

  it("returns workspace-owned collections independently", async () => {
    await expect(repository.listScans("aurora-education")).resolves.toHaveLength(2);
    await expect(repository.listAuditCategories("aurora-education")).resolves.toHaveLength(3);
    await expect(repository.listSuggestions("aurora-education")).resolves.toHaveLength(3);
    await expect(repository.listTasks("aurora-education")).resolves.toHaveLength(4);
    await expect(repository.listKeywords("aurora-education")).resolves.toHaveLength(4);
    await expect(repository.listReports("aurora-education")).resolves.toHaveLength(2);
    await expect(repository.getLocalVisibility("aurora-education")).resolves.toMatchObject({
      gbp: {
        verificationStatus: "Verified",
        primaryCategory: "Business School"
      },
      aeo: {
        score: expect.any(Number)
      },
      geo: {
        score: expect.any(Number)
      }
    });
  });

  it("returns empty collections for unknown workspaces", async () => {
    await expect(repository.getWorkspace("missing")).resolves.toBeUndefined();
    await expect(repository.listScans("missing")).resolves.toEqual([]);
    await expect(repository.listSuggestions("missing")).resolves.toEqual([]);
    await expect(repository.listTasks("missing")).resolves.toEqual([]);
    await expect(repository.listKeywords("missing")).resolves.toEqual([]);
    await expect(repository.listReports("missing")).resolves.toEqual([]);
    await expect(repository.getLocalVisibility("missing")).resolves.toBeUndefined();
  });

  it("fails closed in production instead of serving seeded data", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousDataMode = process.env.RANKFLOW_DATA_MODE;
    process.env.NODE_ENV = "production";
    delete process.env.RANKFLOW_DATA_MODE;

    try {
      const productionRepository = new FixtureRankFlowRepository();

      await expect(productionRepository.listWorkspaces()).rejects.toThrow(
        "RankFlow seed data is disabled in production unless RANKFLOW_DATA_MODE=seed is explicitly set for staging"
      );
      await expect(productionRepository.getAuditIntelligence("aurora-education")).rejects.toThrow(
        "RankFlow seed data is disabled in production unless RANKFLOW_DATA_MODE=seed is explicitly set for staging"
      );
    } finally {
      restoreEnv("NODE_ENV", previousNodeEnv);
      restoreEnv("RANKFLOW_DATA_MODE", previousDataMode);
    }
  });

  it("allows seeded data in production only when staging seed mode is explicit", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousDataMode = process.env.RANKFLOW_DATA_MODE;
    process.env.NODE_ENV = "production";
    process.env.RANKFLOW_DATA_MODE = "seed";

    try {
      const stagingRepository = new FixtureRankFlowRepository();

      await expect(stagingRepository.listWorkspaces()).resolves.toHaveLength(4);
      await expect(stagingRepository.getAuditIntelligence("aurora-education")).resolves.toMatchObject({
        workspaceId: "aurora-education"
      });
    } finally {
      restoreEnv("NODE_ENV", previousNodeEnv);
      restoreEnv("RANKFLOW_DATA_MODE", previousDataMode);
    }
  });
});
