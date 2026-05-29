import type {
  ActionItem,
  AiBrainProfile,
  AuditIntelligenceStack,
  CrawlerEvaluation,
  CrawlerPageSnapshot,
  ExpertEfficiency,
  HodSummary,
  LocalVisibilityProfile,
  OrganicGrowthCycle,
  OrganicGrowthMetricSnapshot,
  RankFlowSession,
  SeverityCounts,
  Workspace
} from "@rankflow/shared";
import { evaluateCrawlerPages, evaluateScreamingFrogCsv, getLatestScan, scoreHealth } from "@rankflow/shared";

export { getLatestScan, scoreHealth };

const localVisibilityProfiles: Record<string, LocalVisibilityProfile> = {
  "aurora-education": {
    gbp: {
      score: 82,
      verificationStatus: "Verified",
      primaryCategory: "Business School",
      additionalCategories: ["MBA College", "Executive Education", "Education Consultant"],
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
  },
  "nimbus-health": {
    gbp: {
      score: 54,
      verificationStatus: "Verified",
      primaryCategory: "Medical Clinic",
      additionalCategories: ["Family Practice Physician", "Diagnostic Centre"],
      profileCompleteness: 68,
      napConsistency: 52,
      reviewRating: 3.9,
      reviewCount: 418,
      reviewVelocity30d: 9,
      unansweredReviews: 31,
      photoFreshnessDays: 96,
      postFreshnessDays: 44,
      servicesCompleteness: 58,
      productCompleteness: 20,
      qnaCompleteness: 41,
      localPackPosition: 9,
      mapsVisibilityScore: 48,
      topIssues: ["Clinic hours conflict across GBP and location pages", "Thirty-one reviews need healthcare-safe responses"]
    },
    localSeo: {
      score: 55,
      napConsistency: 52,
      citationCoverage: 49,
      locationPagesHealthy: 3,
      locationPagesTotal: 11,
      localSchemaCoverage: 38,
      localKeywordTop10: 7,
      localKeywordTracked: 34,
      localPackShare: 14,
      proximityCoverage: 36,
      topIssues: ["NAP mismatch across clinic pages"]
    },
    aeo: {
      score: 48,
      questionLedHeadings: 11,
      faqSchemaCoverage: 26,
      paaCoverage: 19,
      conciseAnswerBlocks: 8,
      voiceSearchReadiness: 39,
      sourceClarity: 44,
      topIssues: ["Symptom pages do not answer near-me patient questions directly"]
    },
    geo: {
      score: 44,
      entityCoverage: 45,
      citationAuthority: 52,
      llmAnswerPresence: 21,
      aiOverviewEligibility: 35,
      authorExpertiseCoverage: 40,
      contentFreshness: 49,
      structuredEvidenceCoverage: 32,
      topIssues: ["Doctor expertise and clinical evidence are not structured for AI answers"]
    }
  },
  "atlas-commerce": {
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
      topIssues: ["Store pickup product feed is not reflected in GBP", "GBP posts are not aligned with sale campaigns"]
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
  "vertex-saas": {
    gbp: {
      score: 58,
      verificationStatus: "Verified",
      primaryCategory: "Software Company",
      additionalCategories: ["Business Management Consultant"],
      profileCompleteness: 64,
      napConsistency: 82,
      reviewRating: 4.6,
      reviewCount: 74,
      reviewVelocity30d: 5,
      unansweredReviews: 2,
      photoFreshnessDays: 64,
      postFreshnessDays: 31,
      servicesCompleteness: 48,
      productCompleteness: 39,
      qnaCompleteness: 35,
      localPackPosition: 8,
      mapsVisibilityScore: 45,
      topIssues: ["SaaS service categories are too generic for local discovery", "Q&A does not cover implementation and pricing questions"]
    },
    localSeo: {
      score: 52,
      napConsistency: 82,
      citationCoverage: 44,
      locationPagesHealthy: 1,
      locationPagesTotal: 3,
      localSchemaCoverage: 35,
      localKeywordTop10: 4,
      localKeywordTracked: 19,
      localPackShare: 9,
      proximityCoverage: 33,
      topIssues: ["Regional SaaS landing pages do not carry local proof"]
    },
    aeo: {
      score: 66,
      questionLedHeadings: 25,
      faqSchemaCoverage: 56,
      paaCoverage: 41,
      conciseAnswerBlocks: 17,
      voiceSearchReadiness: 58,
      sourceClarity: 64,
      topIssues: ["Comparison pages need clearer answer-first sections"]
    },
    geo: {
      score: 61,
      entityCoverage: 62,
      citationAuthority: 57,
      llmAnswerPresence: 33,
      aiOverviewEligibility: 49,
      authorExpertiseCoverage: 55,
      contentFreshness: 68,
      structuredEvidenceCoverage: 53,
      topIssues: ["Competitor comparison claims need structured evidence blocks"]
    }
  }
};

export const organicMetricSnapshotsByWorkspace: Record<string, OrganicGrowthMetricSnapshot[]> = {
  "aurora-education": [
    {
      id: "metrics-aurora-2026-05-01",
      workspaceId: "aurora-education",
      measuredAt: "2026-05-01",
      searchImpressions: 100000,
      organicClicks: 4200,
      organicCtr: 4.2,
      averagePosition: 18,
      keywordsTop3: 18,
      keywordsTop10: 124,
      rankingImproved: 38,
      rankingDeclined: 17,
      organicSessions: 7600,
      organicUsers: 6100,
      referralSessions: 920,
      organicLeads: 210,
      organicConversionRate: 2.8,
      backlinks: 1840,
      referringDomains: 322,
      newBacklinks: 42,
      lostBacklinks: 11,
      aeoVisibility: 64,
      geoVisibility: 41,
      localVisibility: 72,
      technicalHealth: 86
    },
    {
      id: "metrics-aurora-2026-05-20",
      workspaceId: "aurora-education",
      measuredAt: "2026-05-20",
      searchImpressions: 134000,
      organicClicks: 6100,
      organicCtr: 4.6,
      averagePosition: 14,
      keywordsTop3: 27,
      keywordsTop10: 151,
      rankingImproved: 61,
      rankingDeclined: 14,
      organicSessions: 9800,
      organicUsers: 7900,
      referralSessions: 1280,
      organicLeads: 318,
      organicConversionRate: 3.2,
      backlinks: 1918,
      referringDomains: 348,
      newBacklinks: 91,
      lostBacklinks: 13,
      aeoVisibility: 72,
      geoVisibility: 58,
      localVisibility: 79,
      technicalHealth: 89
    }
  ],
  "nimbus-health": [
    {
      id: "metrics-nimbus-2026-05-01",
      workspaceId: "nimbus-health",
      measuredAt: "2026-05-01",
      searchImpressions: 48000,
      organicClicks: 1200,
      organicCtr: 2.5,
      averagePosition: 24,
      keywordsTop3: 4,
      keywordsTop10: 39,
      rankingImproved: 11,
      rankingDeclined: 19,
      organicSessions: 2100,
      organicUsers: 1700,
      referralSessions: 340,
      organicLeads: 38,
      organicConversionRate: 1.8,
      backlinks: 620,
      referringDomains: 88,
      newBacklinks: 8,
      lostBacklinks: 14,
      aeoVisibility: 41,
      geoVisibility: 38,
      localVisibility: 48,
      technicalHealth: 52
    },
    {
      id: "metrics-nimbus-2026-05-20",
      workspaceId: "nimbus-health",
      measuredAt: "2026-05-20",
      searchImpressions: 41000,
      organicClicks: 980,
      organicCtr: 2.4,
      averagePosition: 28,
      keywordsTop3: 3,
      keywordsTop10: 33,
      rankingImproved: 9,
      rankingDeclined: 24,
      organicSessions: 1800,
      organicUsers: 1400,
      referralSessions: 290,
      organicLeads: 29,
      organicConversionRate: 1.6,
      backlinks: 598,
      referringDomains: 82,
      newBacklinks: 5,
      lostBacklinks: 11,
      aeoVisibility: 36,
      geoVisibility: 32,
      localVisibility: 42,
      technicalHealth: 44
    }
  ],
  "atlas-commerce": [
    {
      id: "metrics-atlas-2026-05-01",
      workspaceId: "atlas-commerce",
      measuredAt: "2026-05-01",
      searchImpressions: 220000,
      organicClicks: 8800,
      organicCtr: 4.0,
      averagePosition: 12,
      keywordsTop3: 22,
      keywordsTop10: 211,
      rankingImproved: 44,
      rankingDeclined: 21,
      organicSessions: 14200,
      organicUsers: 11800,
      referralSessions: 2200,
      organicLeads: 280,
      organicConversionRate: 2.0,
      backlinks: 3200,
      referringDomains: 480,
      newBacklinks: 62,
      lostBacklinks: 18,
      aeoVisibility: 54,
      geoVisibility: 48,
      localVisibility: 58,
      technicalHealth: 72
    },
    {
      id: "metrics-atlas-2026-05-20",
      workspaceId: "atlas-commerce",
      measuredAt: "2026-05-20",
      searchImpressions: 248000,
      organicClicks: 9600,
      organicCtr: 3.9,
      averagePosition: 10,
      keywordsTop3: 28,
      keywordsTop10: 228,
      rankingImproved: 56,
      rankingDeclined: 19,
      organicSessions: 15800,
      organicUsers: 13200,
      referralSessions: 2400,
      organicLeads: 310,
      organicConversionRate: 2.0,
      backlinks: 3318,
      referringDomains: 502,
      newBacklinks: 84,
      lostBacklinks: 22,
      aeoVisibility: 60,
      geoVisibility: 54,
      localVisibility: 63,
      technicalHealth: 75
    }
  ],
  "vertex-saas": [
    {
      id: "metrics-vertex-2026-05-01",
      workspaceId: "vertex-saas",
      measuredAt: "2026-05-01",
      searchImpressions: 36000,
      organicClicks: 1100,
      organicCtr: 3.1,
      averagePosition: 22,
      keywordsTop3: 6,
      keywordsTop10: 67,
      rankingImproved: 18,
      rankingDeclined: 12,
      organicSessions: 2100,
      organicUsers: 1800,
      referralSessions: 580,
      organicLeads: 42,
      organicConversionRate: 2.0,
      backlinks: 980,
      referringDomains: 210,
      newBacklinks: 14,
      lostBacklinks: 6,
      aeoVisibility: 58,
      geoVisibility: 52,
      localVisibility: 44,
      technicalHealth: 74
    },
    {
      id: "metrics-vertex-2026-05-20",
      workspaceId: "vertex-saas",
      measuredAt: "2026-05-20",
      searchImpressions: 39000,
      organicClicks: 1200,
      organicCtr: 3.1,
      averagePosition: 21,
      keywordsTop3: 7,
      keywordsTop10: 72,
      rankingImproved: 21,
      rankingDeclined: 11,
      organicSessions: 2300,
      organicUsers: 2000,
      referralSessions: 620,
      organicLeads: 48,
      organicConversionRate: 2.1,
      backlinks: 1012,
      referringDomains: 224,
      newBacklinks: 21,
      lostBacklinks: 7,
      aeoVisibility: 63,
      geoVisibility: 58,
      localVisibility: 47,
      technicalHealth: 76
    }
  ]
};

export const growthCyclesByWorkspace: Record<string, OrganicGrowthCycle[]> = {
  "aurora-education": [
    {
      id: "cycle-aurora-may-current",
      workspaceId: "aurora-education",
      period: "May 2026",
      stage: "Act",
      auditId: "scan-aurora-0520",
      baselineSnapshotId: "metrics-aurora-2026-05-01",
      latestSnapshotId: "metrics-aurora-2026-05-20",
      actionsCreated: 8,
      actionsCompleted: 5,
      actionsOverdue: 1,
      reportsPublished: 1,
      nextAuditDue: "2026-06-03"
    },
    {
      id: "cycle-aurora-april",
      workspaceId: "aurora-education",
      period: "April 2026",
      stage: "Report",
      auditId: "scan-aurora-0506",
      baselineSnapshotId: "metrics-aurora-2026-05-01",
      latestSnapshotId: "metrics-aurora-2026-05-01",
      actionsCreated: 6,
      actionsCompleted: 6,
      actionsOverdue: 0,
      reportsPublished: 1,
      nextAuditDue: "2026-05-20"
    }
  ],
  "nimbus-health": [
    {
      id: "cycle-nimbus-may-current",
      workspaceId: "nimbus-health",
      period: "May 2026",
      stage: "Audit",
      auditId: "scan-nimbus-0519",
      baselineSnapshotId: "metrics-nimbus-2026-05-01",
      latestSnapshotId: "metrics-nimbus-2026-05-20",
      actionsCreated: 4,
      actionsCompleted: 1,
      actionsOverdue: 2,
      reportsPublished: 0,
      nextAuditDue: "2026-05-30"
    }
  ],
  "atlas-commerce": [
    {
      id: "cycle-atlas-may-current",
      workspaceId: "atlas-commerce",
      period: "May 2026",
      stage: "Analyse",
      auditId: "scan-atlas-0520",
      baselineSnapshotId: "metrics-atlas-2026-05-01",
      latestSnapshotId: "metrics-atlas-2026-05-20",
      actionsCreated: 6,
      actionsCompleted: 4,
      actionsOverdue: 0,
      reportsPublished: 0,
      nextAuditDue: "2026-06-05"
    }
  ],
  "vertex-saas": [
    {
      id: "cycle-vertex-may-current",
      workspaceId: "vertex-saas",
      period: "May 2026",
      stage: "Act",
      auditId: "scan-vertex-0518",
      baselineSnapshotId: "metrics-vertex-2026-05-01",
      latestSnapshotId: "metrics-vertex-2026-05-20",
      actionsCreated: 3,
      actionsCompleted: 2,
      actionsOverdue: 0,
      reportsPublished: 0,
      nextAuditDue: "2026-06-04"
    }
  ]
};

export const actionItemsByWorkspace: Record<string, ActionItem[]> = {
  "aurora-education": [
    {
      id: "act-aurora-gbp-services",
      workspaceId: "aurora-education",
      source: "local-visibility",
      sourceId: "aurora-gbp",
      title: "Add scholarship services to Google Business Profile",
      impactArea: "local",
      priority: "high",
      status: "Evidence Review",
      executionMode: "outside-rankflow",
      owner: "Rohan Mehta",
      dueDate: "2026-05-28",
      expectedImpact: "Improve local pack relevance for scholarship and admissions searches",
      evidenceRequired: true,
      evidence: [
        {
          id: "ev-aurora-gbp-services",
          submittedAt: "2026-05-22",
          submittedBy: "Rohan Mehta",
          evidenceType: "screenshot",
          label: "GBP service screenshot",
          value: "gbp-services-scholarship.png",
          qualityScore: 78,
          approvalStatus: "Pending"
        }
      ],
      impactScore: 64,
      clientReportContribution: true
    },
    {
      id: "act-aurora-faq-schema",
      workspaceId: "aurora-education",
      source: "ai-suggestion",
      sourceId: "sug-aurora-2",
      title: "Publish eligibility FAQ schema on course pages",
      impactArea: "aeo",
      priority: "medium",
      status: "Done",
      executionMode: "inside-rankflow",
      owner: "Anika Rao",
      dueDate: "2026-05-22",
      expectedImpact: "Lift PAA and answer-block eligibility coverage",
      completedAt: "2026-05-22",
      evidenceRequired: true,
      evidence: [
        {
          id: "ev-aurora-faq-schema",
          submittedAt: "2026-05-22",
          submittedBy: "Anika Rao",
          evidenceType: "url",
          label: "Validated schema URL",
          value: "https://aurora.example/courses/data-science",
          qualityScore: 92,
          approvalStatus: "Approved"
        }
      ],
      impactScore: 82,
      clientReportContribution: true
    },
    {
      id: "act-aurora-geo-evidence",
      workspaceId: "aurora-education",
      source: "local-visibility",
      sourceId: "aurora-geo",
      title: "Add cited outcomes evidence to MBA program pages",
      impactArea: "geo",
      priority: "high",
      status: "In Progress",
      executionMode: "outside-rankflow",
      owner: "Rohan Mehta",
      dueDate: "2026-05-30",
      expectedImpact: "Increase AI answer presence and entity confidence for MBA queries",
      evidenceRequired: true,
      evidence: [],
      impactScore: 51,
      clientReportContribution: false
    },
    {
      id: "act-aurora-title",
      workspaceId: "aurora-education",
      source: "audit",
      sourceId: "TT-03",
      title: "Optimize MBA admissions title and H1",
      impactArea: "visibility",
      priority: "high",
      status: "Done",
      executionMode: "inside-rankflow",
      owner: "Rohan Mehta",
      dueDate: "2026-05-21",
      expectedImpact: "Improve commercial ranking position for MBA admissions",
      completedAt: "2026-05-21",
      evidenceRequired: true,
      evidence: [
        {
          id: "ev-aurora-title",
          submittedAt: "2026-05-21",
          submittedBy: "Rohan Mehta",
          evidenceType: "cms-log",
          label: "CMS publish log",
          value: "cms://aurora/mba-admissions/title-update",
          qualityScore: 88,
          approvalStatus: "Approved"
        }
      ],
      impactScore: 76,
      clientReportContribution: true
    },
    {
      id: "act-aurora-backlinks",
      workspaceId: "aurora-education",
      source: "manual",
      sourceId: "authority-may",
      title: "Recover two lost education directory backlinks",
      impactArea: "authority",
      priority: "medium",
      status: "Blocked",
      executionMode: "outside-rankflow",
      owner: "Maya Iyer",
      dueDate: "2026-05-24",
      expectedImpact: "Recover referral traffic and authority to admissions pages",
      evidenceRequired: true,
      evidence: [],
      impactScore: 0,
      clientReportContribution: false
    }
  ],
  "nimbus-health": [
    {
      id: "act-nimbus-canonical",
      workspaceId: "nimbus-health",
      source: "audit",
      sourceId: "NC-02",
      title: "Fix clinic page canonical conflicts",
      impactArea: "technical",
      priority: "critical",
      status: "In Progress",
      executionMode: "inside-rankflow",
      owner: "Priya Menon",
      dueDate: "2026-05-28",
      expectedImpact: "Resolve canonical chain issues on location pages",
      evidenceRequired: true,
      evidence: [],
      impactScore: 72,
      clientReportContribution: true
    },
    {
      id: "act-nimbus-hero",
      workspaceId: "nimbus-health",
      source: "audit",
      sourceId: "CWV-01",
      title: "Compress location hero images and enable AVIF",
      impactArea: "technical",
      priority: "critical",
      status: "In Progress",
      executionMode: "inside-rankflow",
      owner: "Dev Arora",
      dueDate: "2026-05-29",
      expectedImpact: "Reduce mobile LCP from 5.2s to under 2.5s",
      evidenceRequired: true,
      evidence: [],
      impactScore: 80,
      clientReportContribution: true
    },
    {
      id: "act-nimbus-nap",
      workspaceId: "nimbus-health",
      source: "local-visibility",
      sourceId: "nimbus-nap",
      title: "Resolve NAP inconsistencies across clinic pages",
      impactArea: "local",
      priority: "critical",
      status: "Done",
      executionMode: "outside-rankflow",
      owner: "Priya Menon",
      dueDate: "2026-05-26",
      expectedImpact: "Resolve Google Business Profile NAP mismatch warnings",
      completedAt: "2026-05-26",
      evidenceRequired: true,
      evidence: [
        {
          id: "ev-nimbus-nap",
          submittedAt: "2026-05-26",
          submittedBy: "Priya Menon",
          evidenceType: "screenshot",
          label: "GBP NAP verification",
          value: "nimbus-nap-verified.png",
          qualityScore: 84,
          approvalStatus: "Approved"
        }
      ],
      impactScore: 61,
      clientReportContribution: false
    }
  ],
  "atlas-commerce": [
    {
      id: "act-atlas-canonical",
      workspaceId: "atlas-commerce",
      source: "audit",
      sourceId: "AC-01",
      title: "Audit and fix top 50 PDP canonical tags",
      impactArea: "technical",
      priority: "high",
      status: "In Progress",
      executionMode: "inside-rankflow",
      owner: "Sara Khan",
      dueDate: "2026-05-30",
      expectedImpact: "Consolidate duplicate PDP signals and lift category rankings",
      evidenceRequired: true,
      evidence: [],
      impactScore: 78,
      clientReportContribution: true
    },
    {
      id: "act-atlas-image",
      workspaceId: "atlas-commerce",
      source: "audit",
      sourceId: "AC-02",
      title: "Compress product detail page images and enable WebP/AVIF",
      impactArea: "technical",
      priority: "high",
      status: "Done",
      executionMode: "inside-rankflow",
      owner: "Sara Khan",
      dueDate: "2026-05-23",
      expectedImpact: "Reduce PDP image payload by 60%",
      completedAt: "2026-05-23",
      evidenceRequired: true,
      evidence: [
        {
          id: "ev-atlas-image",
          submittedAt: "2026-05-23",
          submittedBy: "Sara Khan",
          evidenceType: "analytics-snapshot",
          label: "PageSpeed improvement proof",
          value: "atlas-pagespeed-may23.png",
          qualityScore: 91,
          approvalStatus: "Approved"
        }
      ],
      impactScore: 68,
      clientReportContribution: true
    },
    {
      id: "act-atlas-internal",
      workspaceId: "atlas-commerce",
      source: "audit",
      sourceId: "AC-05",
      title: "Improve internal linking from category to product pages",
      impactArea: "technical",
      priority: "medium",
      status: "Done",
      executionMode: "outside-rankflow",
      owner: "Nisha Kapoor",
      dueDate: "2026-05-25",
      expectedImpact: "Lift crawl coverage and distribute page authority",
      completedAt: "2026-05-25",
      evidenceRequired: false,
      evidence: [],
      impactScore: 55,
      clientReportContribution: false
    }
  ],
  "vertex-saas": [
    {
      id: "act-vertex-questions",
      workspaceId: "vertex-saas",
      source: "ai-suggestion",
      sourceId: "sug-vertex-1",
      title: "Add question-led H2s to asana-alternative comparison page",
      impactArea: "aeo",
      priority: "medium",
      status: "In Progress",
      executionMode: "inside-rankflow",
      owner: "Ira Bose",
      dueDate: "2026-05-30",
      expectedImpact: "Improve PAA and answer block eligibility",
      evidenceRequired: true,
      evidence: [],
      impactScore: 62,
      clientReportContribution: true
    },
    {
      id: "act-vertex-proof",
      workspaceId: "vertex-saas",
      source: "audit",
      sourceId: "VS-03",
      title: "Add third-party citations to comparison pages",
      impactArea: "visibility",
      priority: "medium",
      status: "Done",
      executionMode: "inside-rankflow",
      owner: "Ira Bose",
      dueDate: "2026-05-26",
      expectedImpact: "Strengthen E-E-A-T proof points on comparison pages",
      completedAt: "2026-05-26",
      evidenceRequired: true,
      evidence: [
        {
          id: "ev-vertex-proof",
          submittedAt: "2026-05-26",
          submittedBy: "Ira Bose",
          evidenceType: "url",
          label: "Published case study URL",
          value: "https://vertexops.com/case-study/techcorp",
          qualityScore: 88,
          approvalStatus: "Approved"
        }
      ],
      impactScore: 70,
      clientReportContribution: true
    },
    {
      id: "act-vertex-schema",
      workspaceId: "vertex-saas",
      source: "audit",
      sourceId: "VS-04",
      title: "Add FAQPage schema to solution pages",
      impactArea: "aeo",
      priority: "medium",
      status: "Done",
      executionMode: "inside-rankflow",
      owner: "Aarav Shah",
      dueDate: "2026-05-24",
      expectedImpact: "Eligibility for featured snippets and PAA placement",
      completedAt: "2026-05-24",
      evidenceRequired: false,
      evidence: [],
      impactScore: 58,
      clientReportContribution: true
    }
  ]
};

export const expertEfficiencyByWorkspace: Record<string, ExpertEfficiency[]> = {
  "aurora-education": [
    {
      owner: "Rohan Mehta",
      assignedActions: 8,
      completedActions: 6,
      overdueActions: 1,
      averageCompletionDays: 3,
      evidenceApprovalRate: 92,
      impactDelivered: 74,
      clientReportContributions: 4
    },
    {
      owner: "Anika Rao",
      assignedActions: 6,
      completedActions: 3,
      overdueActions: 2,
      averageCompletionDays: 5,
      evidenceApprovalRate: 76,
      impactDelivered: 48,
      clientReportContributions: 2
    }
  ],
  "nimbus-health": [
    {
      owner: "Priya Menon",
      assignedActions: 6,
      completedActions: 2,
      overdueActions: 2,
      averageCompletionDays: 6,
      evidenceApprovalRate: 70,
      impactDelivered: 38,
      clientReportContributions: 1
    },
    {
      owner: "Dev Arora",
      assignedActions: 4,
      completedActions: 2,
      overdueActions: 1,
      averageCompletionDays: 4,
      evidenceApprovalRate: 80,
      impactDelivered: 42,
      clientReportContributions: 2
    }
  ],
  "atlas-commerce": [
    {
      owner: "Sara Khan",
      assignedActions: 5,
      completedActions: 4,
      overdueActions: 0,
      averageCompletionDays: 3,
      evidenceApprovalRate: 88,
      impactDelivered: 62,
      clientReportContributions: 3
    },
    {
      owner: "Nisha Kapoor",
      assignedActions: 4,
      completedActions: 3,
      overdueActions: 0,
      averageCompletionDays: 4,
      evidenceApprovalRate: 85,
      impactDelivered: 54,
      clientReportContributions: 2
    }
  ],
  "vertex-saas": [
    {
      owner: "Ira Bose",
      assignedActions: 4,
      completedActions: 3,
      overdueActions: 0,
      averageCompletionDays: 4,
      evidenceApprovalRate: 82,
      impactDelivered: 58,
      clientReportContributions: 2
    },
    {
      owner: "Aarav Shah",
      assignedActions: 3,
      completedActions: 2,
      overdueActions: 0,
      averageCompletionDays: 5,
      evidenceApprovalRate: 91,
      impactDelivered: 44,
      clientReportContributions: 1
    }
  ]
};

export const aiBrainByWorkspace: Record<string, AiBrainProfile> = {
  "aurora-education": {
    status: "Active",
    lastRunAt: "2026-05-28 14:30",
    confidenceScore: 86,
    dataCoverageScore: 78,
    automationMode: "approval-required",
    insights: [
      {
        id: "brain-insight-aurora-1",
        title: "Organic leads rose after FAQ schema and title updates",
        narrative:
          "Organic leads increased while AEO visibility and top-10 keyword coverage improved after schema and title actions were completed.",
        area: "conversion",
        confidence: 88,
        severity: "medium",
        evidenceRefs: ["metrics-aurora-2026-05-20", "act-aurora-faq-schema", "act-aurora-title"]
      },
      {
        id: "brain-insight-aurora-2",
        title: "GEO is now the weakest high-impact growth lever",
        narrative:
          "The brand has improved search visibility, but AI answer presence trails AEO and local visibility. Evidence blocks and entity disambiguation should move next.",
        area: "geo",
        confidence: 82,
        severity: "high",
        evidenceRefs: ["metrics-aurora-2026-05-20", "aurora-geo"]
      }
    ],
    recommendations: [
      {
        id: "brain-rec-aurora-1",
        title: "Prioritize GEO evidence blocks on MBA pages",
        reason: "GEO visibility remains the weakest growth lever after current cycle actions.",
        targetAction: "act-aurora-geo-evidence",
        priority: "high",
        expectedLift: "Improve AI answer presence by 8-12 points",
        requiresApproval: true
      },
      {
        id: "brain-rec-aurora-2",
        title: "Generate draft client narrative for May report",
        reason: "The latest cycle has enough approved evidence to explain ranking, lead, and AEO gains.",
        targetAction: "rep-aurora-may",
        priority: "medium",
        expectedLift: "Reduce reporting time and improve client clarity",
        requiresApproval: false
      },
      {
        id: "brain-rec-aurora-3",
        title: "Request proof for external GBP service update",
        reason: "GBP action is in evidence review and should not be counted in report impact until approved.",
        targetAction: "act-aurora-gbp-services",
        priority: "high",
        expectedLift: "Protect action quality and expert accountability",
        requiresApproval: true
      }
    ],
    narratives: [
      {
        id: "brain-narrative-aurora-client",
        audience: "client",
        title: "May organic growth story",
        summary:
          "Visibility, organic leads, and answer readiness improved this cycle. The next growth focus is GEO evidence and stronger Google Business Profile proof."
      },
      {
        id: "brain-narrative-aurora-hod",
        audience: "hod",
        title: "Execution efficiency note",
        summary:
          "Rohan delivered high-impact title work but has pending evidence on GBP and GEO tasks. Anika has the strongest evidence approval rate this cycle."
      }
    ],
    risks: [
      {
        id: "brain-risk-aurora-1",
        title: "External GEO evidence work lacks approved proof",
        severity: "high",
        mitigation: "Request URL, CMS log, or screenshot evidence before including it in the next client report."
      },
      {
        id: "brain-risk-aurora-2",
        title: "Lost backlinks may weaken admissions-page authority",
        severity: "medium",
        mitigation: "Recover education directory links or replace with higher-authority referring domains."
      }
    ]
  },
  "nimbus-health": {
    status: "Active",
    lastRunAt: "2026-05-28 09:15",
    confidenceScore: 74,
    dataCoverageScore: 68,
    automationMode: "approval-required",
    insights: [
      {
        id: "brain-insight-nimbus-1",
        title: "Core Web Vitals is the primary traffic blocker",
        narrative:
          "Mobile LCP above 5 seconds and canonical conflicts are preventing Google from crawl-efficiently ranking location pages. Fixing these two issues should precede any content or authority work.",
        area: "traffic",
        confidence: 76,
        severity: "critical",
        evidenceRefs: ["scan-nimbus-0519", "act-nimbus-hero", "act-nimbus-canonical"]
      },
      {
        id: "brain-insight-nimbus-2",
        title: "Local SEO issues compound Google Business Profile risk",
        narrative:
          "NAP inconsistencies and GBP photo freshness are pulling down local pack visibility for clinical location searches. This directly impacts the clinic near me queries driving new patients.",
        area: "local",
        confidence: 71,
        severity: "high",
        evidenceRefs: ["nimbus-health", "act-nimbus-nap"]
      }
    ],
    recommendations: [
      {
        id: "brain-rec-nimbus-1",
        title: "Escalate hero image compression to immediate priority",
        reason: "Mobile LCP of 5.2s is a confirmed critical issue that blocks ranking improvement.",
        targetAction: "act-nimbus-hero",
        priority: "critical",
        expectedLift: "LCP under 2.5s, potential Core Web Vitals upgrade",
        requiresApproval: true
      },
      {
        id: "brain-rec-nimbus-2",
        title: "Generate risk-recovery client narrative for May",
        reason: "May report should open with the NAP fix as a demonstrated win, then address performance remediation plan.",
        targetAction: "rep-nimbus-may",
        priority: "high",
        expectedLift: "Shift client perception from At Risk to recovery in progress",
        requiresApproval: false
      }
    ],
    narratives: [
      {
        id: "brain-narrative-nimbus-client",
        audience: "client",
        title: "May risk recovery and technical remediation plan",
        summary:
          "Critical technical issues — page speed and canonical chains — were identified and are being remediated. NAP inconsistencies have been resolved. The next scan will confirm improvements before the June growth cycle."
      },
      {
        id: "brain-narrative-nimbus-hod",
        audience: "hod",
        title: "Nimbus recovery execution status",
        summary:
          "Priya is managing canonical fix; Dev Arora is leading hero image compression. Two of three tasks are in-progress with evidence pending. Recovery path is clear if performance issues resolve with next sprint."
      }
    ],
    risks: [
      {
        id: "brain-risk-nimbus-1",
        title: "Hero image compression may require developer deployment",
        severity: "high",
        mitigation: "Confirm AVIF implementation is operator-accessible or schedule with dev team before May 30 deadline."
      },
      {
        id: "brain-risk-nimbus-2",
        title: "Canonical conflict recurrence on new location pages",
        severity: "medium",
        mitigation: "Establish canonical rule in CMS template so new location pages auto-canonicalize correctly."
      }
    ]
  },
  "atlas-commerce": {
    status: "Active",
    lastRunAt: "2026-05-28 11:00",
    confidenceScore: 81,
    dataCoverageScore: 79,
    automationMode: "approval-required",
    insights: [
      {
        id: "brain-insight-atlas-1",
        title: "Image compression delivered measurable improvement",
        narrative:
          "PDPs processed through WebP/AVIF pipeline show improved Core Web Vitals and lower bounce rates on product listing pages.",
        area: "traffic",
        confidence: 79,
        severity: "medium",
        evidenceRefs: ["scan-atlas-0520", "act-atlas-image"]
      },
      {
        id: "brain-insight-atlas-2",
        title: "Variant canonical rules are diluting category authority",
        narrative:
          "Color and size variant pagescanonicalizing to themselves fragment link equity. Consolidating these to master PDPs should improve category rankings.",
        area: "technical",
        confidence: 84,
        severity: "high",
        evidenceRefs: ["scan-atlas-0520", "act-atlas-canonical"]
      }
    ],
    recommendations: [
      {
        id: "brain-rec-atlas-1",
        title: "Complete canonical audit for all color and size variants",
        reason: "Variant canonical consolidation is the highest-impact technical priority for atlas-commerce.",
        targetAction: "act-atlas-canonical",
        priority: "high",
        expectedLift: "Recover 10-15% of fragmented category page authority",
        requiresApproval: true
      },
      {
        id: "brain-rec-atlas-2",
        title: "Write May eCommerce SEO report narrative",
        reason: "Image optimization proof and canonical fix plan form the core of May client report.",
        targetAction: "rep-atlas-may",
        priority: "medium",
        expectedLift: "Demonstrate concrete progress to maintain client confidence",
        requiresApproval: false
      }
    ],
    narratives: [
      {
        id: "brain-narrative-atlas-client",
        audience: "client",
        title: "May eCommerce SEO progress and June optimization roadmap",
        summary:
          "Image performance improvements are live and measuring well. June focus is canonical consolidation across the top-50 product pages, followed by internal linking improvements to distribute authority across category listings."
      },
      {
        id: "brain-narrative-atlas-hod",
        audience: "hod",
        title: "Atlas execution status",
        summary:
          "Sara Khan completed image optimization with strong evidence approval. Canonical audit is in progress. Nisha Kapoor's internal linking work is done but evidence-free — client value unclear."
      }
    ],
    risks: [
      {
        id: "brain-risk-atlas-1",
        title: "Variant canonical fix requires CMS access for bulk updates",
        severity: "high",
        mitigation: "Confirm whether CMS supports bulk canonical rule application before May 30 deadline."
      },
      {
        id: "brain-risk-atlas-2",
        title: "Internal linking improvement lacks implementation proof",
        severity: "low",
        mitigation: "Request URL evidence or analytics screenshot showing improved crawl path."
      }
    ]
  },
  "vertex-saas": {
    status: "Active",
    lastRunAt: "2026-05-28 08:45",
    confidenceScore: 77,
    dataCoverageScore: 72,
    automationMode: "approval-required",
    insights: [
      {
        id: "brain-insight-vertex-1",
        title: "AEO progress is real but concentrated in FAQ schema",
        narrative:
          "Adding FAQPage schema to solution pages has improved PAA eligibility. Continued AEO gains depend on question-led heading structure on comparison pages.",
        area: "aeo",
        confidence: 78,
        severity: "medium",
        evidenceRefs: ["scan-vertex-0518", "act-vertex-schema", "act-vertex-questions"]
      },
      {
        id: "brain-insight-vertex-2",
        title: "Comparison content lacks third-party credibility signals",
        narrative:
          "VertexOps comparison pages are missing citations, case studies, and authoritative references that AI overview systems use to validate claims.",
        area: "geo",
        confidence: 73,
        severity: "medium",
        evidenceRefs: ["scan-vertex-0518", "act-vertex-proof"]
      }
    ],
    recommendations: [
      {
        id: "brain-rec-vertex-1",
        title: "Complete question-led H2 additions on asana-alternative page",
        reason: "PAA coverage is undershooting target after FAQ schema work; heading structure is the next lever.",
        targetAction: "act-vertex-questions",
        priority: "medium",
        expectedLift: "Improve PAA coverage by 20-30% for comparison queries",
        requiresApproval: true
      },
      {
        id: "brain-rec-vertex-2",
        title: "Draft May SaaS visibility narrative for client report",
        reason: "FAQ schema work provides a clear May narrative win. GEO gap should be framed as June priority.",
        targetAction: "rep-vertex-may",
        priority: "medium",
        expectedLift: "Positive May report framing with clear June roadmap",
        requiresApproval: false
      }
    ],
    narratives: [
      {
        id: "brain-narrative-vertex-client",
        audience: "client",
        title: "May SaaS visibility progress and comparison content roadmap",
        summary:
          "Schema improvements are lifting answer-engine eligibility. June focus is building E-E-A-T proof points through case studies and third-party citations on comparison pages. Keyword visibility trend is positive."
      },
      {
        id: "brain-narrative-vertex-hod",
        audience: "hod",
        title: "VertexOps execution status",
        summary:
          "Ira Bose completed proof-point additions with strong evidence. Question-led H2 work is in progress. Evidence approval rates are strong overall."
      }
    ],
    risks: [
      {
        id: "brain-risk-vertex-1",
        title: "Comparison page E-E-A-T gap requires external content team input",
        severity: "medium",
        mitigation: "Confirm whether case study and citation work can be done in-house or needs external content partner."
      },
      {
        id: "brain-risk-vertex-2",
        title: "June authority goals depend on backlink recovery",
        severity: "low",
        mitigation: "Monitor backlink profile and consider outreach if new referring domains are lost in June."
      }
    ]
  }
};

const auroraCrawlerPages: CrawlerPageSnapshot[] = [
  {
    id: "crawl-aurora-home",
    url: "https://aurora.edu/",
    priority: "core",
    statusCode: 200,
    title: "Aurora Education Group | Future-ready degrees",
    metaDescription: "Degree and admissions programs at Aurora Education Group.",
    h1: "Aurora Education Group",
    canonicalUrl: "https://aurora.edu/",
    indexable: true,
    schemaTypes: ["Organization", "WebSite"],
    missingImageAlts: 0,
    brokenInternalLinks: 0,
    loadTimeMs: 1800
  },
  {
    id: "crawl-aurora-mba",
    url: "https://aurora.edu/programs/mba",
    priority: "core",
    statusCode: 200,
    title: "MBA Admissions | Aurora Education Group",
    metaDescription: "Join the Aurora MBA program with career-focused admissions support.",
    h1: "MBA Admissions",
    canonicalUrl: "https://aurora.edu/programs/mba",
    indexable: true,
    schemaTypes: ["Course", "FAQPage"],
    missingImageAlts: 0,
    brokenInternalLinks: 0,
    loadTimeMs: 2100
  },
  {
    id: "crawl-aurora-mba-duplicate",
    url: "https://aurora.edu/programs/mba/eligibility",
    priority: "important",
    statusCode: 200,
    title: null,
    metaDescription: "Join the Aurora MBA program with career-focused admissions support.",
    h1: null,
    canonicalUrl: "https://aurora.edu/programs",
    indexable: false,
    schemaTypes: [],
    missingImageAlts: 2,
    brokenInternalLinks: 3,
    loadTimeMs: 3200
  },
  {
    id: "crawl-aurora-scholarships",
    url: "https://aurora.edu/scholarships",
    priority: "important",
    statusCode: 200,
    title: "Scholarships | Aurora Education Group",
    metaDescription: "Scholarships and financial aid support for Aurora students.",
    h1: "Scholarships",
    canonicalUrl: "https://aurora.edu/scholarships",
    indexable: true,
    schemaTypes: ["FAQPage"],
    missingImageAlts: 1,
    brokenInternalLinks: 1,
    loadTimeMs: 2600
  },
  {
    id: "crawl-aurora-campus",
    url: "https://aurora.edu/campuses/delhi",
    priority: "supporting",
    statusCode: 200,
    title: "Delhi Campus | Aurora Education Group",
    metaDescription: "Join the Aurora MBA program with career-focused admissions support.",
    h1: "Delhi Campus",
    canonicalUrl: "https://aurora.edu/campuses/delhi/",
    indexable: true,
    schemaTypes: ["LocalBusiness"],
    missingImageAlts: 0,
    brokenInternalLinks: 0,
    loadTimeMs: 1950
  }
];

const auroraCrawlerEvaluation: CrawlerEvaluation = evaluateCrawlerPages(auroraCrawlerPages);

const auroraScreamingFrogCsv = `Address,Status Code,Title 1,Meta Description 1,H1-1,Canonical Link Element 1,Indexability,Images Missing Alt Text,Broken Internal Links,Response Time (ms)
https://aurora.edu/programs/mba,200,MBA Admissions | Aurora Education Group,Join the Aurora MBA program with career-focused admissions support.,MBA Admissions,https://aurora.edu/programs/mba,Indexable,0,0,1450
https://aurora.edu/programs/mba/eligibility,200,,Join the Aurora MBA program with career-focused admissions support.,,https://aurora.edu/programs,Non-Indexable,2,3,3210
https://aurora.edu/scholarships,200,Scholarships | Aurora Education Group,Scholarships and financial aid support for Aurora students.,Scholarships,https://aurora.edu/scholarships,Indexable,1,1,2620
https://aurora.edu/campuses/delhi,404,Delhi Campus | Aurora Education Group,Join the Aurora MBA program with career-focused admissions support.,Delhi Campus,https://aurora.edu/campuses/delhi,Indexable,0,0,980`;

const auroraScreamingFrogEvaluation: CrawlerEvaluation = evaluateScreamingFrogCsv(auroraScreamingFrogCsv);

export const ownCrawlerByWorkspace: Record<string, CrawlerEvaluation> = {
  "aurora-education": auroraCrawlerEvaluation,
  "nimbus-health": {
    sourceStatus: {
      source: "own-crawler",
      label: "Own crawler",
      status: "Connected",
      coverageScore: 74,
      lastSyncedAt: "2026-05-19",
      recordsAvailable: 316,
      primaryUse: "Technical on-page audit for titles, H1s, canonicals, indexability, links, schema, and images"
    },
    summary: { pagesCrawled: 316, healthyPages: 58, findings: 103, criticalFindings: 14, missingTitles: 8, missingH1s: 3, duplicateMetaDescriptions: 12, canonicalConflicts: 9, blockedImportantPages: 2, brokenInternalLinks: 18, schemaMissing: 11, imageAltMissing: 22, slowPages: 27, statusCodeErrors: 6 },
    ruleChecks: [
      { id: "NC-nimbus-1", label: "Missing title", description: "Page is missing a title tag", category: "technical", source: "own-crawler", affectedUrls: 8, passedUrls: 308, failedUrls: 8, severity: "critical" },
      { id: "NC-nimbus-2", label: "Canonical conflict", description: "Canonical URL does not match the canonical link element", category: "indexability", source: "own-crawler", affectedUrls: 9, passedUrls: 307, failedUrls: 9, severity: "critical" },
      { id: "NC-nimbus-3", label: "Slow page", description: "Page load time exceeds 3 seconds on mobile", category: "performance", source: "own-crawler", affectedUrls: 27, passedUrls: 289, failedUrls: 27, severity: "high" },
      { id: "NC-nimbus-4", label: "Missing image alt", description: "Images missing alt attribute", category: "content", source: "own-crawler", affectedUrls: 22, passedUrls: 294, failedUrls: 22, severity: "high" },
      { id: "NC-nimbus-5", label: "Broken internal links", description: "Internal links returning 404 or 5xx", category: "internal-linking", source: "own-crawler", affectedUrls: 18, passedUrls: 298, failedUrls: 18, severity: "high" },
      { id: "NC-nimbus-6", label: "Missing schema", description: "Core pages missing required structured data", category: "schema", source: "own-crawler", affectedUrls: 11, passedUrls: 305, failedUrls: 11, severity: "medium" }
    ],
    findings: [
      { id: "NF-nimbus-1", rule: "canonical-conflict", label: "Canonical conflict", severity: "critical", url: "https://nimbushealth.com/clinics/mumbai", detail: "Canonical points to /clinigs/mumbai" },
      { id: "NF-nimbus-2", rule: "slow-page", label: "Slow page", severity: "critical", url: "https://nimbushealth.com/clinics/delhi", detail: "Mobile LCP 5.2s, exceeds 4s threshold" },
      { id: "NF-nimbus-3", rule: "missing-title", label: "Missing title", severity: "high", url: "https://nimbushealth.com/family-clinic", detail: "Title tag is empty" }
    ]
  },
  "atlas-commerce": {
    sourceStatus: {
      source: "own-crawler",
      label: "Own crawler",
      status: "Connected",
      coverageScore: 81,
      lastSyncedAt: "2026-05-20",
      recordsAvailable: 1000,
      primaryUse: "Technical on-page audit for titles, H1s, canonicals, indexability, links, schema, and images"
    },
    summary: { pagesCrawled: 1000, healthyPages: 241, findings: 114, criticalFindings: 6, missingTitles: 4, missingH1s: 2, duplicateMetaDescriptions: 18, canonicalConflicts: 11, blockedImportantPages: 0, brokenInternalLinks: 14, schemaMissing: 9, imageAltMissing: 31, slowPages: 19, statusCodeErrors: 6 },
    ruleChecks: [
      { id: "AC-atlas-1", label: "Variant canonical rules inconsistent", description: "Color and size variants do not follow master PDP canonical rule", category: "technical", source: "own-crawler", affectedUrls: 11, passedUrls: 989, failedUrls: 11, severity: "high" },
      { id: "AC-atlas-2", label: "Large PDP image payload", description: "Product detail page images exceed 500KB total", category: "performance", source: "own-crawler", affectedUrls: 19, passedUrls: 981, failedUrls: 19, severity: "high" },
      { id: "AC-atlas-3", label: "Missing image alt", description: "Product images missing alt text", category: "content", source: "own-crawler", affectedUrls: 31, passedUrls: 969, failedUrls: 31, severity: "high" },
      { id: "AC-atlas-4", label: "Duplicate meta descriptions", description: "Multiple PDPs share identical meta descriptions", category: "technical", source: "own-crawler", affectedUrls: 18, passedUrls: 982, failedUrls: 18, severity: "medium" },
      { id: "AC-atlas-5", label: "Low category-to-product link coverage", description: "Category pages link to fewer than 60% of their child products", category: "internal-linking", source: "own-crawler", affectedUrls: 14, passedUrls: 986, failedUrls: 14, severity: "medium" }
    ],
    findings: [
      { id: "AF-atlas-1", rule: "canonical-conflict", label: "Variant canonical rules inconsistent", severity: "high", url: "https://atlascommerce.com/products/linen-shirt?color=sage", detail: "Variant canonicalizes to itself instead of master PDP" },
      { id: "AF-atlas-2", rule: "slow-page", label: "Large PDP image payload", severity: "medium", url: "https://atlascommerce.com/products/linen-shirt?size=L", detail: "Total image payload 1.8MB on mobile" }
    ]
  },
  "vertex-saas": {
    sourceStatus: {
      source: "own-crawler",
      label: "Own crawler",
      status: "Connected",
      coverageScore: 68,
      lastSyncedAt: "2026-05-18",
      recordsAvailable: 184,
      primaryUse: "Technical on-page audit for titles, H1s, canonicals, indexability, links, schema, and images"
    },
    summary: { pagesCrawled: 184, healthyPages: 44, findings: 54, criticalFindings: 4, missingTitles: 2, missingH1s: 1, duplicateMetaDescriptions: 6, canonicalConflicts: 3, blockedImportantPages: 0, brokenInternalLinks: 4, schemaMissing: 7, imageAltMissing: 12, slowPages: 8, statusCodeErrors: 2 },
    ruleChecks: [
      { id: "VS-vertex-1", label: "Missing OG images", description: "Comparison and pricing pages missing Open Graph image tags", category: "technical", source: "own-crawler", affectedUrls: 8, passedUrls: 176, failedUrls: 8, severity: "low" },
      { id: "VS-vertex-2", label: "Missing question-led headings", description: "Comparison pages lack H2 sections that answer PAA questions", category: "aeo", source: "own-crawler", affectedUrls: 12, passedUrls: 172, failedUrls: 12, severity: "medium" },
      { id: "VS-vertex-3", label: "Comparison pages lack proof points", description: "Asana alternative comparison page has no third-party citations or case studies", category: "content", source: "own-crawler", affectedUrls: 7, passedUrls: 177, failedUrls: 7, severity: "medium" },
      { id: "VS-vertex-4", label: "Missing schema", description: "Solution pages missing FAQPage or HowTo schema", category: "schema", source: "own-crawler", affectedUrls: 7, passedUrls: 177, failedUrls: 7, severity: "medium" },
      { id: "VS-vertex-5", label: "Missing image alt", description: "Homepage and solution page images missing alt text", category: "content", source: "own-crawler", affectedUrls: 12, passedUrls: 172, failedUrls: 12, severity: "medium" }
    ],
    findings: [
      { id: "VF-vertex-1", rule: "schema-missing", label: "Missing schema", severity: "medium", url: "https://vertexops.com/compare/asana-alternative", detail: "No FAQPage or HowTo schema found" },
      { id: "VF-vertex-2", rule: "slow-page", label: "Slow page", severity: "medium", url: "https://vertexops.com/pricing", detail: "Pricing page load time 4.1s on mobile" }
    ]
  }
};

export const screamingFrogByWorkspace: Record<string, CrawlerEvaluation> = {
  "aurora-education": auroraScreamingFrogEvaluation,
  "nimbus-health": {
    sourceStatus: {
      source: "screaming-frog",
      label: "Screaming Frog",
      status: "Import Ready",
      coverageScore: 62,
      lastSyncedAt: "2026-05-19",
      recordsAvailable: 316,
      primaryUse: "Deep crawl audit with Screaming Frog SEO Spider"
    },
    summary: { pagesCrawled: 316, healthyPages: 58, findings: 103, criticalFindings: 14, missingTitles: 8, missingH1s: 3, duplicateMetaDescriptions: 12, canonicalConflicts: 9, blockedImportantPages: 2, brokenInternalLinks: 18, schemaMissing: 11, imageAltMissing: 22, slowPages: 27, statusCodeErrors: 6 },
    ruleChecks: [
      { id: "SF-nimbus-1", label: "Missing title", description: "Page is missing a title tag", category: "technical", source: "screaming-frog", affectedUrls: 8, passedUrls: 308, failedUrls: 8, severity: "critical" },
      { id: "SF-nimbus-2", label: "Canonical conflict", description: "Canonical URL does not match the canonical link element", category: "indexability", source: "screaming-frog", affectedUrls: 9, passedUrls: 307, failedUrls: 9, severity: "critical" },
      { id: "SF-nimbus-3", label: "Slow page", description: "Page load time exceeds 3 seconds on mobile", category: "performance", source: "screaming-frog", affectedUrls: 27, passedUrls: 289, failedUrls: 27, severity: "high" },
      { id: "SF-nimbus-4", label: "Broken internal links", description: "Internal links returning 404 or 5xx", category: "internal-linking", source: "screaming-frog", affectedUrls: 18, passedUrls: 298, failedUrls: 18, severity: "high" }
    ],
    findings: [
      { id: "SFF-nimbus-1", rule: "canonical-conflict", label: "Canonical conflict", severity: "critical", url: "https://nimbushealth.com/clinics/mumbai", detail: "Canonical points to /clinigs/mumbai (typo in URL)" },
      { id: "SFF-nimbus-2", rule: "slow-page", label: "Slow page", severity: "critical", url: "https://nimbushealth.com/clinics/delhi", detail: "Mobile LCP 5.2s" }
    ]
  },
  "atlas-commerce": {
    sourceStatus: {
      source: "screaming-frog",
      label: "Screaming Frog",
      status: "Import Ready",
      coverageScore: 79,
      lastSyncedAt: "2026-05-20",
      recordsAvailable: 1000,
      primaryUse: "Deep crawl audit with Screaming Frog SEO Spider"
    },
    summary: { pagesCrawled: 1000, healthyPages: 241, findings: 114, criticalFindings: 6, missingTitles: 4, missingH1s: 2, duplicateMetaDescriptions: 18, canonicalConflicts: 11, blockedImportantPages: 0, brokenInternalLinks: 14, schemaMissing: 9, imageAltMissing: 31, slowPages: 19, statusCodeErrors: 6 },
    ruleChecks: [
      { id: "SF-atlas-1", label: "Variant canonical rules inconsistent", description: "Color and size variants do not follow master PDP canonical rule", category: "technical", source: "screaming-frog", affectedUrls: 11, passedUrls: 989, failedUrls: 11, severity: "high" },
      { id: "SF-atlas-2", label: "Large PDP image payload", description: "Product detail page images exceed 500KB total", category: "performance", source: "screaming-frog", affectedUrls: 19, passedUrls: 981, failedUrls: 19, severity: "high" },
      { id: "SF-atlas-3", label: "Duplicate meta descriptions", description: "Multiple PDPs share identical meta descriptions", category: "technical", source: "screaming-frog", affectedUrls: 18, passedUrls: 982, failedUrls: 18, severity: "medium" },
      { id: "SF-atlas-4", label: "Missing image alt", description: "Product images missing alt text", category: "content", source: "screaming-frog", affectedUrls: 31, passedUrls: 969, failedUrls: 31, severity: "high" }
    ],
    findings: [
      { id: "SFF-atlas-1", rule: "canonical-conflict", label: "Variant canonical rules inconsistent", severity: "high", url: "https://atlascommerce.com/products/linen-shirt?color=sage", detail: "Variant canonicalizes to itself instead of master PDP" }
    ]
  },
  "vertex-saas": {
    sourceStatus: {
      source: "screaming-frog",
      label: "Screaming Frog",
      status: "Import Ready",
      coverageScore: 61,
      lastSyncedAt: "2026-05-18",
      recordsAvailable: 184,
      primaryUse: "Deep crawl audit with Screaming Frog SEO Spider"
    },
    summary: { pagesCrawled: 184, healthyPages: 44, findings: 54, criticalFindings: 4, missingTitles: 2, missingH1s: 1, duplicateMetaDescriptions: 6, canonicalConflicts: 3, blockedImportantPages: 0, brokenInternalLinks: 4, schemaMissing: 7, imageAltMissing: 12, slowPages: 8, statusCodeErrors: 2 },
    ruleChecks: [
      { id: "SF-vertex-1", label: "Missing OG images", description: "Pricing and comparison pages missing Open Graph image tags", category: "technical", source: "screaming-frog", affectedUrls: 8, passedUrls: 176, failedUrls: 8, severity: "low" },
      { id: "SF-vertex-2", label: "Missing question-led headings", description: "Comparison pages lack H2 sections that answer PAA questions", category: "aeo", source: "screaming-frog", affectedUrls: 12, passedUrls: 172, failedUrls: 12, severity: "medium" },
      { id: "SF-vertex-3", label: "Comparison pages lack proof points", description: "Asana alternative comparison page has no third-party citations or case studies", category: "content", source: "screaming-frog", affectedUrls: 7, passedUrls: 177, failedUrls: 7, severity: "medium" }
    ],
    findings: [
      { id: "SFF-vertex-1", rule: "schema-missing", label: "Missing schema", severity: "medium", url: "https://vertexops.com/compare/asana-alternative", detail: "No FAQPage or HowTo schema found" }
    ]
  }
};

export const auditIntelligenceByWorkspace: Record<string, AuditIntelligenceStack> = {
  "aurora-education": {
    workspaceId: "aurora-education",
    sourceStatuses: [
      {
        ...ownCrawlerByWorkspace["aurora-education"].sourceStatus
      },
      {
        ...auroraScreamingFrogEvaluation.sourceStatus
      },
      {
        source: "gsc",
        label: "Google Search Console",
        status: "Connected",
        coverageScore: 91,
        lastSyncedAt: "2026-05-28",
        recordsAvailable: 18400,
        primaryUse: "Queries, impressions, clicks, CTR, and landing pages"
      },
      {
        source: "ga4",
        label: "Google Analytics 4",
        status: "Connected",
        coverageScore: 86,
        lastSyncedAt: "2026-05-28",
        recordsAvailable: 9800,
        primaryUse: "Organic sessions, referral traffic, leads, and conversions"
      },
      {
        source: "dataforseo",
        label: "DataForSEO",
        status: "Import Ready",
        coverageScore: 69,
        lastSyncedAt: "2026-05-27",
        recordsAvailable: 151,
        primaryUse: "Rank tracking, SERP features, and competitor gaps"
      },
      {
        source: "ahrefs",
        label: "Ahrefs",
        status: "Needs Setup",
        coverageScore: 0,
        lastSyncedAt: "Not connected",
        recordsAvailable: 0,
        primaryUse: "Backlinks and authority"
      },
      {
        source: "semrush",
        label: "Semrush",
        status: "Needs Setup",
        coverageScore: 0,
        lastSyncedAt: "Not connected",
        recordsAvailable: 0,
        primaryUse: "Competitor visibility and keyword authority"
      },
      {
        source: "claude-brain",
        label: "Claude SEO Brain",
        status: "Connected",
        coverageScore: 86,
        lastSyncedAt: "2026-05-28 15:00",
        recordsAvailable: 18,
        primaryUse: "Deep interpretation, prioritization, actions, and report narratives"
      }
    ],
    technicalChecks: [
      ...auroraCrawlerEvaluation.ruleChecks,
      ...auroraScreamingFrogEvaluation.ruleChecks
    ],
    searchPerformance: [
      { id: "sp-aurora-impressions", source: "gsc", label: "Search impressions", value: 134000, delta: 34000, category: "impressions" },
      { id: "sp-aurora-clicks", source: "gsc", label: "Organic clicks", value: 6100, delta: 1900, category: "clicks" },
      { id: "sp-aurora-ctr", source: "gsc", label: "Organic CTR", value: 4.6, delta: 0.4, category: "ctr" },
      { id: "sp-aurora-sessions", source: "ga4", label: "Organic sessions", value: 9800, delta: 2200, category: "sessions" },
      { id: "sp-aurora-leads", source: "ga4", label: "Organic leads", value: 318, delta: 108, category: "leads" }
    ],
    authoritySignals: [
      { id: "as-aurora-backlinks", source: "dataforseo", label: "Backlinks", value: 1918, delta: 78, category: "backlinks" },
      { id: "as-aurora-refdomains", source: "dataforseo", label: "Referring domains", value: 348, delta: 26, category: "referring-domains" },
      { id: "as-aurora-rank", source: "dataforseo", label: "Keyword rank movement", value: 61, delta: 23, category: "keyword-rank" },
      { id: "as-aurora-gap", source: "semrush", label: "Competitor gap", value: 14, delta: -5, category: "competitor-gap" }
    ],
    claudeBrain: {
      id: "claude-audit-aurora-0528",
      status: "Ready",
      inputSources: ["own-crawler", "screaming-frog", "gsc", "ga4", "dataforseo", "claude-brain"],
      confidenceScore: 86,
      promptVersion: "seo-brain-v1",
      findingsGenerated: 18,
      actionsGenerated: 9,
      reportNarrativesGenerated: 2,
      requiresHumanApproval: true,
      lastRunAt: "2026-05-28 15:00"
    }
  },
  "nimbus-health": {
    workspaceId: "nimbus-health",
    sourceStatuses: [
      { ...ownCrawlerByWorkspace["nimbus-health"].sourceStatus },
      { ...screamingFrogByWorkspace["nimbus-health"].sourceStatus },
      {
        source: "gsc",
        label: "Google Search Console",
        status: "Connected",
        coverageScore: 58,
        lastSyncedAt: "2026-05-28",
        recordsAvailable: 9200,
        primaryUse: "Queries, impressions, clicks, CTR, and landing pages"
      },
      {
        source: "ga4",
        label: "Google Analytics 4",
        status: "Connected",
        coverageScore: 62,
        lastSyncedAt: "2026-05-28",
        recordsAvailable: 7400,
        primaryUse: "Organic sessions, referral traffic, leads, and conversions"
      },
      {
        source: "dataforseo",
        label: "DataForSEO",
        status: "Import Ready",
        coverageScore: 41,
        lastSyncedAt: "2026-05-27",
        recordsAvailable: 84,
        primaryUse: "Rank tracking, SERP features, and competitor gaps"
      },
      {
        source: "ahrefs",
        label: "Ahrefs",
        status: "Needs Setup",
        coverageScore: 0,
        lastSyncedAt: "Not connected",
        recordsAvailable: 0,
        primaryUse: "Backlinks and authority"
      },
      {
        source: "semrush",
        label: "Semrush",
        status: "Needs Setup",
        coverageScore: 0,
        lastSyncedAt: "Not connected",
        recordsAvailable: 0,
        primaryUse: "Competitor visibility and keyword authority"
      },
      {
        source: "claude-brain",
        label: "Claude SEO Brain",
        status: "Connected",
        coverageScore: 74,
        lastSyncedAt: "2026-05-28 09:15",
        recordsAvailable: 12,
        primaryUse: "Deep interpretation, prioritization, actions, and report narratives"
      }
    ],
    technicalChecks: [
      ...ownCrawlerByWorkspace["nimbus-health"].ruleChecks,
      ...screamingFrogByWorkspace["nimbus-health"].ruleChecks
    ],
    searchPerformance: [
      { id: "sp-nimbus-impressions", source: "gsc", label: "Search impressions", value: 41000, delta: -7000, category: "impressions" },
      { id: "sp-nimbus-clicks", source: "gsc", label: "Organic clicks", value: 980, delta: -220, category: "clicks" },
      { id: "sp-nimbus-ctr", source: "gsc", label: "Organic CTR", value: 2.4, delta: -0.1, category: "ctr" },
      { id: "sp-nimbus-sessions", source: "ga4", label: "Organic sessions", value: 1800, delta: -300, category: "sessions" },
      { id: "sp-nimbus-leads", source: "ga4", label: "Organic leads", value: 29, delta: -9, category: "leads" }
    ],
    authoritySignals: [
      { id: "as-nimbus-backlinks", source: "dataforseo", label: "Backlinks", value: 598, delta: -22, category: "backlinks" },
      { id: "as-nimbus-refdomains", source: "dataforseo", label: "Referring domains", value: 82, delta: -6, category: "referring-domains" },
      { id: "as-nimbus-rank", source: "dataforseo", label: "Keyword rank movement", value: -15, delta: -15, category: "keyword-rank" }
    ],
    claudeBrain: {
      id: "claude-audit-nimbus-0528",
      status: "Needs Approval",
      inputSources: ["own-crawler", "screaming-frog", "gsc", "ga4", "dataforseo", "claude-brain"],
      confidenceScore: 74,
      promptVersion: "seo-brain-v1",
      findingsGenerated: 12,
      actionsGenerated: 7,
      reportNarrativesGenerated: 1,
      requiresHumanApproval: true,
      lastRunAt: "2026-05-28 09:15"
    }
  },
  "atlas-commerce": {
    workspaceId: "atlas-commerce",
    sourceStatuses: [
      { ...ownCrawlerByWorkspace["atlas-commerce"].sourceStatus },
      { ...screamingFrogByWorkspace["atlas-commerce"].sourceStatus },
      {
        source: "gsc",
        label: "Google Search Console",
        status: "Connected",
        coverageScore: 88,
        lastSyncedAt: "2026-05-28",
        recordsAvailable: 22100,
        primaryUse: "Queries, impressions, clicks, CTR, and landing pages"
      },
      {
        source: "ga4",
        label: "Google Analytics 4",
        status: "Connected",
        coverageScore: 85,
        lastSyncedAt: "2026-05-28",
        recordsAvailable: 14800,
        primaryUse: "Organic sessions, referral traffic, leads, and conversions"
      },
      {
        source: "dataforseo",
        label: "DataForSEO",
        status: "Import Ready",
        coverageScore: 74,
        lastSyncedAt: "2026-05-27",
        recordsAvailable: 228,
        primaryUse: "Rank tracking, SERP features, and competitor gaps"
      },
      {
        source: "ahrefs",
        label: "Ahrefs",
        status: "Needs Setup",
        coverageScore: 0,
        lastSyncedAt: "Not connected",
        recordsAvailable: 0,
        primaryUse: "Backlinks and authority"
      },
      {
        source: "semrush",
        label: "Semrush",
        status: "Needs Setup",
        coverageScore: 0,
        lastSyncedAt: "Not connected",
        recordsAvailable: 0,
        primaryUse: "Competitor visibility and keyword authority"
      },
      {
        source: "claude-brain",
        label: "Claude SEO Brain",
        status: "Connected",
        coverageScore: 81,
        lastSyncedAt: "2026-05-28 11:00",
        recordsAvailable: 15,
        primaryUse: "Deep interpretation, prioritization, actions, and report narratives"
      }
    ],
    technicalChecks: [
      ...ownCrawlerByWorkspace["atlas-commerce"].ruleChecks,
      ...screamingFrogByWorkspace["atlas-commerce"].ruleChecks
    ],
    searchPerformance: [
      { id: "sp-atlas-impressions", source: "gsc", label: "Search impressions", value: 248000, delta: 28000, category: "impressions" },
      { id: "sp-atlas-clicks", source: "gsc", label: "Organic clicks", value: 9600, delta: 800, category: "clicks" },
      { id: "sp-atlas-ctr", source: "gsc", label: "Organic CTR", value: 3.9, delta: -0.1, category: "ctr" },
      { id: "sp-atlas-sessions", source: "ga4", label: "Organic sessions", value: 15800, delta: 1600, category: "sessions" },
      { id: "sp-atlas-leads", source: "ga4", label: "Organic leads", value: 310, delta: 30, category: "leads" }
    ],
    authoritySignals: [
      { id: "as-atlas-backlinks", source: "dataforseo", label: "Backlinks", value: 3318, delta: 118, category: "backlinks" },
      { id: "as-atlas-refdomains", source: "dataforseo", label: "Referring domains", value: 502, delta: 22, category: "referring-domains" },
      { id: "as-atlas-rank", source: "dataforseo", label: "Keyword rank movement", value: 37, delta: 37, category: "keyword-rank" }
    ],
    claudeBrain: {
      id: "claude-audit-atlas-0528",
      status: "Ready",
      inputSources: ["own-crawler", "screaming-frog", "gsc", "ga4", "dataforseo", "claude-brain"],
      confidenceScore: 81,
      promptVersion: "seo-brain-v1",
      findingsGenerated: 21,
      actionsGenerated: 8,
      reportNarrativesGenerated: 2,
      requiresHumanApproval: true,
      lastRunAt: "2026-05-28 11:00"
    }
  },
  "vertex-saas": {
    workspaceId: "vertex-saas",
    sourceStatuses: [
      { ...ownCrawlerByWorkspace["vertex-saas"].sourceStatus },
      { ...screamingFrogByWorkspace["vertex-saas"].sourceStatus },
      {
        source: "gsc",
        label: "Google Search Console",
        status: "Connected",
        coverageScore: 71,
        lastSyncedAt: "2026-05-28",
        recordsAvailable: 12400,
        primaryUse: "Queries, impressions, clicks, CTR, and landing pages"
      },
      {
        source: "ga4",
        label: "Google Analytics 4",
        status: "Connected",
        coverageScore: 78,
        lastSyncedAt: "2026-05-28",
        recordsAvailable: 8900,
        primaryUse: "Organic sessions, referral traffic, leads, and conversions"
      },
      {
        source: "dataforseo",
        label: "DataForSEO",
        status: "Import Ready",
        coverageScore: 66,
        lastSyncedAt: "2026-05-27",
        recordsAvailable: 134,
        primaryUse: "Rank tracking, SERP features, and competitor gaps"
      },
      {
        source: "ahrefs",
        label: "Ahrefs",
        status: "Needs Setup",
        coverageScore: 0,
        lastSyncedAt: "Not connected",
        recordsAvailable: 0,
        primaryUse: "Backlinks and authority"
      },
      {
        source: "semrush",
        label: "Semrush",
        status: "Needs Setup",
        coverageScore: 0,
        lastSyncedAt: "Not connected",
        recordsAvailable: 0,
        primaryUse: "Competitor visibility and keyword authority"
      },
      {
        source: "claude-brain",
        label: "Claude SEO Brain",
        status: "Connected",
        coverageScore: 77,
        lastSyncedAt: "2026-05-28 08:45",
        recordsAvailable: 10,
        primaryUse: "Deep interpretation, prioritization, actions, and report narratives"
      }
    ],
    technicalChecks: [
      ...ownCrawlerByWorkspace["vertex-saas"].ruleChecks,
      ...screamingFrogByWorkspace["vertex-saas"].ruleChecks
    ],
    searchPerformance: [
      { id: "sp-vertex-impressions", source: "gsc", label: "Search impressions", value: 39000, delta: 3000, category: "impressions" },
      { id: "sp-vertex-clicks", source: "gsc", label: "Organic clicks", value: 1200, delta: 100, category: "clicks" },
      { id: "sp-vertex-ctr", source: "gsc", label: "Organic CTR", value: 3.1, delta: 0, category: "ctr" },
      { id: "sp-vertex-sessions", source: "ga4", label: "Organic sessions", value: 2300, delta: 200, category: "sessions" },
      { id: "sp-vertex-leads", source: "ga4", label: "Organic leads", value: 48, delta: 6, category: "leads" }
    ],
    authoritySignals: [
      { id: "as-vertex-backlinks", source: "dataforseo", label: "Backlinks", value: 1012, delta: 32, category: "backlinks" },
      { id: "as-vertex-refdomains", source: "dataforseo", label: "Referring domains", value: 224, delta: 14, category: "referring-domains" },
      { id: "as-vertex-rank", source: "dataforseo", label: "Keyword rank movement", value: 14, delta: 14, category: "keyword-rank" }
    ],
    claudeBrain: {
      id: "claude-audit-vertex-0528",
      status: "Ready",
      inputSources: ["own-crawler", "screaming-frog", "gsc", "ga4", "dataforseo", "claude-brain"],
      confidenceScore: 77,
      promptVersion: "seo-brain-v1",
      findingsGenerated: 9,
      actionsGenerated: 5,
      reportNarrativesGenerated: 2,
      requiresHumanApproval: true,
      lastRunAt: "2026-05-28 08:45"
    }
  }
};

export const currentSession: RankFlowSession = {
  activeWorkspaceId: "aurora-education",
  visibleModules: ["dashboard", "own-crawler", "screaming-frog", "ai-brain", "audit-intelligence", "growth-cycle", "scan-history", "on-page-audit", "ai-suggestions", "local-visibility", "keywords", "workbook", "reports"],
  user: {
    id: "user-maya-hod",
    email: "maya.hod@rankflow.example",
    fullName: "Maya Iyer",
    role: "hod",
    organizationName: "RankFlow Demo Agency",
    workspaceAccess: [
      {
        workspaceId: "aurora-education",
        role: "manager",
        modulesEnabled: ["dashboard", "own-crawler", "screaming-frog", "ai-brain", "audit-intelligence", "growth-cycle", "scan-history", "on-page-audit", "ai-suggestions", "local-visibility", "keywords", "workbook", "reports"],
        canAssignTasks: true,
        suggestionAccess: "full",
        canGenerateReports: true,
        canSeeInternalNotes: true,
        canRunScans: true,
        canExport: true
      },
      {
        workspaceId: "nimbus-health",
        role: "manager",
        modulesEnabled: ["dashboard", "own-crawler", "screaming-frog", "ai-brain", "audit-intelligence", "growth-cycle", "scan-history", "on-page-audit", "ai-suggestions", "local-visibility", "keywords", "workbook", "reports"],
        canAssignTasks: true,
        suggestionAccess: "full",
        canGenerateReports: true,
        canSeeInternalNotes: true,
        canRunScans: true,
        canExport: true
      }
    ]
  }
};

export const workspaces: Workspace[] = [
  {
    id: "aurora-education",
    clientName: "Aurora Education Group",
    primaryDomain: "aurora.edu",
    locale: {
      region: "South Asia",
      country: "India",
      language: "en-IN",
      currency: "INR",
      timeZone: "Asia/Kolkata"
    },
    industry: "Education",
    manager: "Maya Iyer",
    teamSize: 5,
    status: "Delivering",
    scores: { composite: 86, technical: 91, onPage: 84, offPage: 78, local: 82, aeo: 74, geo: 69 },
    scoreDeltaMom: 8,
    organicTrafficDelta: 18,
    keywordsTop10: 124,
    nextReportDue: "2026-05-24",
    lastScan: "2026-05-20",
    scans: [
      {
        id: "scan-aurora-0520",
        type: "Full Site Crawl",
        completedAt: "2026-05-20 09:15",
        status: "Completed",
        pagesCrawled: 842,
        keywordsChecked: 420,
        score: 86,
        delta: 8,
        issues: { critical: 2, high: 11, medium: 27, low: 44 },
        suggestionsGenerated: 38
      },
      {
        id: "scan-aurora-0506",
        type: "Full Site Crawl",
        completedAt: "2026-05-06 08:45",
        status: "Completed",
        pagesCrawled: 801,
        keywordsChecked: 408,
        score: 78,
        delta: 4,
        issues: { critical: 6, high: 15, medium: 25, low: 51 },
        suggestionsGenerated: 27
      }
    ],
    auditCategories: [
      { id: "title", name: "Title Tags", score: 88, failedChecks: 9, totalChecks: 72, topIssue: "Duplicate programme titles", severity: "high" },
      { id: "content", name: "Content Quality", score: 79, failedChecks: 18, totalChecks: 108, topIssue: "Missing admissions intent sections", severity: "medium" },
      { id: "schema", name: "Schema", score: 72, failedChecks: 11, totalChecks: 48, topIssue: "Course schema incomplete", severity: "high" }
    ],
    suggestions: [
      {
        id: "sug-aurora-1",
        checkId: "TT-03",
        page: "/mba/admissions",
        title: "Front-load the MBA admissions keyword in the title",
        recommendation: "Rewrite the title to lead with MBA admissions and preserve the Aurora brand at the end.",
        source: "On-Page Deep Audit, TT-03",
        status: "New",
        severity: "high",
        estimatedImpact: "High"
      },
      {
        id: "sug-aurora-2",
        checkId: "SD-08",
        page: "/courses/data-science",
        title: "Add FAQ schema for course eligibility questions",
        recommendation: "Mark the visible eligibility FAQ block with FAQPage schema and validate it before publishing.",
        source: "Schema audit, SD-08",
        status: "Accepted",
        severity: "medium",
        estimatedImpact: "Medium"
      },
      {
        id: "sug-aurora-3",
        checkId: "MD-04",
        page: "/executive-mba",
        title: "Add an action-oriented meta description",
        recommendation: "Use a concise admissions CTA and include the executive MBA keyword naturally.",
        source: "On-Page Deep Audit, MD-04",
        status: "Implemented",
        severity: "low",
        estimatedImpact: "Low"
      }
    ],
    tasks: [
      { id: "task-aurora-1", title: "Optimize MBA admissions title and H1", owner: "Rohan Mehta", priority: "high", status: "In Progress", dueDate: "2026-05-21", evidenceRequired: true },
      { id: "task-aurora-2", title: "Publish course FAQ schema", owner: "Anika Rao", priority: "medium", status: "Review", dueDate: "2026-05-22", evidenceRequired: true },
      { id: "task-aurora-3", title: "Refresh executive MBA meta descriptions", owner: "Rohan Mehta", priority: "low", status: "Done", dueDate: "2026-05-18", evidenceRequired: true },
      { id: "task-aurora-4", title: "Map admissions keywords to priority pages", owner: "Maya Iyer", priority: "medium", status: "Backlog", dueDate: "2026-05-25", evidenceRequired: false }
    ],
    keywords: [
      { id: "kw-aurora-1", keyword: "mba admissions", intent: "Commercial", mappedPage: "/mba/admissions", currentPosition: 3, previousPosition: 6, positionDelta: 3, volume: 5400, difficulty: 61, serpFeatures: ["PAA", "Sitelinks"], updatedAt: "2026-05-20" },
      { id: "kw-aurora-2", keyword: "executive mba india", intent: "Commercial", mappedPage: "/executive-mba", currentPosition: 9, previousPosition: 12, positionDelta: 3, volume: 2900, difficulty: 55, serpFeatures: ["PAA"], updatedAt: "2026-05-20" },
      { id: "kw-aurora-3", keyword: "data science course eligibility", intent: "Informational", mappedPage: "/courses/data-science", currentPosition: 14, previousPosition: 10, positionDelta: -4, volume: 1900, difficulty: 48, serpFeatures: ["Featured Snippet", "PAA"], updatedAt: "2026-05-20" },
      { id: "kw-aurora-4", keyword: "business school scholarships", intent: "Informational", mappedPage: "/scholarships", currentPosition: 28, previousPosition: 34, positionDelta: 6, volume: 1200, difficulty: 42, serpFeatures: ["Images"], updatedAt: "2026-05-20" }
    ],
    reports: [
      { id: "rep-aurora-may", title: "May SEO Progress Report", period: "May 2026", status: "Review", dueDate: "2026-05-24", readinessScore: 86, sectionsReady: 12, totalSections: 14, lastUpdated: "2026-05-20", clientVisible: false, owner: "Maya Iyer" },
      { id: "rep-aurora-apr", title: "April SEO Progress Report", period: "April 2026", status: "Published", dueDate: "2026-04-24", readinessScore: 100, sectionsReady: 14, totalSections: 14, lastUpdated: "2026-04-24", clientVisible: true, owner: "Maya Iyer" }
    ],
    localVisibility: localVisibilityProfiles["aurora-education"]
  },
  {
    id: "nimbus-health",
    clientName: "Nimbus Health Clinics",
    primaryDomain: "nimbushealth.com",
    locale: {
      region: "South Asia",
      country: "India",
      language: "en-IN",
      currency: "INR",
      timeZone: "Asia/Kolkata"
    },
    industry: "Healthcare",
    manager: "Kabir Sen",
    teamSize: 4,
    status: "At Risk",
    scores: { composite: 61, technical: 58, onPage: 64, offPage: 70, local: 55, aeo: 48, geo: 44 },
    scoreDeltaMom: -7,
    organicTrafficDelta: -22,
    keywordsTop10: 39,
    nextReportDue: "2026-05-22",
    lastScan: "2026-05-19",
    scans: [
      {
        id: "scan-nimbus-0519",
        type: "Performance Scan",
        completedAt: "2026-05-19 17:40",
        status: "Partial",
        pagesCrawled: 316,
        keywordsChecked: 190,
        score: 61,
        delta: -7,
        issues: { critical: 6, high: 14, medium: 31, low: 52 },
        suggestionsGenerated: 51
      },
      {
        id: "scan-nimbus-0505",
        type: "Performance Scan",
        completedAt: "2026-05-05 16:20",
        status: "Completed",
        pagesCrawled: 308,
        keywordsChecked: 184,
        score: 68,
        delta: 2,
        issues: { critical: 3, high: 10, medium: 28, low: 49 },
        suggestionsGenerated: 34
      }
    ],
    auditCategories: [
      { id: "cwv", name: "Core Web Vitals", score: 49, failedChecks: 21, totalChecks: 36, topIssue: "Mobile LCP above 4 seconds", severity: "critical" },
      { id: "local", name: "Local SEO", score: 55, failedChecks: 16, totalChecks: 42, topIssue: "NAP mismatch across clinic pages", severity: "critical" },
      { id: "technical", name: "Technical On-Page", score: 58, failedChecks: 24, totalChecks: 96, topIssue: "Canonical conflicts on location pages", severity: "critical" }
    ],
    suggestions: [
      {
        id: "sug-nimbus-1",
        checkId: "CWV-01",
        page: "/clinics/delhi",
        title: "Reduce hero payload on clinic landing pages",
        recommendation: "Replace the 1.9MB hero image with AVIF and preload the resized mobile asset.",
        source: "Performance Scan, CWV-01",
        status: "New",
        severity: "critical",
        estimatedImpact: "High"
      }
    ],
    tasks: [
      { id: "task-nimbus-1", title: "Fix clinic page canonical conflicts", owner: "Priya Menon", priority: "critical", status: "Backlog", dueDate: "2026-05-21", evidenceRequired: true },
      { id: "task-nimbus-2", title: "Compress location hero media", owner: "Dev Arora", priority: "critical", status: "In Progress", dueDate: "2026-05-21", evidenceRequired: true }
    ],
    keywords: [
      { id: "kw-nimbus-1", keyword: "clinic near me delhi", intent: "Local", mappedPage: "/clinics/delhi", currentPosition: 11, previousPosition: 7, positionDelta: -4, volume: 8100, difficulty: 64, serpFeatures: ["Local Pack", "Map"], updatedAt: "2026-05-20" },
      { id: "kw-nimbus-2", keyword: "best family clinic", intent: "Local", mappedPage: "/family-clinic", currentPosition: 18, previousPosition: 23, positionDelta: 5, volume: 3600, difficulty: 50, serpFeatures: ["PAA", "Local Pack"], updatedAt: "2026-05-20" }
    ],
    reports: [
      { id: "rep-nimbus-may", title: "May Risk Recovery Report", period: "May 2026", status: "Draft", dueDate: "2026-05-22", readinessScore: 58, sectionsReady: 8, totalSections: 14, lastUpdated: "2026-05-20", clientVisible: false, owner: "Kabir Sen" }
    ],
    localVisibility: localVisibilityProfiles["nimbus-health"]
  },
  {
    id: "atlas-commerce",
    clientName: "Atlas Commerce",
    primaryDomain: "atlascommerce.com",
    locale: {
      region: "North America",
      country: "United States",
      language: "en-US",
      currency: "USD",
      timeZone: "America/New_York"
    },
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
    scans: [
      {
        id: "scan-atlas-0520",
        type: "On-Page Deep Audit",
        completedAt: "2026-05-20 11:05",
        status: "Completed",
        pagesCrawled: 1000,
        keywordsChecked: 610,
        score: 78,
        delta: 3,
        issues: { critical: 3, high: 9, medium: 24, low: 37 },
        suggestionsGenerated: 44
      }
    ],
    auditCategories: [
      { id: "ecommerce", name: "eCommerce SEO", score: 74, failedChecks: 32, totalChecks: 90, topIssue: "Variant canonical rules inconsistent", severity: "high" },
      { id: "images", name: "Images & Media", score: 69, failedChecks: 27, totalChecks: 80, topIssue: "Large PDP image payload", severity: "high" },
      { id: "internal-links", name: "Internal Linking", score: 84, failedChecks: 12, totalChecks: 74, topIssue: "Low category-to-product link coverage", severity: "medium" }
    ],
    suggestions: [
      {
        id: "sug-atlas-1",
        checkId: "EC-13",
        page: "/products/linen-shirt?color=sage",
        title: "Canonicalize color variants to master PDP",
        recommendation: "Point color and size variants to the master linen-shirt PDP unless the variant has unique search demand.",
        source: "eCommerce audit, EC-13",
        status: "Edited",
        severity: "high",
        estimatedImpact: "High"
      }
    ],
    tasks: [
      { id: "task-atlas-1", title: "Audit top 50 PDP canonical tags", owner: "Sara Khan", priority: "high", status: "In Progress", dueDate: "2026-05-23", evidenceRequired: true }
    ],
    keywords: [
      { id: "kw-atlas-1", keyword: "linen shirts online", intent: "Transactional", mappedPage: "/category/linen-shirts", currentPosition: 5, previousPosition: 8, positionDelta: 3, volume: 12800, difficulty: 72, serpFeatures: ["Shopping", "Images"], updatedAt: "2026-05-20" },
      { id: "kw-atlas-2", keyword: "sage linen shirt", intent: "Transactional", mappedPage: "/products/linen-shirt", currentPosition: 16, previousPosition: 14, positionDelta: -2, volume: 2100, difficulty: 39, serpFeatures: ["Shopping"], updatedAt: "2026-05-20" }
    ],
    reports: [
      { id: "rep-atlas-may", title: "May eCommerce SEO Report", period: "May 2026", status: "Scheduled", dueDate: "2026-05-27", readinessScore: 74, sectionsReady: 10, totalSections: 14, lastUpdated: "2026-05-20", clientVisible: false, owner: "Nisha Kapoor" }
    ],
    localVisibility: localVisibilityProfiles["atlas-commerce"]
  },
  {
    id: "vertex-saas",
    clientName: "VertexOps SaaS",
    primaryDomain: "vertexops.com",
    locale: {
      region: "North America",
      country: "United States",
      language: "en-US",
      currency: "USD",
      timeZone: "America/Los_Angeles"
    },
    industry: "SaaS",
    manager: "Aarav Shah",
    teamSize: 3,
    status: "Active",
    scores: { composite: 72, technical: 76, onPage: 70, offPage: 68, local: 52, aeo: 66, geo: 61 },
    scoreDeltaMom: -1,
    organicTrafficDelta: 4,
    keywordsTop10: 67,
    nextReportDue: "2026-05-25",
    lastScan: "2026-05-18",
    scans: [
      {
        id: "scan-vertex-0518",
        type: "Rank Snapshot",
        completedAt: "2026-05-18 08:30",
        status: "Completed",
        pagesCrawled: 184,
        keywordsChecked: 260,
        score: 72,
        delta: -1,
        issues: { critical: 2, high: 7, medium: 11, low: 23 },
        suggestionsGenerated: 18
      }
    ],
    auditCategories: [
      { id: "aeo", name: "AEO Readiness", score: 66, failedChecks: 14, totalChecks: 50, topIssue: "Missing question-led headings", severity: "medium" },
      { id: "content", name: "Content Quality", score: 70, failedChecks: 19, totalChecks: 92, topIssue: "Comparison pages lack proof points", severity: "medium" },
      { id: "technical", name: "Technical On-Page", score: 76, failedChecks: 10, totalChecks: 76, topIssue: "Missing OG images", severity: "low" }
    ],
    suggestions: [
      {
        id: "sug-vertex-1",
        checkId: "H-08",
        page: "/compare/asana-alternative",
        title: "Add question-based H2s for alternative searches",
        recommendation: "Add two H2s that answer PAA-style questions about switching from Asana to VertexOps.",
        source: "AEO snapshot, H-08",
        status: "New",
        severity: "medium",
        estimatedImpact: "Medium"
      }
    ],
    tasks: [
      { id: "task-vertex-1", title: "Rewrite comparison page proof section", owner: "Ira Bose", priority: "medium", status: "Backlog", dueDate: "2026-05-24", evidenceRequired: false }
    ],
    keywords: [
      { id: "kw-vertex-1", keyword: "asana alternative", intent: "Commercial", mappedPage: "/compare/asana-alternative", currentPosition: 12, previousPosition: 16, positionDelta: 4, volume: 6600, difficulty: 69, serpFeatures: ["PAA"], updatedAt: "2026-05-20" },
      { id: "kw-vertex-2", keyword: "project operations software", intent: "Commercial", mappedPage: "/solutions/project-operations", currentPosition: 24, previousPosition: 22, positionDelta: -2, volume: 1800, difficulty: 57, serpFeatures: ["Videos"], updatedAt: "2026-05-20" }
    ],
    reports: [
      { id: "rep-vertex-may", title: "May SaaS Visibility Report", period: "May 2026", status: "Draft", dueDate: "2026-05-25", readinessScore: 64, sectionsReady: 9, totalSections: 14, lastUpdated: "2026-05-20", clientVisible: false, owner: "Aarav Shah" }
    ],
    localVisibility: localVisibilityProfiles["vertex-saas"]
  }
];

export function getSeverityTotals(source: Workspace[]): SeverityCounts {
  return source.reduce<SeverityCounts>(
    (totals, workspace) => {
      const latest = getLatestScan(workspace);
      totals.critical += latest.issues.critical;
      totals.high += latest.issues.high;
      totals.medium += latest.issues.medium;
      totals.low += latest.issues.low;
      return totals;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );
}

export function getHodSummary(source: Workspace[] = workspaces): HodSummary {
  const severity = getSeverityTotals(source);

  return {
    activeWorkspaces: source.filter((workspace) => workspace.status !== "Paused").length,
    accountsImproved: source.filter((workspace) => workspace.scoreDeltaMom > 0).length,
    accountsAtRisk: source.filter(
      (workspace) => workspace.status === "At Risk" || workspace.scores.composite < 65
    ).length,
    openCriticalIssues: severity.critical,
    tasksDueThisWeek: 18,
    reportsDue: source.filter((workspace) => new Date(workspace.nextReportDue) <= new Date("2026-05-25")).length
  };
}

export function getWorkspaceById(id: string): Workspace | undefined {
  return workspaces.find((workspace) => workspace.id === id);
}

export function formatSigned(value: number): string {
  if (value > 0) return `+${value}`;
  return `${value}`;
}
