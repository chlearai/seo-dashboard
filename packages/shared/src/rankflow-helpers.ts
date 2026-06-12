import type {
  ActionIntelligenceSummary,
  ActionItem,
  AiBrainProfile,
  AiBrainSummary,
  AiWorkflowApproval,
  AiWorkflowConsole,
  AiWorkflowItem,
  AiWorkflowStatus,
  AuditCategory,
  AuditCategoryDelta,
  AuditEvidenceSourceStatus,
  AttributedAction,
  CrawlerFinding,
  CrawlerEvaluation,
  CrawlerPageSnapshot,
  CrawlerSource,
  CrawlerRuleCheckSummary,
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
  Severity,
  WorkbookStatusColumn,
  WorkbookTask,
  WorkspaceAccess,
  ScreamingFrogImportRow,
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

export interface WorkspaceLocaleSummary {
  market: string;
  language: string;
  currency: string;
  timeZone: string;
  localeTag: string;
}

function formatLanguage(locale: string, country: string) {
  if (locale === "en-US") return "English (US)";
  if (locale === "en-IN") return "English (India)";
  if (locale === "en-GB") return "English (UK)";

  const [languageCode] = locale.split("-");
  const language = languageCode === "en" ? "English" : languageCode.toUpperCase();
  return `${language} (${country})`;
}

export function getWorkspaceLocaleSummary(workspace: Workspace): WorkspaceLocaleSummary {
  return {
    market: workspace.locale.country,
    language: formatLanguage(workspace.locale.language, workspace.locale.country),
    currency: workspace.locale.currency,
    timeZone: workspace.locale.timeZone,
    localeTag: workspace.locale.language
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

function hasApprovedEvidence(action: ActionItem) {
  return action.evidence.some((evidence) => evidence.approvalStatus === "Approved");
}

function hasPendingEvidence(action: ActionItem) {
  return action.evidence.some((evidence) => evidence.approvalStatus === "Pending");
}

function getWorkflowStatus(action: ActionItem | undefined, requiresApproval: boolean): AiWorkflowStatus {
  if (!action) {
    return requiresApproval ? "needs-approval" : "report-ready";
  }

  if (action.status === "Done" && hasApprovedEvidence(action)) {
    return "measured";
  }

  if (action.evidenceRequired && hasPendingEvidence(action)) {
    return "blocked-by-proof";
  }

  if (action.status === "In Progress" || action.status === "Evidence Review") {
    return "in-execution";
  }

  return requiresApproval ? "needs-approval" : "report-ready";
}

function getHumanGate(
  status: AiWorkflowStatus,
  requiresApproval: boolean,
  approval: AiWorkflowApproval | undefined
) {
  if (approval?.decision === "approved") {
    return `Approved by ${approval.decidedBy}`;
  }
  if (approval?.decision === "rejected") {
    return `Rejected by ${approval.decidedBy}`;
  }
  if (status === "measured") {
    return "Approved evidence";
  }
  if (status === "report-ready") {
    return "Human approved narrative";
  }
  return requiresApproval ? "Needs HOD approval" : "Human approval optional";
}

function getEvidenceState(status: AiWorkflowStatus, action: ActionItem | undefined) {
  if (status === "rejected") {
    return "Not approved for execution";
  }
  if (status === "report-ready") {
    return "Ready for report";
  }
  if (!action) {
    return "No linked action";
  }
  if (status === "measured") {
    return "Measured in re-audit";
  }
  if (action.evidenceRequired && hasPendingEvidence(action)) {
    return "Pending evidence approval";
  }
  if (action.evidenceRequired && action.evidence.length === 0) {
    return "No proof submitted";
  }
  return action.evidenceRequired ? "Proof required" : "Proof optional";
}

export function buildAiWorkflowConsole({
  workspaceId,
  brain,
  actions,
  approvals = []
}: {
  workspaceId: string;
  brain: AiBrainProfile | undefined;
  actions: ActionItem[];
  approvals?: AiWorkflowApproval[];
}): AiWorkflowConsole {
  const measuredActions = actions.filter(
    (action) => action.status === "Done" && hasApprovedEvidence(action) && action.clientReportContribution
  ).length;
  const blockedActions = actions.filter(
    (action) =>
      action.status !== "Done" &&
      action.evidenceRequired &&
      (action.evidence.length === 0 || action.evidence.some((evidence) => evidence.approvalStatus === "Pending"))
  ).length;

  if (!brain) {
    return {
      workspaceId,
      title: "AI-native SEO operating system",
      subtitle: "Human-approved AI workflow is waiting for connected intelligence.",
      status: "Needs Data",
      automationMode: "approval-required",
      confidenceScore: 0,
      dataCoverageScore: 0,
      summary: {
        recommendations: 0,
        needsApproval: 0,
        approved: 0,
        rejected: 0,
        inExecution: 0,
        blockedByProof: 0,
        reportReady: 0,
        measured: 0
      },
      workflowItems: [],
      narratives: [],
      reAuditProof: {
        label: "Measured in re-audit",
        measuredActions: 0,
        blockedActions: 0
      }
    };
  }

  const workflowItems: AiWorkflowItem[] = brain.recommendations.map((recommendation) => {
    const action = actions.find((candidate) => candidate.id === recommendation.targetAction);
    const approval = approvals.find((candidate) => candidate.recommendationId === recommendation.id);
    const status = approval?.decision === "rejected"
      ? "rejected"
      : getWorkflowStatus(action, recommendation.requiresApproval);

    return {
      id: recommendation.id,
      title: recommendation.title,
      reason: recommendation.reason,
      priority: recommendation.priority,
      expectedLift: recommendation.expectedLift,
      status,
      humanGate: getHumanGate(status, recommendation.requiresApproval, approval),
      evidenceState: getEvidenceState(status, action),
      approvalDecision: approval?.decision,
      decidedAt: approval?.decidedAt,
      decidedBy: approval?.decidedBy,
      actionId: action?.id,
      owner: action?.owner,
      dueDate: action?.dueDate
    };
  });

  const narratives = brain.narratives.map((narrative) => ({
    id: narrative.id,
    title: narrative.title,
    audience: narrative.audience,
    summary: narrative.summary,
    state: narrative.audience === "client" ? "human-approved" as const : "draft" as const
  }));

  return {
    workspaceId,
    title: "AI-native SEO operating system",
    subtitle: "Evidence-led AI recommendations move through human approval, execution, reporting, and re-audit proof.",
    status: brain.status,
    automationMode: brain.automationMode,
    confidenceScore: brain.confidenceScore,
    dataCoverageScore: brain.dataCoverageScore,
    summary: {
      recommendations: workflowItems.length,
      needsApproval: workflowItems.filter((item) => item.humanGate === "Needs HOD approval").length,
      approved: workflowItems.filter((item) => item.approvalDecision === "approved").length,
      rejected: workflowItems.filter((item) => item.approvalDecision === "rejected").length,
      inExecution: workflowItems.filter((item) => item.status === "in-execution").length,
      blockedByProof: workflowItems.filter((item) => item.status === "blocked-by-proof").length,
      reportReady: workflowItems.filter((item) => item.status === "report-ready").length +
        narratives.filter((narrative) => narrative.audience === "client").length,
      measured: measuredActions
    },
    workflowItems,
    narratives,
    reAuditProof: {
      label: "Measured in re-audit",
      measuredActions,
      blockedActions
    }
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

function normalizeUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function parseInteger(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells.map((cell) => cell.trim());
}

export function parseScreamingFrogCsv(csvText: string): ScreamingFrogImportRow[] {
  const trimmed = csvText.trim();
  if (!trimmed) return [];

  const [headerLine, ...lines] = trimmed.split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

  return lines.filter(Boolean).map((line) => {
    const cells = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])) as Record<string, string>;

    return {
      address: row.Address ?? row["URL"] ?? "",
      statusCode: parseInteger(row["Status Code"]),
      title: row["Title 1"]?.trim() || null,
      metaDescription: row["Meta Description 1"]?.trim() || null,
      h1: row["H1-1"]?.trim() || null,
      canonicalUrl: row["Canonical Link Element 1"]?.trim() || null,
      indexability: row.Indexability ?? "",
      imagesMissingAltText: parseInteger(row["Images Missing Alt Text"]),
      brokenInternalLinks: parseInteger(row["Broken Internal Links"]),
      responseTimeMs: parseInteger(row["Response Time (ms)"] ?? row["Response Time"])
    };
  });
}

function mapScreamingFrogRowsToPages(rows: ScreamingFrogImportRow[]): CrawlerPageSnapshot[] {
  return rows.map((row, index) => ({
    id: `sf-${index + 1}`,
    url: row.address,
    priority: row.indexability.toLowerCase().includes("indexable") ? "core" : "important",
    statusCode: row.statusCode,
    title: row.title,
    metaDescription: row.metaDescription,
    h1: row.h1,
    canonicalUrl: row.canonicalUrl,
    indexable: row.indexability.toLowerCase().includes("indexable") && !row.indexability.toLowerCase().includes("non"),
    schemaTypes: [],
    missingImageAlts: row.imagesMissingAltText,
    brokenInternalLinks: row.brokenInternalLinks,
    loadTimeMs: row.responseTimeMs
  }));
}

interface CrawlerEvaluationOptions {
  source?: CrawlerSource;
  label?: string;
  primaryUse?: string;
  status?: AuditEvidenceSourceStatus["status"];
  lastSyncedAt?: string;
}

export function evaluateCrawlerPages(
  pages: CrawlerPageSnapshot[],
  options: CrawlerEvaluationOptions = {}
): CrawlerEvaluation {
  const source = options.source ?? "own-crawler";
  const label = options.label ?? "Own crawler";
  const findings: CrawlerFinding[] = [];
  const ruleChecks: CrawlerRuleCheckSummary[] = [];
  const duplicateMetaGroups = new Map<string, CrawlerPageSnapshot[]>();

  for (const page of pages) {
    const metaKey = page.metaDescription?.trim();
    if (metaKey) {
      const existing = duplicateMetaGroups.get(metaKey) ?? [];
      existing.push(page);
      duplicateMetaGroups.set(metaKey, existing);
    }

    if (!page.title?.trim()) {
      findings.push({
        id: `${page.id}-missing-title`,
        rule: "missing-title",
        label: "Missing title",
        severity: "high",
        url: page.url,
        detail: "The page does not expose a title tag."
      });
    }

    if (!page.h1?.trim()) {
      findings.push({
        id: `${page.id}-missing-h1`,
        rule: "missing-h1",
        label: "Missing H1",
        severity: "medium",
        url: page.url,
        detail: "The page does not expose a primary H1 heading."
      });
    }

    if (page.canonicalUrl && normalizeUrl(page.canonicalUrl) !== normalizeUrl(page.url)) {
      findings.push({
        id: `${page.id}-canonical-conflict`,
        rule: "canonical-conflict",
        label: "Canonical conflict",
        severity: "critical",
        url: page.url,
        detail: `Canonical points to ${page.canonicalUrl} instead of the page URL.`
      });
    }

    if (!page.indexable && page.priority !== "supporting") {
      findings.push({
        id: `${page.id}-blocked-important-page`,
        rule: "blocked-important-page",
        label: "Blocked important page",
        severity: "critical",
        url: page.url,
        detail: "An important page is not indexable."
      });
    }

    if (page.statusCode >= 400) {
      findings.push({
        id: `${page.id}-status-code`,
        rule: "status-code",
        label: "Status code error",
        severity: page.statusCode >= 500 ? "critical" : "high",
        url: page.url,
        detail: `The page returned HTTP ${page.statusCode}.`
      });
    }

    if (page.brokenInternalLinks > 0) {
      findings.push({
        id: `${page.id}-broken-internal-links`,
        rule: "broken-internal-links",
        label: "Broken internal links",
        severity: "high",
        url: page.url,
        detail: `${page.brokenInternalLinks} broken internal links detected.`
      });
    }

    if (page.schemaTypes.length === 0) {
      findings.push({
        id: `${page.id}-schema-missing`,
        rule: "schema-missing",
        label: "Schema missing",
        severity: "high",
        url: page.url,
        detail: "No structured data types were detected on the page."
      });
    }

    if (page.missingImageAlts > 0) {
      findings.push({
        id: `${page.id}-image-alt-missing`,
        rule: "image-alt-missing",
        label: "Image alt missing",
        severity: "medium",
        url: page.url,
        detail: `${page.missingImageAlts} images are missing alt text.`
      });
    }

    if (page.loadTimeMs > 2500) {
      findings.push({
        id: `${page.id}-slow-page`,
        rule: "slow-page",
        label: "Slow page",
        severity: "high",
        url: page.url,
        detail: `Mobile load time is ${page.loadTimeMs} ms.`
      });
    }
  }

  for (const [metaDescription, metaPages] of duplicateMetaGroups.entries()) {
    if (metaPages.length > 1) {
      for (const page of metaPages) {
        findings.push({
          id: `${page.id}-duplicate-meta`,
          rule: "duplicate-meta",
          label: "Duplicate meta description",
          severity: "medium",
          url: page.url,
          detail: `Shared meta description: ${metaDescription}`
        });
      }
    }
  }

  const pageFindingMap = new Map<string, CrawlerFinding[]>();
  for (const finding of findings) {
    const bucket = pageFindingMap.get(finding.url) ?? [];
    bucket.push(finding);
    pageFindingMap.set(finding.url, bucket);
  }

  const summary = {
    pagesCrawled: pages.length,
    healthyPages: pages.filter((page) => (pageFindingMap.get(page.url) ?? []).length === 0).length,
    findings: findings.length,
    criticalFindings: findings.filter((finding) => finding.severity === "critical").length,
    missingTitles: findings.filter((finding) => finding.rule === "missing-title").length,
    missingH1s: findings.filter((finding) => finding.rule === "missing-h1").length,
    duplicateMetaDescriptions: findings.filter((finding) => finding.rule === "duplicate-meta").length,
    canonicalConflicts: findings.filter((finding) => finding.rule === "canonical-conflict").length,
    blockedImportantPages: findings.filter((finding) => finding.rule === "blocked-important-page").length,
    brokenInternalLinks: findings.filter((finding) => finding.rule === "broken-internal-links").length,
    schemaMissing: findings.filter((finding) => finding.rule === "schema-missing").length,
    imageAltMissing: findings.filter((finding) => finding.rule === "image-alt-missing").length,
    slowPages: findings.filter((finding) => finding.rule === "slow-page").length,
    statusCodeErrors: findings.filter((finding) => finding.rule === "status-code").length
  };

  const makeCheck = (
    id: string,
    label: string,
    description: string,
    category: CrawlerRuleCheckSummary["category"],
    severity: Severity,
    failedUrls: number
  ): CrawlerRuleCheckSummary => ({
    id,
    label,
    description,
    category,
    source,
    affectedUrls: failedUrls,
    passedUrls: Math.max(0, pages.length - failedUrls),
    failedUrls,
    severity
  });

  ruleChecks.push(
    makeCheck("crawler-title", "Missing titles", "Pages without title tags.", "technical", "high", summary.missingTitles),
    makeCheck("crawler-h1", "Missing H1s", "Pages without a primary H1 heading.", "content", "medium", summary.missingH1s),
    makeCheck(
      "crawler-meta",
      "Duplicate meta descriptions",
      "Pages sharing the same meta description.",
      "content",
      "medium",
      summary.duplicateMetaDescriptions
    ),
    makeCheck(
      "crawler-canonical",
      "Canonical conflicts",
      "Pages canonicalizing to a different URL.",
      "indexability",
      "critical",
      summary.canonicalConflicts
    ),
    makeCheck(
      "crawler-indexability",
      "Blocked important pages",
      "Important pages that are not indexable.",
      "indexability",
      "critical",
      summary.blockedImportantPages
    ),
    makeCheck(
      "crawler-links",
      "Broken internal links",
      "Pages with broken internal links.",
      "internal-linking",
      "high",
      summary.brokenInternalLinks
    ),
    makeCheck("crawler-schema", "Schema missing", "Pages without structured data.", "schema", "high", summary.schemaMissing),
    makeCheck("crawler-alt", "Image alt missing", "Images without alt text.", "content", "medium", summary.imageAltMissing),
    makeCheck("crawler-speed", "Slow pages", "Pages above the load-time threshold.", "performance", "high", summary.slowPages),
    makeCheck("crawler-status", "Status code errors", "Pages returning 4xx or 5xx codes.", "technical", "critical", summary.statusCodeErrors)
  );

  return {
    sourceStatus: {
      source,
      label,
      status: options.status ?? (pages.length > 0 ? "Connected" : "Needs Setup"),
      coverageScore: pages.length ? Math.min(100, 60 + pages.length * 4) : 0,
      lastSyncedAt: options.lastSyncedAt ?? (pages.length ? "Live rule evaluation" : "Not connected"),
      recordsAvailable: pages.length,
      primaryUse: options.primaryUse ?? "Core technical rule checks"
    },
    ruleChecks,
    findings,
    summary
  };
}

export function evaluateScreamingFrogCsv(csvText: string): CrawlerEvaluation {
  return evaluateCrawlerPages(mapScreamingFrogRowsToPages(parseScreamingFrogCsv(csvText)), {
    source: "screaming-frog",
    label: "Screaming Frog",
    status: "Import Ready",
    primaryUse: "Deep technical crawl import",
    lastSyncedAt: "Imported from CSV"
  });
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
      "own-crawler",
      "screaming-frog",
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

export function generateVerdictLabel(comparison: ScanComparison): string {
  const { scoreDelta, resolvedCritical, newCritical } = comparison;

  if (scoreDelta > 0 && newCritical === 0 && resolvedCritical > 0) {
    return "Score improved with no new critical issues";
  }
  if (scoreDelta > 0 && newCritical > 0) {
    return "Score improved but new critical regressions detected";
  }
  if (scoreDelta === 0) {
    return "Score unchanged";
  }
  return `Score regressed by ${Math.abs(scoreDelta)} points`;
}

export function attributeActionsToScoreChange(
  actions: ActionItem[],
  sinceScan: ScanSnapshot,
  vsScan: ScanSnapshot
): AttributedAction[] {
  const sinceTs = new Date(sinceScan.completedAt).getTime();
  const vsTs = new Date(vsScan.completedAt).getTime();

  return actions
    .filter((action) => {
      if (action.status !== "Done") return false;
      if (!action.completedAt) return false;
      const actionTs = new Date(action.completedAt).getTime();
      return actionTs > vsTs && actionTs <= sinceTs;
    })
    .filter((action) =>
      action.evidence.some((ev) => ev.approvalStatus === "Approved")
    )
    .map((action) => ({
      action,
      category: {
        id: action.impactArea,
        name: action.impactArea,
        score: 0,
        failedChecks: 0,
        totalChecks: 0,
        topIssue: "",
        severity: action.priority
      } as AuditCategory,
      scoreBefore: 0,
      scoreAfter: 0,
    }));
}

export function generateReAuditNarrative(
  comparison: ScanComparison,
  attributedActions: AttributedAction[],
  categoryDeltas: AuditCategoryDelta[]
): string {
  const { newCritical } = comparison;
  const verdict = generateVerdictLabel(comparison);
  const improved = categoryDeltas.filter((c) => c.delta > 0);
  const regressed = categoryDeltas.filter((c) => c.delta < 0);

  const parts: string[] = [verdict];

  if (attributedActions.length > 0) {
    parts.push(
      `${attributedActions.length} completed action${attributedActions.length === 1 ? "" : "s"} with approved evidence were tracked during this period.`
    );
  }

  if (improved.length > 0) {
    const names = improved.map((c) => c.name).join(", ");
    parts.push(`${names} improved.`);
  }

  if (regressed.length > 0) {
    const names = regressed.map((c) => c.name).join(", ");
    parts.push(`${names} showed regression and may need attention before the next cycle.`);
  }

  if (newCritical > 0) {
    parts.push(`${newCritical} new critical issue${newCritical === 1 ? "" : "s"} were detected and assigned to the workbook.`);
  }

  return parts.join(" ");
}
