import type {
  AiSuggestion,
  KeywordRanking,
  KeywordSummary,
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
    return ["dashboard", "scan-history", "on-page-audit", "ai-suggestions", "keywords", "workbook", "reports"];
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
