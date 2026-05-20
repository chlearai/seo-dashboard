import Link from "next/link";
import { Delta, MetricCard, PageHeader, ScorePill, ToneBadge } from "@/components/ui";
import { getLatestScan, type HodSummary, type Workspace } from "@rankflow/shared";

export function HodCommandCentre({
  summary,
  workspaces
}: {
  summary: HodSummary;
  workspaces: Workspace[];
}) {
  const atRisk = workspaces.filter((workspace) => workspace.status === "At Risk" || workspace.scoreDeltaMom < -5);

  return (
    <main className="page">
      <PageHeader
        eyebrow="HOD Command Centre"
        title="All clients, scans, team work, and SEO risk in one operating view"
        description="Monitor composite score movement, unresolved critical issues, report readiness, and scan freshness across every RankFlow workspace."
        actionHref="/workspaces/aurora-education"
        actionLabel="Open top workspace"
      />

      <section className="summary-grid" aria-label="HOD summary">
        <MetricCard label="Active Workspaces" value={summary.activeWorkspaces} detail="Client accounts under management" />
        <MetricCard label="Accounts Improved" value={summary.accountsImproved} detail="Composite score up MoM" />
        <MetricCard label="Accounts At Risk" value={summary.accountsAtRisk} detail="Score decline or risk flag" />
        <MetricCard label="Open Critical Issues" value={summary.openCriticalIssues} detail="Across latest scans" />
        <MetricCard label="Tasks Due This Week" value={summary.tasksDueThisWeek} detail="Team-wide execution load" />
        <MetricCard label="Reports Due" value={summary.reportsDue} detail="Due before May 25" />
      </section>

      <section className="two-column">
        <div className="table-panel">
          <div className="table-header">
            <div>
              <p className="eyebrow">All clients MIS</p>
              <h2>Workspace performance</h2>
            </div>
            <span className="small-label">Sorted by operational risk</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Manager</th>
                <th>Score</th>
                <th>MoM</th>
                <th>Traffic</th>
                <th>Top 10</th>
                <th>Critical</th>
                <th>Status</th>
                <th>Report</th>
              </tr>
            </thead>
            <tbody>
              {workspaces.map((workspace) => {
                const scan = getLatestScan(workspace);
                return (
                  <tr key={workspace.id}>
                    <td>
                      <Link href={`/workspaces/${workspace.id}`}>
                        <strong>{workspace.clientName}</strong>
                        <br />
                        <span className="muted">{workspace.industry}</span>
                      </Link>
                    </td>
                    <td>{workspace.manager}</td>
                    <td>
                      <ScorePill score={workspace.scores.composite} />
                    </td>
                    <td>
                      <Delta value={workspace.scoreDeltaMom} />
                    </td>
                    <td>
                      <Delta value={workspace.organicTrafficDelta} suffix="%" />
                    </td>
                    <td>{workspace.keywordsTop10}</td>
                    <td>{scan.issues.critical}</td>
                    <td>
                      <ToneBadge
                        label={workspace.status}
                        tone={workspace.status === "At Risk" ? "critical" : "success"}
                      />
                    </td>
                    <td>{workspace.nextReportDue}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <aside className="panel">
          <p className="eyebrow">Escalation queue</p>
          <h2>Needs HOD attention</h2>
          <ul className="alert-list">
            {atRisk.map((workspace) => {
              const scan = getLatestScan(workspace);
              return (
                <li className="alert-item" key={workspace.id}>
                  <strong>{workspace.clientName}</strong>
                  <p className="muted">
                    {scan.issues.critical} critical issues, score movement{" "}
                    <Delta value={workspace.scoreDeltaMom} /> MoM.
                  </p>
                  <Link href={`/workspaces/${workspace.id}`} className="button">
                    Review workspace
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>
      </section>
    </main>
  );
}
