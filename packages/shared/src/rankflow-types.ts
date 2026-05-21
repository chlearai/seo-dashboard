export type Severity = "critical" | "high" | "medium" | "low";

export type WorkspaceStatus = "Delivering" | "At Risk" | "Active" | "Paused";

export type ScoreTone = "success" | "warning" | "critical";

export interface ScoreHealth {
  label: "Excellent" | "Healthy" | "Watch" | "At Risk";
  tone: ScoreTone;
}

export interface SeverityCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface SeoScores {
  composite: number;
  technical: number;
  onPage: number;
  offPage: number;
  local: number;
  aeo: number;
  geo: number;
}

export interface ScanSnapshot {
  id: string;
  type: "Full Site Crawl" | "On-Page Deep Audit" | "Performance Scan" | "Rank Snapshot";
  completedAt: string;
  status: "Completed" | "Partial" | "Failed" | "Running";
  pagesCrawled: number;
  keywordsChecked: number;
  score: number;
  delta: number;
  issues: SeverityCounts;
  suggestionsGenerated: number;
}

export interface AuditCategory {
  id: string;
  name: string;
  score: number;
  failedChecks: number;
  totalChecks: number;
  topIssue: string;
  severity: Severity;
}

export interface AiSuggestion {
  id: string;
  checkId: string;
  page: string;
  title: string;
  recommendation: string;
  source: string;
  status: "New" | "Accepted" | "Edited" | "Rejected" | "Implemented";
  severity: Severity;
  estimatedImpact: "High" | "Medium" | "Low";
}

export interface WorkbookTask {
  id: string;
  title: string;
  owner: string;
  priority: Severity;
  status: "Backlog" | "In Progress" | "Review" | "Done";
  dueDate: string;
  evidenceRequired: boolean;
}

export interface ScanComparison {
  scoreDelta: number;
  resolvedCritical: number;
  newCritical: number;
  issueDelta: SeverityCounts;
  suggestionsDelta: number;
}

export interface SuggestionInboxSummary {
  total: number;
  newCount: number;
  acceptedCount: number;
  implementedCount: number;
  rejectedCount: number;
  quickWins: number;
}

export interface WorkbookStatusColumn {
  status: WorkbookTask["status"];
  tasks: WorkbookTask[];
}

export interface Workspace {
  id: string;
  clientName: string;
  industry: string;
  manager: string;
  teamSize: number;
  status: WorkspaceStatus;
  scores: SeoScores;
  scoreDeltaMom: number;
  organicTrafficDelta: number;
  keywordsTop10: number;
  nextReportDue: string;
  lastScan: string;
  scans: ScanSnapshot[];
  auditCategories: AuditCategory[];
  suggestions: AiSuggestion[];
  tasks: WorkbookTask[];
}

export interface HodSummary {
  activeWorkspaces: number;
  accountsImproved: number;
  accountsAtRisk: number;
  openCriticalIssues: number;
  tasksDueThisWeek: number;
  reportsDue: number;
}
