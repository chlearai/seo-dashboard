export type Severity = "critical" | "high" | "medium" | "low";

export type WorkspaceStatus = "Delivering" | "At Risk" | "Active" | "Paused";

export type ScoreTone = "success" | "warning" | "critical";

export type RankFlowRole = "super_admin" | "hod" | "manager" | "specialist" | "analyst" | "client";

export type RankFlowModule =
  | "dashboard"
  | "scan-history"
  | "on-page-audit"
  | "ai-suggestions"
  | "keywords"
  | "workbook"
  | "reports"
  | "client-portal";

export type RankFlowAction =
  | "create-workspace"
  | "delete-workspace"
  | "run-scan"
  | "assign-task"
  | "update-task"
  | "review-suggestion"
  | "generate-report"
  | "view-client-portal";

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

export interface KeywordRanking {
  id: string;
  keyword: string;
  intent: "Informational" | "Commercial" | "Transactional" | "Navigational" | "Local";
  mappedPage: string;
  currentPosition: number;
  previousPosition: number;
  positionDelta: number;
  volume: number;
  difficulty: number;
  serpFeatures: string[];
  updatedAt: string;
}

export interface KeywordSummary {
  tracked: number;
  top3: number;
  top10: number;
  top20: number;
  improved: number;
  declined: number;
  averagePosition: number;
}

export interface ReportSnapshot {
  id: string;
  title: string;
  period: string;
  status: "Draft" | "Review" | "Published" | "Scheduled";
  dueDate: string;
  readinessScore: number;
  sectionsReady: number;
  totalSections: number;
  lastUpdated: string;
  clientVisible: boolean;
  owner: string;
}

export interface ReportReadinessSummary {
  total: number;
  published: number;
  needsReview: number;
  drafts: number;
  averageReadiness: number;
}

export interface WorkspaceAccess {
  workspaceId: string;
  role: RankFlowRole;
  modulesEnabled: RankFlowModule[];
  canAssignTasks: boolean;
  suggestionAccess: "full" | "view-only" | "none";
  canGenerateReports: boolean;
  canSeeInternalNotes: boolean;
  canRunScans: boolean;
  canExport: boolean;
}

export interface RankFlowUser {
  id: string;
  email: string;
  fullName: string;
  role: RankFlowRole;
  organizationName: string;
  workspaceAccess: WorkspaceAccess[];
}

export interface RankFlowSession {
  user: RankFlowUser;
  activeWorkspaceId: string;
  visibleModules: RankFlowModule[];
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
  keywords: KeywordRanking[];
  reports: ReportSnapshot[];
}

export interface HodSummary {
  activeWorkspaces: number;
  accountsImproved: number;
  accountsAtRisk: number;
  openCriticalIssues: number;
  tasksDueThisWeek: number;
  reportsDue: number;
}
