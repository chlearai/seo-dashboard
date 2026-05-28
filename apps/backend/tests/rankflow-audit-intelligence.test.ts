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

  it("merges live gsc data when the connector is available", async () => {
    const liveRepository = new FixtureRankFlowRepository({
      googleSearchConsoleConnector: {
        async getSnapshot() {
          return {
            sourceStatus: {
              source: "gsc",
              label: "Google Search Console",
              status: "Connected",
              coverageScore: 100,
              lastSyncedAt: "2026-05-28T12:00:00.000Z",
              recordsAvailable: 1,
              primaryUse: "Live Search Analytics sync"
            },
            searchPerformance: [
              {
                id: "gsc-live-impressions-aurora-education",
                source: "gsc",
                label: "Search impressions",
                value: 150000,
                delta: 16000,
                category: "impressions"
              }
            ]
          };
        }
      }
    });

    await expect(liveRepository.getAuditIntelligence("aurora-education")).resolves.toMatchObject({
      sourceStatuses: expect.arrayContaining([
        expect.objectContaining({
          source: "gsc",
          primaryUse: "Live Search Analytics sync"
        })
      ]),
      searchPerformance: expect.arrayContaining([
        expect.objectContaining({
          source: "gsc",
          label: "Search impressions",
          value: 150000
        })
      ])
    });
  });
});
