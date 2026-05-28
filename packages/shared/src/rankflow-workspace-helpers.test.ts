import { describe, expect, it } from "vitest";
import type { Workspace } from "./rankflow-types";
import { getWorkspaceLocaleSummary } from "./rankflow-helpers";

describe("rankflow workspace helpers", () => {
  it("formats the workspace locale profile for global reporting", () => {
    const workspace: Workspace = {
      id: "atlas-commerce",
      clientName: "Atlas Commerce",
      primaryDomain: "atlascommerce.com",
      industry: "eCommerce",
      manager: "Nisha Kapoor",
      teamSize: 6,
      status: "Active",
      scores: { composite: 78, technical: 75, onPage: 81, offPage: 73, local: 66, aeo: 63, geo: 58 },
      scoreDeltaMom: 3,
      organicTrafficDelta: 9,
      keywordsTop10: 211,
      nextReportDue: "2026-05-27",
      lastScan: "2026-05-20",
      scans: [],
      auditCategories: [],
      suggestions: [],
      tasks: [],
      keywords: [],
      reports: [],
      localVisibility: {
        gbp: {
          score: 61,
          verificationStatus: "Verified",
          primaryCategory: "Clothing Store",
          additionalCategories: ["Men's Clothing Store", "Fashion Accessories Store"],
          profileCompleteness: 72,
          napConsistency: 74,
          reviewRating: 4.2,
          reviewCount: 188,
          reviewVelocity30d: 12,
          unansweredReviews: 14,
          photoFreshnessDays: 38,
          postFreshnessDays: 21,
          servicesCompleteness: 43,
          productCompleteness: 71,
          qnaCompleteness: 46,
          localPackPosition: 6,
          mapsVisibilityScore: 59,
          topIssues: ["Store pickup product feed is not reflected in GBP"]
        },
        localSeo: {
          score: 66,
          napConsistency: 74,
          citationCoverage: 63,
          locationPagesHealthy: 5,
          locationPagesTotal: 7,
          localSchemaCoverage: 58,
          localKeywordTop10: 12,
          localKeywordTracked: 28,
          localPackShare: 22,
          proximityCoverage: 51,
          topIssues: ["Store pages need product availability and pickup schema"]
        },
        aeo: {
          score: 63,
          questionLedHeadings: 18,
          faqSchemaCoverage: 44,
          paaCoverage: 30,
          conciseAnswerBlocks: 13,
          voiceSearchReadiness: 52,
          sourceClarity: 60,
          topIssues: ["Fit and fabric questions need concise answer blocks"]
        },
        geo: {
          score: 58,
          entityCoverage: 57,
          citationAuthority: 61,
          llmAnswerPresence: 28,
          aiOverviewEligibility: 46,
          authorExpertiseCoverage: 42,
          contentFreshness: 66,
          structuredEvidenceCoverage: 49,
          topIssues: ["Product guides need stronger original expertise and evidence"]
        }
      },
      locale: {
        region: "North America",
        country: "United States",
        language: "en-US",
        currency: "USD",
        timeZone: "America/New_York"
      }
    };

    expect(getWorkspaceLocaleSummary(workspace)).toEqual({
      market: "United States",
      language: "English (US)",
      currency: "USD",
      timeZone: "America/New_York",
      localeTag: "en-US"
    });
  });
});
