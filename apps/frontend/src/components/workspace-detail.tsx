import Link from "next/link";
import { Delta, MetricCard, PageHeader, ScorePill, ToneBadge } from "@/components/ui";
import { getLatestScan, getWorkspaceLocaleSummary, type Workspace } from "@rankflow/shared";

export function WorkspaceDetail({ workspace }: { workspace: Workspace }) {
  const scan = getLatestScan(workspace);
  const locale = getWorkspaceLocaleSummary(workspace);

  return (
    <main className="page">
      <PageHeader
        eyebrow={`${workspace.industry} workspace · ${workspace.locale.country}`}
        title={workspace.clientName}
        description={`${workspace.primaryDomain} · ${workspace.locale.region} market · ${locale.language}. Drill into scan history, on-page category health, AI suggestions, and the workbook queue for this account.`}
        actionHref={`/client-portal/${workspace.id}`}
        actionLabel="Preview client portal"
      />

      <section className="summary-grid">
        <MetricCard label="Market" value={locale.market} detail={locale.timeZone} />
        <MetricCard label="Language" value={locale.language} detail={`Currency ${locale.currency}`} />
        <MetricCard label="Team Size" value={workspace.teamSize} detail="Core delivery capacity" />
        <MetricCard label="Manager" value={workspace.manager} detail="Workspace owner" />
        <MetricCard label="Domain" value={workspace.primaryDomain} detail="Primary organic property" />
        <MetricCard label="Next Report" value={workspace.nextReportDue} detail="Client delivery cadence" />
      </section>

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
          <p className="eyebrow">Operating profile</p>
          <h2>International delivery context</h2>
          <dl className="metric-list">
            <div><dt>Region</dt><dd>{workspace.locale.region}</dd></div>
            <div><dt>Country</dt><dd>{workspace.locale.country}</dd></div>
            <div><dt>Language</dt><dd>{workspace.locale.language}</dd></div>
            <div><dt>Currency</dt><dd>{workspace.locale.currency}</dd></div>
            <div><dt>Timezone</dt><dd>{workspace.locale.timeZone}</dd></div>
            <div><dt>Domain</dt><dd>{workspace.primaryDomain}</dd></div>
          </dl>
        </div>

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

      <section className="module-grid" aria-label="Workspace modules">
        <Link className="module-card" href={`/workspaces/${workspace.id}/own-crawler`}>
          <strong>Own Crawler</strong>
          <span>Deterministic rule layer for titles, canonicals, indexability, links, schema, and speed</span>
        </Link>
        <Link className="module-card" href={`/workspaces/${workspace.id}/screaming-frog`}>
          <strong>Screaming Frog</strong>
          <span>Imported deep crawl coverage with the same rule layer and evidence shape</span>
        </Link>
        <Link className="module-card" href={`/workspaces/${workspace.id}/scans`}>
          <strong>Scan History</strong>
          <span>Versioned crawl snapshots, deltas, and regression evidence</span>
        </Link>
        <Link className="module-card" href={`/workspaces/${workspace.id}/growth-cycle`}>
          <strong>Growth Cycle</strong>
          <span>Audit, analyse, act, report, and re-audit with accountability and impact tracking</span>
        </Link>
        <Link className="module-card" href={`/workspaces/${workspace.id}/ai-brain`}>
          <strong>AI Brain</strong>
          <span>Interpretation layer for diagnosis, prioritization, risk, and report narratives</span>
        </Link>
        <Link className="module-card" href={`/workspaces/${workspace.id}/audit-intelligence`}>
          <strong>Audit Intelligence</strong>
          <span>Evidence control center for crawler, analytics, authority data, and Claude reasoning</span>
        </Link>
        <Link className="module-card" href={`/workspaces/${workspace.id}/audit`}>
          <strong>On-Page Audit</strong>
          <span>Category health, failed checks, and prioritized fixes</span>
        </Link>
        <Link className="module-card" href={`/workspaces/${workspace.id}/suggestions`}>
          <strong>AI Suggestions</strong>
          <span>Source-backed fixes with workflow state and impact estimation</span>
        </Link>
        <Link className="module-card" href={`/workspaces/${workspace.id}/local-visibility`}>
          <strong>Local + AI Search</strong>
          <span>GBP, local pack, AEO, GEO, and regional search readiness</span>
        </Link>
        <Link className="module-card" href={`/workspaces/${workspace.id}/workbook`}>
          <strong>SEO Workbook</strong>
          <span>Execution queue with owners, evidence, and completion mode</span>
        </Link>
        <Link className="module-card" href={`/workspaces/${workspace.id}/keywords`}>
          <strong>Keywords</strong>
          <span>Rank movement, intent, mapped pages, and SERP feature ownership</span>
        </Link>
        <Link className="module-card" href={`/workspaces/${workspace.id}/reports`}>
          <strong>Reports</strong>
          <span>Readiness, publication status, exports, and client visibility</span>
        </Link>
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

      <Link className="button" href="/dashboard">
        Back to HOD Command Centre
      </Link>
    </main>
  );
}
