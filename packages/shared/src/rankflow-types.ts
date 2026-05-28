export type Severity = "critical" | "high" | "medium" | "low";

export type WorkspaceStatus = "Delivering" | "At Risk" | "Active" | "Paused";

export type ScoreTone = "success" | "warning" | "critical";

export type RankFlowRole = "super_admin" | "hod" | "manager" | "specialist" | "analyst" | "client";

export type RankFlowModule =
  | "dashboard"
  | "ai-brain"
  | "audit-intelligence"
  | "growth-cycle"
  | "scan-history"
  | "on-page-audit"
  | "ai-suggestions"
  | "local-visibility"
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

export type GrowthCycleStage = "Audit" | "Analyse" | "Act" | "Report" | "Re-audit";

export type OrganicMetricCategory =
  | "visibility"
  | "traffic"
  | "conversion"
  | "authority"
  | "local"
  | "aeo"
  | "geo"
  | "technical"
  | "execution";

export type ActionSource = "audit" | "ai-suggestion" | "local-visibility" | "keyword" | "report" | "manual";

export type ActionExecutionMode = "inside-rankflow" | "outside-rankflow";

export type ActionStatus = "Backlog" | "Planned" | "In Progress" | "Evidence Review" | "Done" | "Blocked";

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

export interface GoogleBusinessProfileOptimization {
  score: number;
  verificationStatus: "Verified" | "Needs Verification" | "Suspended" | "Not Claimed";
  primaryCategory: string;
  additionalCategories: string[];
  profileCompleteness: number;
  napConsistency: number;
  reviewRating: number;
  reviewCount: number;
  reviewVelocity30d: number;
  unansweredReviews: number;
  photoFreshnessDays: number;
  postFreshnessDays: number;
  servicesCompleteness: number;
  productCompleteness: number;
  qnaCompleteness: number;
  localPackPosition: number;
  mapsVisibilityScore: number;
  topIssues: string[];
}

export interface LocalSeoOptimization {
  score: number;
  napConsistency: number;
  citationCoverage: number;
  locationPagesHealthy: number;
  locationPagesTotal: number;
  localSchemaCoverage: number;
  localKeywordTop10: number;
  localKeywordTracked: number;
  localPackShare: number;
  proximityCoverage: number;
  topIssues: string[];
}

export interface AeoOptimization {
  score: number;
  questionLedHeadings: number;
  faqSchemaCoverage: number;
  paaCoverage: number;
  conciseAnswerBlocks: number;
  voiceSearchReadiness: number;
  sourceClarity: number;
  topIssues: string[];
}

export interface GeoOptimization {
  score: number;
  entityCoverage: number;
  citationAuthority: number;
  llmAnswerPresence: number;
  aiOverviewEligibility: number;
  authorExpertiseCoverage: number;
  contentFreshness: number;
  structuredEvidenceCoverage: number;
  topIssues: string[];
}

export interface LocalVisibilityProfile {
  gbp: GoogleBusinessProfileOptimization;
  localSeo: LocalSeoOptimization;
  aeo: AeoOptimization;
  geo: GeoOptimization;
}

export interface LocalVisibilitySummary {
  overallScore: number;
  weakestArea: "GBP" | "Local SEO" | "AEO" | "GEO";
  criticalActions: string[];
  gbpActionCount: number;
  unansweredReviews: number;
  mapsVisibilityScore: number;
}

export interface OrganicGrowthMetricSnapshot {
  id: string;
  workspaceId: string;
  measuredAt: string;
  searchImpressions: number;
  organicClicks: number;
  organicCtr: number;
  averagePosition: number;
  keywordsTop3: number;
  keywordsTop10: number;
  rankingImproved: number;
  rankingDeclined: number;
  organicSessions: number;
  organicUsers: number;
  referralSessions: number;
  organicLeads: number;
  organicConversionRate: number;
  backlinks: number;
  referringDomains: number;
  newBacklinks: number;
  lostBacklinks: number;
  aeoVisibility: number;
  geoVisibility: number;
  localVisibility: number;
  technicalHealth: number;
}

export interface OrganicGrowthDelta {
  searchImpressionsDelta: number;
  organicClicksDelta: number;
  organicLeadsDelta: number;
  aeoVisibilityDelta: number;
  geoVisibilityDelta: number;
}

export interface ActionEvidence {
  id: string;
  submittedAt: string;
  submittedBy: string;
  evidenceType: "url" | "screenshot" | "note" | "cms-log" | "analytics-snapshot";
  label: string;
  value: string;
  qualityScore: number;
  approvalStatus: "Pending" | "Approved" | "Rejected";
}

export interface ActionItem {
  id: string;
  workspaceId: string;
  source: ActionSource;
  sourceId: string;
  title: string;
  impactArea: OrganicMetricCategory;
  priority: Severity;
  status: ActionStatus;
  executionMode: ActionExecutionMode;
  owner: string;
  dueDate: string;
  expectedImpact: string;
  completedAt?: string;
  evidenceRequired: boolean;
  evidence: ActionEvidence[];
  impactScore: number;
  clientReportContribution: boolean;
}

export interface ActionIntelligenceSummary {
  total: number;
  completed: number;
  inProgress: number;
  blocked: number;
  outsideProduct: number;
  evidencePending: number;
  averageImpactScore: number;
}

