import type {
  ActionIntelligenceSummary,
  ActionItem,
  AiBrainProfile,
  AiBrainSummary,
  AiSuggestion,
  AuditIntelligenceStack,
  AuditIntelligenceSummary,
  ExpertEfficiency,
  ExpertEfficiencySummary,
  KeywordRanking,
  KeywordSummary,
  LocalVisibilityProfile,
  LocalVisibilitySummary,
  OrganicGrowthDelta,
  OrganicGrowthMetricSnapshot,
  RankFlowAction,
  RankFlowModule,
  RankFlowRole,
  ReportReadinessSummary,
  ReportSnapshot,
  ScanComparison,
  ScanSnapshot,
  ScoreHealth,
  SuggestionInboxSummary,
  WorkbookStatusColumn,
  WorkbookTask,
  WorkspaceAccess,
  Workspace
} from "./rankflow-types";

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

export function compareScans(current: ScanSnapshot, previous: ScanSnapshot): ScanComparison {
  const issueDelta = {
    critical: current.issues.critical - previous.issues.critical,
    high: current.issues.high - previous.issues.high,
    medium: current.issues.medium - previous.issues.medium,
    low: current.issues.low - previous.issues.low
  };

  return {
    scoreDelta: current.score - previous.score,
    resolvedCritical: Math.max(0, previous.issues.critical - current.issues.critical),
    newCritical: Math.max(0, current.issues.critical - previous.issues.critical),
    issueDelta,
    suggestionsDelta: current.suggestionsGenerated - previous.suggestionsGenerated
  };
}

export function getSuggestionInboxSummary(suggestions: AiSuggestion[]): SuggestionInboxSummary {
  return {
    total: suggestions.length,
    newCount: suggestions.filter((suggestion) => suggestion.status === "New").length,
    acceptedCount: suggestions.filter((suggestion) => suggestion.status === "Accepted" || suggestion.status === "Edited").length,
    implementedCount: suggestions.filter((suggestion) => suggestion.status === "Implemented").length,
    rejectedCount: suggestions.filter((suggestion) => suggestion.status === "Rejected").length,
    quickWins: suggestions.filter(
      (suggestion) =>
        (suggestion.estimatedImpact === "High" || suggestion.estimatedImpact === "Medium") &&
        suggestion.status !== "Rejected" &&
        suggestion.status !== "Implemented"
    ).length
  };
}

export function groupTasksByStatus(tasks: WorkbookTask[]): WorkbookStatusColumn[] {
  const statuses: WorkbookTask["status"][] = ["Backlog", "In Progress", "Review", "Done"];

  return statuses.map((status) => ({
    status,
    tasks: tasks.filter((task) => task.status === status)
  }));
}

export function getKeywordSummary(keywords: KeywordRanking[]): KeywordSummary {
  const totalPosition = keywords.reduce((sum, keyword) => sum + keyword.currentPosition, 0);

  return {
    tracked: keywords.length,
    top3: keywords.filter((keyword) => keyword.currentPosition <= 3).length,
    top10: keywords.filter((keyword) => keyword.currentPosition <= 10).length,
    top20: keywords.filter((keyword) => keyword.currentPosition <= 20).length,
    improved: keywords.filter((keyword) => keyword.positionDelta > 0).length,
    declined: keywords.filter((keyword) => keyword.positionDelta < 0).length,
    averagePosition: keywords.length ? Math.round(totalPosition / keywords.length) : 0
  };
}

export function getReportReadinessSummary(reports: ReportSnapshot[]): ReportReadinessSummary {
  const totalReadiness = reports.reduce((sum, report) => sum + report.readinessScore, 0);

  return {
    total: reports.length,
    published: reports.filter((report) => report.status === "Published").length,
    needsReview: reports.filter((report) => report.status === "Review").length,
    drafts: reports.filter((report) => report.status === "Draft").length,
    averageReadiness: reports.length ? Math.round(totalReadiness / reports.length) : 0
  };
}

export function getLocalVisibilitySummary(profile: LocalVisibilityProfile): LocalVisibilitySummary {
  const scores = [
    { area: "GBP" as const, score: profile.gbp.score },
    { area: "Local SEO" as const, score: profile.localSeo.score },
    { area: "AEO" as const, score: profile.aeo.score },
    { area: "GEO" as const, score: profile.geo.score }
  ];
  const weakestArea = scores.reduce((lowest, current) => (current.score < lowest.score ? current : lowest)).area;
  const overallScore = Math.round(scores.reduce((total, current) => total + current.score, 0) / scores.length);

  return {
    overallScore,
    weakestArea,
    criticalActions: [
      profile.gbp.topIssues[0],
      profile.localSeo.topIssues[0],
      profile.aeo.topIssues[0],
      profile.geo.topIssues[0]
    ].filter((issue): issue is string => Boolean(issue)),
    gbpActionCount: profile.gbp.topIssues.length,
    unansweredReviews: profile.gbp.unansweredReviews,
    mapsVisibilityScore: profile.gbp.mapsVisibilityScore
  };
}

export function getOrganicGrowthDelta(
  baseline: OrganicGrowthMetricSnapshot,
  latest: OrganicGrowthMetricSnapshot
): OrganicGrowthDelta {
  return {
    searchImpressionsDelta: latest.searchImpressions - baseline.searchImpressions,
    organicClicksDelta: latest.organicClicks - baseline.organicClicks,
    organicLeadsDelta: latest.organicLeads - baseline.organicLeads,
    aeoVisibilityDelta: latest.aeoVisibility - baseline.aeoVisibility,
    geoVisibilityDelta: latest.geoVisibility - baseline.geoVisibility
  };
}

