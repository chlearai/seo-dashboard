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

  it("merges live ga4 data when the connector is available", async () => {
    const liveRepository = new FixtureRankFlowRepository({
      googleAnalytics4Connector: {
        async getSnapshot() {
          return {
            sourceStatus: {
              source: "ga4",
              label: "Google Analytics 4",
              status: "Connected",
              coverageScore: 100,
              lastSyncedAt: "2026-05-28T12:00:00.000Z",
              recordsAvailable: 2,
              primaryUse: "Live organic traffic, leads, and referral sync"
            },
            searchPerformance: [
              {
                id: "ga4-live-organic-sessions-aurora-education",
                source: "ga4",
                label: "Organic sessions",
                value: 9800,
                delta: 2200,
                category: "sessions"
              },
              {
                id: "ga4-live-organic-users-aurora-education",
                source: "ga4",
                label: "Organic users",
                value: 7600,
                delta: 1400,
                category: "users"
              }
            ]
          };
        }
      }
    });

    await expect(liveRepository.getAuditIntelligence("aurora-education")).resolves.toMatchObject({
      sourceStatuses: expect.arrayContaining([
        expect.objectContaining({
          source: "ga4",
          primaryUse: "Live organic traffic, leads, and referral sync"
        })
      ]),
      searchPerformance: expect.arrayContaining([
        expect.objectContaining({
          source: "ga4",
          label: "Organic sessions",
          value: 9800
        }),
        expect.objectContaining({
          source: "ga4",
          label: "Organic users",
          value: 7600
        })
      ])
    });
  });

  it("merges live authority data and Claude brain output when the connectors are available", async () => {
    const liveRepository = new FixtureRankFlowRepository({
      dataForSeoConnector: {
        async getSnapshot(workspaceId, context) {
          expect(workspaceId).toBe("aurora-education");
          expect(context.domain).toBe("aurora.edu");
          return {
            sourceStatus: {
              source: "dataforseo",
              label: "DataForSEO",
              status: "Connected",
              coverageScore: 100,
              lastSyncedAt: "2026-05-28T12:00:00.000Z",
              recordsAvailable: 2,
              primaryUse: "Live rank tracking and competitor gaps"
            },
            authoritySignals: [
              {
                id: "dataforseo-live-rank-aurora-education",
                source: "dataforseo",
                label: "Keyword rank movement",
                value: 64,
                delta: 28,
                category: "keyword-rank"
              }
            ]
          };
        }
      },
      ahrefsConnector: {
        async getSnapshot(workspaceId, context) {
          expect(workspaceId).toBe("aurora-education");
          expect(context.domain).toBe("aurora.edu");
          return {
            sourceStatus: {
              source: "ahrefs",
              label: "Ahrefs",
              status: "Connected",
              coverageScore: 100,
              lastSyncedAt: "2026-05-28T12:00:00.000Z",
              recordsAvailable: 1,
              primaryUse: "Live backlink and referring domain sync"
            },
            authoritySignals: [
              {
                id: "ahrefs-live-backlinks-aurora-education",
                source: "ahrefs",
                label: "Backlinks",
                value: 2100,
                delta: 182,
                category: "backlinks"
              }
            ]
          };
        }
      },
      semrushConnector: {
        async getSnapshot(workspaceId, context) {
          expect(workspaceId).toBe("aurora-education");
          expect(context.domain).toBe("aurora.edu");
          return {
            sourceStatus: {
              source: "semrush",
              label: "Semrush",
              status: "Connected",
              coverageScore: 100,
              lastSyncedAt: "2026-05-28T12:00:00.000Z",
              recordsAvailable: 1,
              primaryUse: "Live competitor and keyword authority sync"
            },
            authoritySignals: [
              {
                id: "semrush-live-authority-aurora-education",
                source: "semrush",
                label: "Authority score",
                value: 58,
                delta: 7,
                category: "authority-score"
              }
            ]
          };
        }
      },
      claudeBrainConnector: {
        async getSnapshot(workspaceId, context) {
          expect(workspaceId).toBe("aurora-education");
          expect(context.workspace.primaryDomain).toBe("aurora.edu");
          expect(context.stack.authoritySignals).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ source: "dataforseo" }),
              expect.objectContaining({ source: "ahrefs" }),
              expect.objectContaining({ source: "semrush" })
            ])
          );
          return {
            sourceStatus: {
              source: "claude-brain",
              label: "Claude SEO Brain",
              status: "Connected",
              coverageScore: 100,
              lastSyncedAt: "2026-05-28T12:00:00.000Z",
              recordsAvailable: 1,
              primaryUse: "Live interpretation and report drafting"
            },
            claudeBrain: {
              id: "claude-live-aurora-education",
              status: "Running",
              inputSources: ["own-crawler", "screaming-frog", "gsc", "ga4", "dataforseo", "ahrefs", "semrush"],
              confidenceScore: 92,
              promptVersion: "seo-brain-v2",
              findingsGenerated: 24,
              actionsGenerated: 12,
              reportNarrativesGenerated: 4,
              requiresHumanApproval: true,
              lastRunAt: "2026-05-28T12:00:00.000Z"
            }
          };
        }
      }
    });

    await expect(liveRepository.getAuditIntelligence("aurora-education")).resolves.toMatchObject({
      sourceStatuses: expect.arrayContaining([
        expect.objectContaining({ source: "dataforseo", status: "Connected" }),
        expect.objectContaining({ source: "ahrefs", status: "Connected" }),
        expect.objectContaining({ source: "semrush", status: "Connected" }),
        expect.objectContaining({ source: "claude-brain", status: "Connected" })
      ]),
      authoritySignals: expect.arrayContaining([
        expect.objectContaining({ source: "dataforseo", label: "Keyword rank movement" }),
        expect.objectContaining({ source: "ahrefs", label: "Backlinks" }),
        expect.objectContaining({ source: "semrush", label: "Authority score" })
      ]),
      claudeBrain: expect.objectContaining({
        status: "Running",
        promptVersion: "seo-brain-v2"
      })
    });
  });

  it("includes screaming frog as a connected technical source", async () => {
    await expect(repository.getAuditIntelligence("aurora-education")).resolves.toMatchObject({
      sourceStatuses: expect.arrayContaining([
        expect.objectContaining({
          source: "screaming-frog",
          label: "Screaming Frog",
          status: "Import Ready"
        })
      ]),
      technicalChecks: expect.arrayContaining([
        expect.objectContaining({
          source: "screaming-frog",
          label: "Missing titles"
        })
      ])
    });
  });
});
