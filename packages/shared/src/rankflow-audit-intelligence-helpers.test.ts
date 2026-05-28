import { describe, expect, it } from "vitest";
import { getAuditIntelligenceSummary } from "./rankflow-helpers";
import type { AuditIntelligenceStack } from "./rankflow-types";

describe("rankflow audit intelligence helpers", () => {
  it("summarizes hybrid evidence coverage and Claude readiness", () => {
    const stack: AuditIntelligenceStack = {
      workspaceId: "aurora-education",
      sourceStatuses: [
        {
          source: "own-crawler",
          label: "Own crawler",
          status: "Connected",
          coverageScore: 84,
          lastSyncedAt: "2026-05-28",
          recordsAvailable: 842,
          primaryUse: "Core technical checks"
        },
        {
          source: "screaming-frog",
          label: "Screaming Frog",
          status: "Import Ready",
          coverageScore: 72,
          lastSyncedAt: "2026-05-27",
          recordsAvailable: 2100,
          primaryUse: "Deep crawl import"
        },
        {
          source: "gsc",
          label: "Google Search Console",
          status: "Connected",
          coverageScore: 91,
          lastSyncedAt: "2026-05-28",
          recordsAvailable: 18400,
          primaryUse: "Queries and impressions"
        },
        {
          source: "ahrefs",
          label: "Ahrefs",
          status: "Needs Setup",
          coverageScore: 0,
          lastSyncedAt: "Not connected",
          recordsAvailable: 0,
          primaryUse: "Backlinks and authority"
        }
      ],
      technicalChecks: [
        {
          id: "tc-1",
          category: "technical",
          label: "Missing titles",
          description: "Pages without title tags",
          severity: "high",
          affectedUrls: 12,
          passedUrls: 830,
          failedUrls: 12,
          source: "own-crawler"
        },
        {
          id: "tc-2",
          category: "indexability",
          label: "Blocked important pages",
          description: "Important pages with noindex",
          severity: "critical",
          affectedUrls: 3,
          passedUrls: 839,
          failedUrls: 3,
          source: "own-crawler"
        }
      ],
      searchPerformance: [
        {
          id: "sp-1",
          source: "gsc",
          label: "Search impressions",
          value: 134000,
          delta: 34000,
          category: "impressions"
        }
      ],
      authoritySignals: [
        {
          id: "as-1",
          source: "dataforseo",
          label: "Referring domains",
          value: 348,
          delta: 26,
          category: "referring-domains"
        }
      ],
      claudeBrain: {
        id: "brain-run-1",
        status: "Ready",
        inputSources: ["own-crawler", "gsc", "ga4", "dataforseo"],
        confidenceScore: 86,
        promptVersion: "seo-brain-v1",
        findingsGenerated: 18,
        actionsGenerated: 9,
        reportNarrativesGenerated: 2,
        requiresHumanApproval: true,
        lastRunAt: "2026-05-28 15:00"
      }
    };

    expect(getAuditIntelligenceSummary(stack)).toEqual({
      connectedSources: 2,
      needsSetup: 1,
      technicalIssues: 15,
      criticalTechnicalIssues: 3,
      performanceSignals: 1,
      authoritySignals: 1,
      claudeReady: true
    });
  });
});
