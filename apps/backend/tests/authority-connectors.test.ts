import { describe, expect, it } from "vitest";
import { createAhrefsConnector } from "../src/connectors/ahrefs";
import { createClaudeSeoBrainConnector } from "../src/connectors/claude-seo-brain";
import { createDataForSeoConnector } from "../src/connectors/dataforseo";
import { createSemrushConnector } from "../src/connectors/semrush";

function createMockFetch(expectedUrl: string, payload: unknown) {
  return async (input: RequestInfo | URL) => {
    expect(String(input)).toBe(expectedUrl);
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  };
}

describe("authority connectors", () => {
  it("reads a DataForSEO snapshot", async () => {
    const connector = createDataForSeoConnector({
      enabled: true,
      snapshotUrl: "https://example.com/dataforseo/snapshot",
      accessToken: "token",
      fetchImpl: createMockFetch("https://example.com/dataforseo/snapshot?workspaceId=aurora-education", {
        sourceStatus: {
          source: "dataforseo",
          label: "DataForSEO",
          status: "Import Ready",
          coverageScore: 88,
          lastSyncedAt: "2026-05-28T12:00:00.000Z",
          recordsAvailable: 2,
          primaryUse: "Rank tracking, SERP features, and competitor gaps"
        },
        authoritySignals: [
          {
            id: "dataforseo-rank-movement",
            source: "dataforseo",
            label: "Keyword rank movement",
            value: 61,
            delta: 23,
            category: "keyword-rank"
          }
        ]
      })
    });

    await expect(connector.getSnapshot("aurora-education")).resolves.toMatchObject({
      sourceStatus: expect.objectContaining({
        source: "dataforseo",
        status: "Import Ready"
      }),
      authoritySignals: [
        expect.objectContaining({
          source: "dataforseo",
          label: "Keyword rank movement"
        })
      ]
    });
  });

  it("reads an Ahrefs snapshot", async () => {
    const connector = createAhrefsConnector({
      enabled: true,
      snapshotUrl: "https://example.com/ahrefs/snapshot",
      accessToken: "token",
      fetchImpl: createMockFetch("https://example.com/ahrefs/snapshot?workspaceId=aurora-education", {
        sourceStatus: {
          source: "ahrefs",
          label: "Ahrefs",
          status: "Connected",
          coverageScore: 95,
          lastSyncedAt: "2026-05-28T12:00:00.000Z",
          recordsAvailable: 2,
          primaryUse: "Backlinks and referring domains"
        },
        authoritySignals: [
          {
            id: "ahrefs-backlinks",
            source: "ahrefs",
            label: "Backlinks",
            value: 1918,
            delta: 78,
            category: "backlinks"
          }
        ]
      })
    });

    await expect(connector.getSnapshot("aurora-education")).resolves.toMatchObject({
      sourceStatus: expect.objectContaining({
        source: "ahrefs",
        status: "Connected"
      }),
      authoritySignals: [
        expect.objectContaining({
          source: "ahrefs",
          label: "Backlinks"
        })
      ]
    });
  });

  it("reads a Semrush snapshot", async () => {
    const connector = createSemrushConnector({
      enabled: true,
      snapshotUrl: "https://example.com/semrush/snapshot",
      accessToken: "token",
      fetchImpl: createMockFetch("https://example.com/semrush/snapshot?workspaceId=aurora-education", {
        sourceStatus: {
          source: "semrush",
          label: "Semrush",
          status: "Import Ready",
          coverageScore: 81,
          lastSyncedAt: "2026-05-28T12:00:00.000Z",
          recordsAvailable: 2,
          primaryUse: "Keyword authority and competitor visibility"
        },
        authoritySignals: [
          {
            id: "semrush-authority-score",
            source: "semrush",
            label: "Authority score",
            value: 52,
            delta: 5,
            category: "authority-score"
          }
        ]
      })
    });

    await expect(connector.getSnapshot("aurora-education")).resolves.toMatchObject({
      sourceStatus: expect.objectContaining({
        source: "semrush",
        status: "Import Ready"
      }),
      authoritySignals: [
        expect.objectContaining({
          source: "semrush",
          label: "Authority score"
        })
      ]
    });
  });

  it("reads a Claude SEO Brain snapshot", async () => {
    const connector = createClaudeSeoBrainConnector({
      enabled: true,
      snapshotUrl: "https://example.com/claude/snapshot",
      accessToken: "token",
      fetchImpl: createMockFetch("https://example.com/claude/snapshot?workspaceId=aurora-education", {
        sourceStatus: {
          source: "claude-brain",
          label: "Claude SEO Brain",
          status: "Connected",
          coverageScore: 86,
          lastSyncedAt: "2026-05-28T12:00:00.000Z",
          recordsAvailable: 1,
          primaryUse: "Interpretation, prioritization, and reporting"
        },
        claudeBrain: {
          id: "claude-brain-live-1",
          status: "Ready",
          inputSources: ["own-crawler", "gsc", "ga4", "dataforseo", "ahrefs", "semrush"],
          confidenceScore: 90,
          promptVersion: "seo-brain-v2",
          findingsGenerated: 21,
          actionsGenerated: 11,
          reportNarrativesGenerated: 3,
          requiresHumanApproval: true,
          lastRunAt: "2026-05-28T12:00:00.000Z"
        }
      })
    });

    await expect(connector.getSnapshot("aurora-education")).resolves.toMatchObject({
      sourceStatus: expect.objectContaining({
        source: "claude-brain",
        status: "Connected"
      }),
      claudeBrain: expect.objectContaining({
        status: "Ready",
        promptVersion: "seo-brain-v2"
      })
    });
  });
});
