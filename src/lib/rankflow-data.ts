import type {
  HodSummary,
  ScoreHealth,
  SeverityCounts,
  Workspace
} from "./rankflow-types";

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
      }
    ],
    tasks: [
      { id: "task-aurora-1", title: "Optimize MBA admissions title and H1", owner: "Rohan Mehta", priority: "high", status: "In Progress", dueDate: "2026-05-21", evidenceRequired: true },
      { id: "task-aurora-2", title: "Publish course FAQ schema", owner: "Anika Rao", priority: "medium", status: "Review", dueDate: "2026-05-22", evidenceRequired: true }
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
    ]
  }
];

export function scoreHealth(score: number): ScoreHealth {
  const clamped = Math.max(0, Math.min(100, score));

  if (clamped >= 85) return { label: "Excellent", tone: "success" };
  if (clamped >= 75) return { label: "Healthy", tone: "success" };
  if (clamped >= 65) return { label: "Watch", tone: "warning" };
  return { label: "At Risk", tone: "critical" };
}

export function getLatestScan(workspace: Workspace) {
  return workspace.scans[0];
}

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
