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
  "aurora-education": auroraCrawlerEvaluation
};

export const screamingFrogByWorkspace: Record<string, CrawlerEvaluation> = {
  "aurora-education": auroraScreamingFrogEvaluation
};

export const auditIntelligenceByWorkspace: Record<string, AuditIntelligenceStack> = {
  "aurora-education": {
    workspaceId: "aurora-education",
    sourceStatuses: [
      {
        ...auroraCrawlerEvaluation.sourceStatus
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