export function getActionIntelligenceSummary(actions: ActionItem[]): ActionIntelligenceSummary {
  const impactTotal = actions.reduce((sum, action) => sum + action.impactScore, 0);

  return {
    total: actions.length,
    completed: actions.filter((action) => action.status === "Done").length,
    inProgress: actions.filter((action) => action.status === "In Progress" || action.status === "Evidence Review")
      .length,
    blocked: actions.filter((action) => action.status === "Blocked").length,
    outsideProduct: actions.filter((action) => action.executionMode === "outside-rankflow").length,
    evidencePending: actions.filter(
      (action) =>
        action.status !== "Done" &&
        action.evidenceRequired &&
        action.evidence.some((evidence) => evidence.approvalStatus === "Pending")
    ).length,
    averageImpactScore: actions.length ? Math.round(impactTotal / actions.length) : 0
  };
}

export function getExpertEfficiencySummary(experts: ExpertEfficiency[]): ExpertEfficiencySummary {
  const teamAssigned = experts.reduce((sum, expert) => sum + expert.assignedActions, 0);
  const teamCompleted = experts.reduce((sum, expert) => sum + expert.completedActions, 0);
  const evidenceApprovalTotal = experts.reduce((sum, expert) => sum + expert.evidenceApprovalRate, 0);

  return {
    teamAssigned,
    teamCompleted,
    completionRate: teamAssigned ? Math.round((teamCompleted / teamAssigned) * 100) : 0,
    overdue: experts.reduce((sum, expert) => sum + expert.overdueActions, 0),
    averageEvidenceApprovalRate: experts.length ? Math.round(evidenceApprovalTotal / experts.length) : 0,
    impactDelivered: experts.reduce((sum, expert) => sum + expert.impactDelivered, 0)
  };
}

export function getAiBrainSummary(brain: AiBrainProfile): AiBrainSummary {
  return {
    status: brain.status,
    confidenceScore: brain.confidenceScore,
    dataCoverageScore: brain.dataCoverageScore,
    highPriorityRecommendations: brain.recommendations.filter((recommendation) => recommendation.priority === "high")
      .length,
    approvalRequired: brain.recommendations.filter((recommendation) => recommendation.requiresApproval).length,
    highRisks: brain.risks.filter((risk) => risk.severity === "high" || risk.severity === "critical").length,
    clientNarratives: brain.narratives.filter((narrative) => narrative.audience === "client").length
  };
}

export function getAuditIntelligenceSummary(stack: AuditIntelligenceStack): AuditIntelligenceSummary {
  return {
    connectedSources: stack.sourceStatuses.filter((source) => source.status === "Connected").length,
    needsSetup: stack.sourceStatuses.filter((source) => source.status === "Needs Setup").length,
    technicalIssues: stack.technicalChecks.reduce((sum, check) => sum + check.failedUrls, 0),
    criticalTechnicalIssues: stack.technicalChecks
      .filter((check) => check.severity === "critical")
      .reduce((sum, check) => sum + check.failedUrls, 0),
    performanceSignals: stack.searchPerformance.length,
    authoritySignals: stack.authoritySignals.length,
    claudeReady: stack.claudeBrain.status === "Ready" || stack.claudeBrain.status === "Needs Approval"
  };
}

export function hasWorkspaceAccess(
  role: RankFlowRole,
  accessList: WorkspaceAccess[],
  workspaceId: string
): boolean {
  if (role === "super_admin" || role === "hod") return true;
  return accessList.some((access) => access.workspaceId === workspaceId);
}

export function canAccessModule(
  role: RankFlowRole,
  access: WorkspaceAccess | undefined,
  module: RankFlowModule
): boolean {
  if (role === "super_admin" || role === "hod") return true;
  if (role === "client") return module === "client-portal";
  return Boolean(access?.modulesEnabled.includes(module));
}

export function getVisibleModules(role: RankFlowRole, accessList: WorkspaceAccess[]): RankFlowModule[] {
  if (role === "client") return ["client-portal"];

  if (role === "super_admin" || role === "hod") {
    return [
      "dashboard",
      "ai-brain",
      "audit-intelligence",
      "growth-cycle",
      "scan-history",
      "on-page-audit",
      "ai-suggestions",
      "local-visibility",
      "keywords",
      "workbook",
      "reports"
    ];
  }

  return Array.from(new Set(accessList.flatMap((access) => access.modulesEnabled)));
}

export function canPerformAction(
  role: RankFlowRole,
  action: RankFlowAction,
  access?: WorkspaceAccess
): boolean {
  if (role === "super_admin" || role === "hod") return true;

  if (role === "client") {
    return action === "view-client-portal";
  }

  if (!access) return false;

  if (action === "create-workspace" || action === "delete-workspace") {
    return role === "manager";
  }

  if (action === "run-scan") return access.canRunScans;
  if (action === "assign-task") return access.canAssignTasks;
  if (action === "update-task") return role === "manager" || role === "specialist";
  if (action === "review-suggestion") return access.suggestionAccess === "full";
  if (action === "generate-report") return access.canGenerateReports;
  if (action === "view-client-portal") return true;

  return false;
}
