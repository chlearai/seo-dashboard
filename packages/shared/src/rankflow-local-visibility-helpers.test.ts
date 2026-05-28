import { describe, expect, it } from "vitest";
import { getLocalVisibilitySummary } from "./rankflow-helpers";
import type { LocalVisibilityProfile } from "./rankflow-types";

describe("rankflow local visibility helpers", () => {
  it("summarizes GBP, local, AEO, and GEO optimization readiness", () => {
    const profile: LocalVisibilityProfile = {
      gbp: {
        score: 82,
        verificationStatus: "Verified",
        primaryCategory: "Business School",
        additionalCategories: ["MBA College", "Executive Education"],
        profileCompleteness: 90,
        napConsistency: 88,
        reviewRating: 4.4,
        reviewCount: 276,
        reviewVelocity30d: 18,
        unansweredReviews: 6,
        photoFreshnessDays: 12,
        postFreshnessDays: 8,
        servicesCompleteness: 78,
        productCompleteness: 64,
        qnaCompleteness: 72,
        localPackPosition: 3,
        mapsVisibilityScore: 76,
        topIssues: ["Scholarship service pages are missing from GBP", "Six reviews need owner responses"]
      },
      localSeo: {
        score: 74,
        napConsistency: 88,
        citationCoverage: 71,
        locationPagesHealthy: 9,
        locationPagesTotal: 12,
        localSchemaCoverage: 67,
        localKeywordTop10: 18,
        localKeywordTracked: 42,
        localPackShare: 31,
        proximityCoverage: 58,
        topIssues: ["Three campus landing pages lack LocalBusiness schema"]
      },
      aeo: {
        score: 69,
        questionLedHeadings: 22,
        faqSchemaCoverage: 48,
        paaCoverage: 36,
        conciseAnswerBlocks: 19,
        voiceSearchReadiness: 61,
        sourceClarity: 72,
        topIssues: ["Eligibility pages need direct answer blocks above long copy"]
      },
      geo: {
        score: 64,
        entityCoverage: 59,
        citationAuthority: 68,
        llmAnswerPresence: 42,
        aiOverviewEligibility: 54,
        authorExpertiseCoverage: 63,
        contentFreshness: 77,
        structuredEvidenceCoverage: 51,
        topIssues: ["Program pages need stronger cited evidence and entity disambiguation"]
      }
    };

    expect(getLocalVisibilitySummary(profile)).toEqual({
      overallScore: 72,
      weakestArea: "GEO",
      criticalActions: [
        "Scholarship service pages are missing from GBP",
        "Three campus landing pages lack LocalBusiness schema",
        "Eligibility pages need direct answer blocks above long copy",
        "Program pages need stronger cited evidence and entity disambiguation"
      ],
      gbpActionCount: 2,
      unansweredReviews: 6,
      mapsVisibilityScore: 76
    });
  });
});
