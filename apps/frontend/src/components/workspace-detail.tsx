import Link from "next/link";
import { Delta, MetricCard, PageHeader, ScorePill, ToneBadge } from "@/components/ui";
import { getLatestScan, type Workspace } from "@rankflow/shared";

export function WorkspaceDetail({ workspace }: { workspace: Workspace }) {
  const scan = getLatestScan(workspace);

  return (
    <main className="page">
      <PageHeader
        eyebrow={`${workspace.industry} workspace`}
        title={workspace.clientName}
        description="Drill into scan history, on-page category health, AI suggestions, and the workbook queue for this account."
        actionHref={`/client-portal/${workspace.id}`}
        actionLabel="Preview client portal"
      />

      <section className="summary-grid">
        <MetricCard label="Composite Score" value={workspace.scores.composite} detail="Current SEO score" />
        <MetricCard label="Score Delta MoM" value={`${workspace.scoreDeltaMom > 0 ? "+" : ""}${workspace.scoreDeltaMom}`} detail="Month over month" />
        <MetricCard label="Organic Traffic" value={`${workspace.organicTrafficDelta > 0 ? "+" : ""}${workspace.organicTrafficDelta}%`} detail="GA4 movement" />
        <MetricCard label="Keywords Top 10" value={workspace.keywordsTop10} detail="Tracked visibility" />
        <MetricCard label="Critical Issues" value={scan.issues.critical} detail="Latest scan" />
        <MetricCard label="Suggestions" value={scan.suggestionsGenerated} detail="Generated in scan" />
      </section>

      <section className="workspace-grid">
        <div className="panel">
          <p className="eyebrow">Scan intelligence</p>
          <h2>Latest scan snapshot</h2>
          <div className="scan-card">
            <strong>{scan.type}</strong>
            <p className="muted">
              Completed {scan.completedAt}. Crawled {scan.pagesCrawled} pages and checked{" "}
              {scan.keywordsChecked} keywords.
            </p>
            <p>
              <ScorePill score={scan.score} /> <Delta value={scan.delta} /> since previous comparable scan.
            </p>
          </div>
        </div>

        <div className="panel">
          <p className="eyebrow">Issue mix</p>
          <h2>Severity counts</h2>
          <ul className="stack-list">
            <li><ToneBadge label={`Critical ${scan.issues.critical}`} tone="critical" /></li>
            <li><ToneBadge label={`High ${scan.issues.high}`} tone="high" /></li>
            <li><ToneBadge label={`Medium ${scan.issues.medium}`} tone="medium" /></li>
            <li><ToneBadge label={`Low ${scan.issues.low}`} tone="low" /></li>
          </ul>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">On-page audit</p>
        <h2>Category health</h2>
        <div className="audit-grid">
          {workspace.auditCategories.map((category) => (
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
        </div>
      </section>

      <section className="workspace-grid">
        <div className="panel">
          <p className="eyebrow">AI Suggestion Inbox</p>
          <h2>Source-backed recommendations</h2>
          <ul className="stack-list">
            {workspace.suggestions.map((suggestion) => (
              <li className="suggestion-card" key={suggestion.id}>
                <strong>{suggestion.title}</strong>
                <p className="muted">{suggestion.recommendation}</p>
                <p>
                  <ToneBadge label={suggestion.severity} tone={suggestion.severity} />{" "}
                  <span className="muted">{suggestion.source}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <p className="eyebrow">SEO Workbook</p>
          <h2>Execution queue</h2>
          <ul className="stack-list">
            {workspace.tasks.map((task) => (
              <li className="task-card" key={task.id}>
                <strong>{task.title}</strong>
                <p className="muted">
                  {task.owner} · Due {task.dueDate}
                </p>
                <p>
                  <ToneBadge label={task.priority} tone={task.priority} />{" "}
                  <span className="muted">{task.status}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Link className="button" href="/">
        Back to HOD Command Centre
      </Link>
    </main>
  );
}