export interface OrganicGrowthCycle {
  id: string;
  workspaceId: string;
  period: string;
  stage: GrowthCycleStage;
  auditId: string;
  baselineSnapshotId: string;
  latestSnapshotId: string;
  actionsCreated: number;
  actionsCompleted: number;
  actionsOverdue: number;
  reportsPublished: number;
  nextAuditDue: string;
}

export interface ExpertEfficiency {
  owner: string;
  assignedActions: number;
  completedActions: number;
  overdueActions: number;
  averageCompletionDays: number;
  evidenceApprovalRate: number;
  impactDelivered: number;
  clientReportContributions: number;
}

export interface ExpertEfficiencySummary {
  teamAssigned: number;
  teamCompleted: number;
  completionRate: number;
  overdue: number;
  averageEvidenceApprovalRate: number;
  impactDelivered: number;
}

export type AiBrainStatus = "Active" | "Needs Data" | "Paused";

export type AiBrainAutomationMode = "read-only" | "approval-required" | "autonomous-disabled";

export interface AiBrainInsight {
  id: string;
  title: string;
  narrative: string;
  area: OrganicMetricCategory;
  confidence: number;
  severity: Severity;
  evidenceRefs: string[];
}

export interface AiBrainRecommendation {
  id: string;
  title: string;
  reason: string;
  targetAction: string;
  priority: Severity;
  expectedLift: string;
  requiresApproval: boolean;
}

export interface AiBrainNarrative {
  id: string;
  audience: "client" | "internal" | "hod";
  title: string;
  summary: string;
}

export interface AiBrainRisk {
  id: string;
  title: string;
  severity: Severity;
  mitigation: string;
}

export interface AiBrainProfile {
  status: AiBrainStatus;
  lastRunAt: string;
  confidenceScore: number;
  dataCoverageScore: number;
  automationMode: AiBrainAutomationMode;
  insights: AiBrainInsight[];
  recommendations: AiBrainRecommendation[];
  narratives: AiBrainNarrative[];
  risks: AiBrainRisk[];
}

export interface AiBrainSummary {
  status: AiBrainStatus;
  confidenceScore: number;
  dataCoverageScore: number;
  highPriorityRecommendations: number;
  approvalRequired: number;
  highRisks: number;
  clientNarratives: number;
}

export type AuditEvidenceSource =
  | "own-crawler"
  | "screaming-frog"
  | "gsc"
  | "ga4"
  | "ahrefs"
  | "semrush"
  | "dataforseo"
  | "claude-brain";

export type AuditSignalCategory =
  | "technical"
  | "content"
  | "indexability"
  | "performance"
  | "internal-linking"
  | "schema"
  | "rankings"
  | "traffic"
  | "conversions"
  | "authority"
  | "competitors"
  | "local"
  | "aeo"
  | "geo";

export interface AuditEvidenceSourceStatus {
  source: AuditEvidenceSource;
  label: string;
  status: "Connected" | "Import Ready" | "Needs Setup" | "Error";
  coverageScore: number;
  lastSyncedAt: string;
  recordsAvailable: number;
  primaryUse: string;
}

export interface TechnicalRuleCheck {
  id: string;
  category: AuditSignalCategory;
  label: string;
  description: string;
  severity: Severity;
  affectedUrls: number;
  passedUrls: number;
  failedUrls: number;
  source: "own-crawler" | "screaming-frog";
}

export interface SearchPerformanceSignal {
  id: string;
  source: "gsc" | "ga4";
  label: string;
  value: number;
  delta: number;
  category: "impressions" | "clicks" | "ctr" | "sessions" | "users" | "referral" | "leads" | "conversions";
}

export interface AuthoritySignal {
  id: string;
  source: "ahrefs" | "semrush" | "dataforseo";
  label: string;
  value: number;
  delta: number;
  category: "backlinks" | "referring-domains" | "keyword-rank" | "competitor-gap" | "authority-score";
}

export interface ClaudeBrainAuditRun {
  id: string;
  status: "Ready" | "Running" | "Needs Approval" | "Completed" | "Blocked";
  inputSources: AuditEvidenceSource[];
  confidenceScore: number;
  promptVersion: string;
  findingsGenerated: number;
  actionsGenerated: number;
  reportNarrativesGenerated: number;
  requiresHumanApproval: boolean;
  lastRunAt: string;
}

export interface AuditIntelligenceStack {
  workspaceId: string;
  sourceStatuses: AuditEvidenceSourceStatus[];
  technicalChecks: TechnicalRuleCheck[];
  searchPerformance: SearchPerformanceSignal[];
  authoritySignals: AuthoritySignal[];
  claudeBrain: ClaudeBrainAuditRun;
}

export interface AuditIntelligenceSummary {
  connectedSources: number;
  needsSetup: number;
  technicalIssues: number;
  criticalTechnicalIssues: number;
  performanceSignals: number;
  authoritySignals: number;
  claudeReady: boolean;
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
  localVisibility: LocalVisibilityProfile;
}

export interface HodSummary {
  activeWorkspaces: number;
  accountsImproved: number;
  accountsAtRisk: number;
  openCriticalIssues: number;
  tasksDueThisWeek: number;
  reportsDue: number;
}
