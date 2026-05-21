import Link from "next/link";
import {
  compareScans,
  getSuggestionInboxSummary,
  groupTasksByStatus,
  type AiSuggestion,
  type AuditCategory,
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
