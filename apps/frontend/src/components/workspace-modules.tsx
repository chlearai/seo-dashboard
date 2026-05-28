import Link from "next/link";
import {
  compareScans,
  getActionIntelligenceSummary,
  getAiBrainSummary,
  getAuditIntelligenceSummary,
  getExpertEfficiencySummary,
  getKeywordSummary,
  getLocalVisibilitySummary,
  getOrganicGrowthDelta,
  getReportReadinessSummary,
  getSuggestionInboxSummary,
  groupTasksByStatus,
  type ActionItem,
  type AiBrainProfile,
  type AiSuggestion,
  type AuditCategory,
  type AuditIntelligenceStack,
  type ExpertEfficiency,
  type KeywordRanking,
  type LocalVisibilityProfile,
  type OrganicGrowthCycle,
  type OrganicGrowthMetricSnapshot,
  type ReportSnapshot,
  type ScanSnapshot,
  type WorkbookTask,
  type Workspace
} from "@rankflow/shared";
import { Delta, MetricCard, PageHeader, ScorePill, ToneBadge } from "@/components/ui";

export function ScanHistoryModule({
  scans,
  workspace
}: {
  scans: ScanSnapshot[];
  workspace: Workspace;
}) {
  const latest = scans[0];
  const previous = scans[1];
  const comparison = latest && previous ? compareScans(latest, previous) : null;

  return (
    <main className="page">
      <PageHeader
        eyebrow="Scan Engine"
        title={`${workspace.clientName} scan history`}
        description="Versioned scan snapshots with score movement, issue deltas, generated suggestions, and comparison-ready evidence."
        actionHref={`/workspaces/${workspace.id}`}
        actionLabel="Workspace overview"
      />

      {comparison ? (
        <section className="summary-grid">
          <MetricCard label="Score Delta" value={`${comparison.scoreDelta > 0 ? "+" : ""}${comparison.scoreDelta}`} detail="Latest vs previous" />
          <MetricCard label="Critical Resolved" value={comparison.resolvedCritical} detail="Issues removed since prior scan" />
          <MetricCard label="New Critical" value={comparison.newCritical} detail="New critical regressions" />
          <MetricCard label="Suggestion Delta" value={`${comparison.suggestionsDelta > 0 ? "+" : ""}${comparison.suggestionsDelta}`} detail="Generated vs previous" />
        </section>
      ) : null}

      <section className="table-panel">
        <div className="table-header">
          <div>
            <p className="eyebrow">Immutable history</p>
            <h2>All scans</h2>
          </div>
          <span className="small-label">Newest first</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Completed</th>
              <th>Type</th>
              <th>Status</th>
              <th>Pages</th>
              <th>Keywords</th>
              <th>Score</th>
              <th>Delta</th>
              <th>Issues</th>
              <th>AI Suggestions</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((scan) => (
              <tr key={scan.id}>
                <td>{scan.completedAt}</td>
                <td>{scan.type}</td>
                <td>
                  <ToneBadge label={scan.status} tone={scan.status === "Failed" ? "critical" : "success"} />
                </td>
                <td>{scan.pagesCrawled}</td>
                <td>{scan.keywordsChecked}</td>
                <td>
                  <ScorePill score={scan.score} />
                </td>
                <td>
                  <Delta value={scan.delta} />
                </td>
                <td>
                  C{scan.issues.critical} / H{scan.issues.high} / M{scan.issues.medium} / L{scan.issues.low}
                </td>
                <td>{scan.suggestionsGenerated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export function OnPageAuditModule({
  auditCategories,
  workspace
}: {
  auditCategories: AuditCategory[];
  workspace: Workspace;
}) {
  return (
    <main className="page">
      <PageHeader
        eyebrow="On-Page Audit"
        title={`${workspace.clientName} category health`}
        description="Category-level audit coverage for title tags, content, schema, technical signals, performance, images, and internal links."
        actionHref={`/workspaces/${workspace.id}/suggestions`}
        actionLabel="Open AI suggestions"
      />

      <section className="audit-grid">
        {auditCategories.map((category) => (
          <article className="audit-card" key={category.id}>
            <strong>{category.name}</strong>
            <p>
              <ScorePill score={category.score} />
            </p>
            <p className="muted">
              {category.failedChecks} failed of {category.totalChecks} checks.
            </p>
            <ToneBadge label={category.topIssue} tone={category.severity} />
          </article>
        ))}
      </section>
    </main>
  );
}

export function AiSuggestionsModule({
  suggestions,
  workspace
}: {
  suggestions: AiSuggestion[];
  workspace: Workspace;
}) {
  const summary = getSuggestionInboxSummary(suggestions);

  return (
    <main className="page">
      <PageHeader
        eyebrow="AI Suggestion Inbox"
        title={`${workspace.clientName} source-backed recommendations`}
        description="Prioritize high-impact fixes, review source checks, and move accepted recommendations into implementation."
        actionHref={`/workspaces/${workspace.id}/workbook`}
        actionLabel="Open workbook"
      />

      <section className="summary-grid">
        <MetricCard label="Total Suggestions" value={summary.total} detail="Current inbox volume" />
        <MetricCard label="New" value={summary.newCount} detail="Awaiting review" />
        <MetricCard label="Accepted" value={summary.acceptedCount} detail="Ready for tasking" />
        <MetricCard label="Implemented" value={summary.implementedCount} detail="Closed with evidence" />
        <MetricCard label="Rejected" value={summary.rejectedCount} detail="Dismissed with reason" />
        <MetricCard label="Quick Wins" value={summary.quickWins} detail="Actionable high or medium impact" />
      </section>

      <section className="module-list">
        {suggestions.map((suggestion) => (
          <article className="suggestion-card" key={suggestion.id}>
            <div className="card-row">
              <div>
                <strong>{suggestion.title}</strong>
                <p className="muted">{suggestion.page}</p>
              </div>
              <ToneBadge label={suggestion.status} tone={suggestion.status === "Rejected" ? "critical" : "success"} />
            </div>
            <p>{suggestion.recommendation}</p>
            <p>
              <ToneBadge label={suggestion.severity} tone={suggestion.severity} />{" "}
              <span className="muted">{suggestion.source} · Estimated impact {suggestion.estimatedImpact}</span>
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

export function WorkbookModule({
  tasks,
  workspace
}: {
  tasks: WorkbookTask[];
  workspace: Workspace;
}) {
  const columns = groupTasksByStatus(tasks);

  return (
    <main className="page">
      <PageHeader
        eyebrow="SEO Workbook"
        title={`${workspace.clientName} execution board`}
        description="Operational task queue for accepted suggestions, issue remediation, ownership, due dates, and implementation evidence."
        actionHref={`/workspaces/${workspace.id}/scans`}
        actionLabel="Review scan impact"
      />

      <section className="task-board">
        {columns.map((column) => (
          <div className="panel kanban-column" key={column.status}>
            <div className="card-row">
              <h2>{column.status}</h2>
              <span className="badge low">{column.tasks.length}</span>
            </div>
            <ul className="stack-list">
              {column.tasks.map((task) => (
                <li className="task-card" key={task.id}>
                  <strong>{task.title}</strong>
                  <p className="muted">
                    {task.owner} · Due {task.dueDate}
                  </p>
                  <p>
                    <ToneBadge label={task.priority} tone={task.priority} />{" "}
                    <span className="muted">{task.evidenceRequired ? "Evidence required" : "No evidence required"}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <Link className="button" href={`/workspaces/${workspace.id}`}>
        Back to workspace
      </Link>
    </main>
  );
}

export function KeywordsModule({
  keywords,
  workspace
}: {
  keywords: KeywordRanking[];
  workspace: Workspace;
}) {
  const summary = getKeywordSummary(keywords);

  return (
    <main className="page">
      <PageHeader
        eyebrow="Rank Tracking"
        title={`${workspace.clientName} keyword visibility`}
        description="Tracked search terms with intent, mapped pages, position movement, search volume, difficulty, and SERP feature ownership."
        actionHref={`/workspaces/${workspace.id}/reports`}
        actionLabel="Open reports"
      />

      <section className="summary-grid">
        <MetricCard label="Tracked Keywords" value={summary.tracked} detail="Active rank snapshots" />
        <MetricCard label="Top 3" value={summary.top3} detail="Highest visibility terms" />
        <MetricCard label="Top 10" value={summary.top10} detail="First-page rankings" />
        <MetricCard label="Top 20" value={summary.top20} detail="Near first page" />
        <MetricCard label="Improved" value={summary.improved} detail="Moved up since previous" />
        <MetricCard label="Average Position" value={summary.averagePosition} detail="Across tracked terms" />
      </section>

      <section className="table-panel">
        <div className="table-header">
          <div>
            <p className="eyebrow">Keyword strategy</p>
            <h2>Rank snapshot</h2>
          </div>
          <span className="small-label">Daily position movement</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Intent</th>
              <th>Mapped page</th>
              <th>Position</th>
              <th>Movement</th>
              <th>Volume</th>
              <th>Difficulty</th>
              <th>SERP</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((keyword) => (
              <tr key={keyword.id}>
                <td><strong>{keyword.keyword}</strong></td>
                <td>{keyword.intent}</td>
                <td>{keyword.mappedPage}</td>
                <td>{keyword.currentPosition}</td>
                <td><Delta value={keyword.positionDelta} /></td>
                <td>{keyword.volume.toLocaleString("en-US")}</td>
                <td>{keyword.difficulty}</td>
                <td>{keyword.serpFeatures.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export function ReportsModule({
  reports,
  workspace
}: {
  reports: ReportSnapshot[];
  workspace: Workspace;
}) {
  const summary = getReportReadinessSummary(reports);

  return (
    <main className="page">
      <PageHeader
        eyebrow="Reporting System"
        title={`${workspace.clientName} report readiness`}
        description="Live reporting pipeline for scheduled SEO reports, client-visible progress, manager ownership, and publication readiness."
        actionHref={`/client-portal/${workspace.id}`}
        actionLabel="Preview client portal"
      />

      <section className="summary-grid">
        <MetricCard label="Reports" value={summary.total} detail="Tracked report cycles" />
        <MetricCard label="Published" value={summary.published} detail="Client-visible reports" />
        <MetricCard label="Needs Review" value={summary.needsReview} detail="Awaiting manager/HOD sign-off" />
        <MetricCard label="Drafts" value={summary.drafts} detail="Still being assembled" />
        <MetricCard label="Avg Readiness" value={`${summary.averageReadiness}%`} detail="Section completion" />
      </section>

      <section className="module-list">
        {reports.map((report) => (
          <article className="suggestion-card" key={report.id}>
            <div className="card-row">
              <div>
                <strong>{report.title}</strong>
                <p className="muted">{report.period} · Owner {report.owner}</p>
              </div>
              <ToneBadge label={report.status} tone={report.status === "Draft" ? "medium" : "success"} />
            </div>
            <p className="muted">
              Due {report.dueDate}. {report.sectionsReady} of {report.totalSections} report sections are ready.
            </p>
            <p>
              <ScorePill score={report.readinessScore} />{" "}
              <span className="muted">{report.clientVisible ? "Visible in client portal" : "Internal until published"}</span>
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

export function OrganicGrowthCycleModule({
  actions,
  cycles,
  experts,
  metrics,
  workspace
}: {
  actions: ActionItem[];
  cycles: OrganicGrowthCycle[];
  experts: ExpertEfficiency[];
  metrics: OrganicGrowthMetricSnapshot[];
  workspace: Workspace;
}) {
  const latestCycle = cycles[0];
  const baseline = metrics[0];
  const latest = metrics[metrics.length - 1] ?? metrics[0];
  const growthDelta = baseline && latest ? getOrganicGrowthDelta(baseline, latest) : null;
  const actionSummary = getActionIntelligenceSummary(actions);
  const expertSummary = getExpertEfficiencySummary(experts);
  const stages = ["Audit", "Analyse", "Act", "Report", "Re-audit"];

  return (
    <main className="page">
      <PageHeader
        eyebrow="Organic Growth Operating System"
        title={`${workspace.clientName} organic growth cycle`}
        description="Continuous audit, analysis, action, reporting, and re-audit control for SEO, AEO, GEO, local visibility, authority, traffic, and organic leads."
        actionHref={`/workspaces/${workspace.id}/reports`}
        actionLabel="Open reports"
      />

      <section className="cycle-stage-grid" aria-label="Audit analyse act report cycle">
        {stages.map((stage) => (
          <article className={`cycle-stage ${latestCycle?.stage === stage ? "active" : ""}`} key={stage}>
            <span>{stage}</span>
            <strong>{latestCycle?.stage === stage ? "Current" : "Tracked"}</strong>
          </article>
        ))}
      </section>

      <section className="summary-grid">
        <MetricCard label="Search Impressions" value={latest?.searchImpressions.toLocaleString("en-US") ?? 0} detail={growthDelta ? `${growthDelta.searchImpressionsDelta.toLocaleString("en-US")} since baseline` : "Awaiting baseline"} />
        <MetricCard label="Ranking Improvement" value={latest?.rankingImproved ?? 0} detail={`${latest?.keywordsTop10 ?? 0} keywords in top 10`} />
        <MetricCard label="Organic Traffic" value={latest?.organicSessions.toLocaleString("en-US") ?? 0} detail={`${latest?.organicClicks.toLocaleString("en-US") ?? 0} organic clicks`} />
        <MetricCard label="Referral Traffic" value={latest?.referralSessions.toLocaleString("en-US") ?? 0} detail={`${latest?.referringDomains ?? 0} referring domains`} />
        <MetricCard label="Organic Leads" value={latest?.organicLeads ?? 0} detail={growthDelta ? `${growthDelta.organicLeadsDelta} since baseline` : "Lead tracking"} />
        <MetricCard label="Backlinks" value={latest?.backlinks.toLocaleString("en-US") ?? 0} detail={`+${latest?.newBacklinks ?? 0} new / -${latest?.lostBacklinks ?? 0} lost`} />
      </section>

      <section className="growth-metric-grid">
        <div className="panel">
          <p className="eyebrow">Brand progress</p>
          <h2>Organic visibility movement</h2>
          <dl className="metric-list">
            <div><dt>AEO visibility</dt><dd>{latest?.aeoVisibility ?? 0}%</dd></div>
            <div><dt>GEO visibility</dt><dd>{latest?.geoVisibility ?? 0}%</dd></div>
            <div><dt>Local visibility</dt><dd>{latest?.localVisibility ?? 0}%</dd></div>
            <div><dt>Technical health</dt><dd>{latest?.technicalHealth ?? 0}%</dd></div>
            <div><dt>Organic CTR</dt><dd>{latest?.organicCtr ?? 0}%</dd></div>
            <div><dt>Average position</dt><dd>{latest?.averagePosition ?? 0}</dd></div>
          </dl>
        </div>

        <div className="panel">
          <p className="eyebrow">Action intelligence</p>
          <h2>Execution control</h2>
          <dl className="metric-list">
            <div><dt>Total actions</dt><dd>{actionSummary.total}</dd></div>
            <div><dt>Completed</dt><dd>{actionSummary.completed}</dd></div>
            <div><dt>In progress</dt><dd>{actionSummary.inProgress}</dd></div>
            <div><dt>Outside RankFlow</dt><dd>{actionSummary.outsideProduct}</dd></div>
            <div><dt>Evidence pending</dt><dd>{actionSummary.evidencePending}</dd></div>
            <div><dt>Avg impact score</dt><dd>{actionSummary.averageImpactScore}</dd></div>
          </dl>
        </div>
      </section>

      <section className="table-panel action-ledger">
        <div className="table-header">
          <div>
            <p className="eyebrow">Act layer</p>
            <h2>Action ledger</h2>
          </div>
          <span className="small-label">Inside and outside product execution</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Source</th>
              <th>Owner</th>
              <th>Mode</th>
              <th>Status</th>
              <th>Evidence</th>
              <th>Impact</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((action) => {
              const evidenceStatus = action.evidenceRequired
                ? action.evidence[0]?.approvalStatus ?? "Missing"
                : "Not required";

              return (
                <tr key={action.id}>
                  <td><strong>{action.title}</strong><br /><span className="muted">{action.expectedImpact}</span></td>
                  <td>{action.source}</td>
                  <td>{action.owner}</td>
                  <td>{action.executionMode === "inside-rankflow" ? "Inside RankFlow" : "Outside RankFlow"}</td>
                  <td><ToneBadge label={action.status} tone={action.status === "Blocked" ? "critical" : "success"} /></td>
                  <td><span className="evidence-chip">{evidenceStatus}</span></td>
                  <td>{action.impactScore}</td>
                  <td>{action.dueDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <div className="card-row">
          <div>
            <p className="eyebrow">SEO Expert Efficiency</p>
            <h2>Team accountability</h2>
          </div>
          <span className="small-label">
            {expertSummary.teamCompleted}/{expertSummary.teamAssigned} completed · {expertSummary.completionRate}% completion
          </span>
        </div>
        <section className="expert-grid">
          {experts.map((expert) => (
            <article className="expert-card" key={expert.owner}>
              <strong>{expert.owner}</strong>
              <dl className="metric-list">
                <div><dt>Assigned</dt><dd>{expert.assignedActions}</dd></div>
                <div><dt>Completed</dt><dd>{expert.completedActions}</dd></div>
                <div><dt>Overdue</dt><dd>{expert.overdueActions}</dd></div>
                <div><dt>Evidence approval</dt><dd>{expert.evidenceApprovalRate}%</dd></div>
                <div><dt>Impact delivered</dt><dd>{expert.impactDelivered}</dd></div>
                <div><dt>Report contribution</dt><dd>{expert.clientReportContributions}</dd></div>
              </dl>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

export function AiBrainModule({
  brain,
  workspace
}: {
  brain: AiBrainProfile;
  workspace: Workspace;
}) {
  const summary = getAiBrainSummary(brain);

  return (
    <main className="page">
      <PageHeader
        eyebrow="LLM Brain"
        title={`${workspace.clientName} AI brain`}
        description="Approval-gated system intelligence that reads RankFlow signals, explains performance movement, recommends actions, flags risk, and prepares report narratives."
        actionHref={`/workspaces/${workspace.id}/growth-cycle`}
        actionLabel="Open growth cycle"
      />

      <section className="summary-grid">
        <MetricCard label="Brain Status" value={summary.status} detail={`Last run ${brain.lastRunAt}`} />
        <MetricCard label="Confidence" value={`${summary.confidenceScore}%`} detail="Reasoning confidence" />
        <MetricCard label="Data Coverage" value={`${summary.dataCoverageScore}%`} detail="Connected signal completeness" />
        <MetricCard label="Approval Needed" value={summary.approvalRequired} detail={brain.automationMode} />
        <MetricCard label="High Risks" value={summary.highRisks} detail="Needs HOD attention" />
        <MetricCard label="Client Narratives" value={summary.clientNarratives} detail="Report-ready drafts" />
      </section>

      <section className="brain-grid">
        <div className="panel">
          <p className="eyebrow">Diagnosis</p>
          <h2>System insights</h2>
          <div className="module-list">
            {brain.insights.map((insight) => (
              <article className="brain-card" key={insight.id}>
                <div className="card-row">
                  <strong>{insight.title}</strong>
                  <ToneBadge label={`${insight.confidence}%`} tone={insight.severity} />
                </div>
                <p>{insight.narrative}</p>
                <p className="muted">
                  Area {insight.area}. Evidence: {insight.evidenceRefs.join(", ")}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="eyebrow">Recommended action</p>
          <h2>Approval queue</h2>
          <div className="module-list">
            {brain.recommendations.map((recommendation) => (
              <article className="brain-card" key={recommendation.id}>
                <div className="card-row">
                  <strong>{recommendation.title}</strong>
                  <ToneBadge label={recommendation.priority} tone={recommendation.priority} />
                </div>
                <p>{recommendation.reason}</p>
                <p className="muted">{recommendation.expectedLift}</p>
                <span className="evidence-chip">
                  {recommendation.requiresApproval ? "Requires approval" : "Draft only"}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="brain-grid">
        <div className="panel">
          <p className="eyebrow">Report intelligence</p>
          <h2>Narratives</h2>
          <div className="module-list">
            {brain.narratives.map((narrative) => (
              <article className="brain-card" key={narrative.id}>
                <div className="card-row">
                  <strong>{narrative.title}</strong>
                  <span className="evidence-chip">{narrative.audience}</span>
                </div>
                <p>{narrative.summary}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <p className="eyebrow">Risk monitor</p>
          <h2>Brain risks</h2>
          <div className="module-list">
            {brain.risks.map((risk) => (
              <article className="brain-card" key={risk.id}>
                <div className="card-row">
                  <strong>{risk.title}</strong>
                  <ToneBadge label={risk.severity} tone={risk.severity} />
                </div>
                <p>{risk.mitigation}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export function AuditIntelligenceModule({
  stack,
  workspace
}: {
  stack: AuditIntelligenceStack;
  workspace: Workspace;
}) {
  const summary = getAuditIntelligenceSummary(stack);

  return (
    <main className="page">
      <PageHeader
        eyebrow="Hybrid Audit Stack"
        title={`${workspace.clientName} audit intelligence`}
        description="Evidence layer for core crawler rules, Screaming Frog imports, GSC, GA4, authority/rank data, and Claude SEO Brain interpretation."
        actionHref={`/workspaces/${workspace.id}/ai-brain`}
        actionLabel="Open AI Brain"
      />

      <section className="summary-grid">
        <MetricCard label="Connected Sources" value={summary.connectedSources} detail="Live evidence inputs" />
        <MetricCard label="Needs Setup" value={summary.needsSetup} detail="External sources pending" />
        <MetricCard label="Technical Issues" value={summary.technicalIssues} detail={`${summary.criticalTechnicalIssues} critical`} />
        <MetricCard label="Performance Signals" value={summary.performanceSignals} detail="GSC and GA4 signals" />
        <MetricCard label="Authority Signals" value={summary.authoritySignals} detail="Rank and backlink inputs" />
        <MetricCard label="Claude Ready" value={summary.claudeReady ? "Yes" : "No"} detail={stack.claudeBrain.promptVersion} />
      </section>

      <section className="source-grid">
        {stack.sourceStatuses.map((source) => (
          <article className="source-card" key={source.source}>
            <div className="card-row">
              <strong>{source.label}</strong>
              <span className="evidence-chip">{source.status}</span>
            </div>
            <p className="muted">{source.primaryUse}</p>
            <dl className="metric-list">
              <div><dt>Coverage</dt><dd>{source.coverageScore}%</dd></div>
              <div><dt>Records</dt><dd>{source.recordsAvailable.toLocaleString("en-US")}</dd></div>
            </dl>
            <p className="muted">Last sync {source.lastSyncedAt}</p>
          </article>
        ))}
      </section>

      <section className="table-panel">
        <div className="table-header">
          <div>
            <p className="eyebrow">Crawler and imports</p>
            <h2>Technical rule checks</h2>
          </div>
          <span className="small-label">Own crawler + Screaming Frog</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Check</th>
              <th>Category</th>
              <th>Source</th>
              <th>Severity</th>
              <th>Failed</th>
              <th>Passed</th>
            </tr>
          </thead>
          <tbody>
            {stack.technicalChecks.map((check) => (
              <tr key={check.id}>
                <td><strong>{check.label}</strong><br /><span className="muted">{check.description}</span></td>
                <td>{check.category}</td>
                <td>{check.source}</td>
                <td><ToneBadge label={check.severity} tone={check.severity} /></td>
                <td>{check.failedUrls}</td>
                <td>{check.passedUrls}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="growth-metric-grid">
        <div className="panel">
          <p className="eyebrow">GSC + GA4</p>
          <h2>Performance signals</h2>
          <dl className="metric-list">
            {stack.searchPerformance.map((signal) => (
              <div key={signal.id}>
                <dt>{signal.label}</dt>
                <dd>{signal.value.toLocaleString("en-US")} <Delta value={signal.delta} /></dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="panel">
          <p className="eyebrow">Ahrefs / Semrush / DataForSEO</p>
          <h2>Authority and rank signals</h2>
          <dl className="metric-list">
            {stack.authoritySignals.map((signal) => (
              <div key={signal.id}>
                <dt>{signal.label}</dt>
                <dd>{signal.value.toLocaleString("en-US")} <Delta value={signal.delta} /></dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="panel">
        <div className="card-row">
          <div>
            <p className="eyebrow">Claude SEO Brain</p>
            <h2>Interpretation readiness</h2>
          </div>
          <span className="evidence-chip">
            {stack.claudeBrain.requiresHumanApproval ? "Approval required" : "Read-only"}
          </span>
        </div>
        <dl className="metric-list">
          <div><dt>Status</dt><dd>{stack.claudeBrain.status}</dd></div>
          <div><dt>Confidence</dt><dd>{stack.claudeBrain.confidenceScore}%</dd></div>
          <div><dt>Findings</dt><dd>{stack.claudeBrain.findingsGenerated}</dd></div>
          <div><dt>Actions</dt><dd>{stack.claudeBrain.actionsGenerated}</dd></div>
          <div><dt>Narratives</dt><dd>{stack.claudeBrain.reportNarrativesGenerated}</dd></div>
          <div><dt>Inputs</dt><dd>{stack.claudeBrain.inputSources.join(", ")}</dd></div>
        </dl>
      </section>
    </main>
  );
}

export function LocalVisibilityModule({
  localVisibility,
  workspace
}: {
  localVisibility: LocalVisibilityProfile;
  workspace: Workspace;
}) {
  const summary = getLocalVisibilitySummary(localVisibility);

  return (
    <main className="page">
      <PageHeader
        eyebrow="Local + AI Search"
        title={`${workspace.clientName} local visibility`}
        description="International-grade operating view for Google Business Profile, Local SEO, answer-engine readiness, and generative search visibility."
        actionHref={`/workspaces/${workspace.id}/workbook`}
        actionLabel="Open workbook"
      />

      <section className="summary-grid">
        <MetricCard label="Visibility Score" value={summary.overallScore} detail="GBP, local, AEO, and GEO average" />
        <MetricCard label="Weakest Area" value={summary.weakestArea} detail="Prioritized remediation lane" />
        <MetricCard label="GBP Actions" value={summary.gbpActionCount} detail="Profile issues in queue" />
        <MetricCard label="Unanswered Reviews" value={summary.unansweredReviews} detail="Reputation follow-up needed" />
        <MetricCard label="Maps Visibility" value={`${summary.mapsVisibilityScore}%`} detail="Local pack and map coverage" />
        <MetricCard label="Local Pack" value={`#${localVisibility.gbp.localPackPosition}`} detail="Best tracked local position" />
      </section>

      <section className="visibility-grid">
        <article className="panel visibility-panel">
          <div className="card-row">
            <div>
              <p className="eyebrow">Google Business Profile</p>
              <h2>GBP optimization control</h2>
            </div>
            <ScorePill score={localVisibility.gbp.score} />
          </div>
          <dl className="metric-list">
            <div><dt>Status</dt><dd>{localVisibility.gbp.verificationStatus}</dd></div>
            <div><dt>Primary category</dt><dd>{localVisibility.gbp.primaryCategory}</dd></div>
            <div><dt>Profile completeness</dt><dd>{localVisibility.gbp.profileCompleteness}%</dd></div>
            <div><dt>Review rating</dt><dd>{localVisibility.gbp.reviewRating} from {localVisibility.gbp.reviewCount} reviews</dd></div>
            <div><dt>Review velocity</dt><dd>{localVisibility.gbp.reviewVelocity30d} new reviews in 30 days</dd></div>
            <div><dt>Freshness</dt><dd>Photos {localVisibility.gbp.photoFreshnessDays}d, posts {localVisibility.gbp.postFreshnessDays}d</dd></div>
          </dl>
          <IssueList issues={localVisibility.gbp.topIssues} />
        </article>

        <article className="panel visibility-panel">
          <div className="card-row">
            <div>
              <p className="eyebrow">Local SEO</p>
              <h2>Location authority</h2>
            </div>
            <ScorePill score={localVisibility.localSeo.score} />
          </div>
          <dl className="metric-list">
            <div><dt>NAP consistency</dt><dd>{localVisibility.localSeo.napConsistency}%</dd></div>
            <div><dt>Citation coverage</dt><dd>{localVisibility.localSeo.citationCoverage}%</dd></div>
            <div><dt>Location pages</dt><dd>{localVisibility.localSeo.locationPagesHealthy}/{localVisibility.localSeo.locationPagesTotal} healthy</dd></div>
            <div><dt>Local schema</dt><dd>{localVisibility.localSeo.localSchemaCoverage}% coverage</dd></div>
            <div><dt>Local keywords</dt><dd>{localVisibility.localSeo.localKeywordTop10}/{localVisibility.localSeo.localKeywordTracked} in top 10</dd></div>
            <div><dt>Local pack share</dt><dd>{localVisibility.localSeo.localPackShare}%</dd></div>
          </dl>
          <IssueList issues={localVisibility.localSeo.topIssues} />
        </article>

        <article className="panel visibility-panel">
          <div className="card-row">
            <div>
              <p className="eyebrow">AEO Readiness</p>
              <h2>Answer-engine coverage</h2>
            </div>
            <ScorePill score={localVisibility.aeo.score} />
          </div>
          <dl className="metric-list">
            <div><dt>Question headings</dt><dd>{localVisibility.aeo.questionLedHeadings}</dd></div>
            <div><dt>FAQ schema</dt><dd>{localVisibility.aeo.faqSchemaCoverage}%</dd></div>
            <div><dt>PAA coverage</dt><dd>{localVisibility.aeo.paaCoverage}%</dd></div>
            <div><dt>Answer blocks</dt><dd>{localVisibility.aeo.conciseAnswerBlocks}</dd></div>
            <div><dt>Voice readiness</dt><dd>{localVisibility.aeo.voiceSearchReadiness}%</dd></div>
            <div><dt>Source clarity</dt><dd>{localVisibility.aeo.sourceClarity}%</dd></div>
          </dl>
          <IssueList issues={localVisibility.aeo.topIssues} />
        </article>

        <article className="panel visibility-panel">
          <div className="card-row">
            <div>
              <p className="eyebrow">GEO Visibility</p>
              <h2>Generative search evidence</h2>
            </div>
            <ScorePill score={localVisibility.geo.score} />
          </div>
          <dl className="metric-list">
            <div><dt>Entity coverage</dt><dd>{localVisibility.geo.entityCoverage}%</dd></div>
            <div><dt>Citation authority</dt><dd>{localVisibility.geo.citationAuthority}%</dd></div>
            <div><dt>LLM answer presence</dt><dd>{localVisibility.geo.llmAnswerPresence}%</dd></div>
            <div><dt>AI Overview eligibility</dt><dd>{localVisibility.geo.aiOverviewEligibility}%</dd></div>
            <div><dt>Author expertise</dt><dd>{localVisibility.geo.authorExpertiseCoverage}%</dd></div>
            <div><dt>Structured evidence</dt><dd>{localVisibility.geo.structuredEvidenceCoverage}%</dd></div>
          </dl>
          <IssueList issues={localVisibility.geo.topIssues} />
        </article>
      </section>

      <section className="table-panel">
        <div className="table-header">
          <div>
            <p className="eyebrow">Priority queue</p>
            <h2>Critical actions</h2>
          </div>
          <span className="small-label">Converted into workbook tasks next</span>
        </div>
        <ul className="action-list">
          {summary.criticalActions.map((action) => (
            <li key={action}>
              <ToneBadge label="Priority" tone="high" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function IssueList({ issues }: { issues: string[] }) {
  return (
    <ul className="stack-list visibility-issues">
      {issues.map((issue) => (
        <li key={issue}>
          <ToneBadge label="Action" tone="medium" />
          <span>{issue}</span>
        </li>
      ))}
    </ul>
  );
}
