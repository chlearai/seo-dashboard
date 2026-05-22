import type {
  HodSummary,
  RankFlowSession,
  SeverityCounts,
  Workspace
} from "@rankflow/shared";
import { getLatestScan, scoreHealth } from "@rankflow/shared";

export { getLatestScan, scoreHealth };

export const currentSession: RankFlowSession = {
  activeWorkspaceId: "aurora-education",
  visibleModules: ["dashboard", "scan-history", "on-page-audit", "ai-suggestions", "keywords", "workbook", "reports"],
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
        modulesEnabled: ["dashboard", "scan-history", "on-page-audit", "ai-suggestions", "keywords", "workbook", "reports"],
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
        modulesEnabled: ["dashboard", "scan-history", "on-page-audit", "ai-suggestions", "keywords", "workbook", "reports"],
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
    ]
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
    ]
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
    ]
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
    ]
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
