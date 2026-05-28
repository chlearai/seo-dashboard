import Link from "next/link";
import { Delta, MetricCard, PageHeader, ScorePill } from "@/components/ui";
import { getLatestScan, type Workspace } from "@rankflow/shared";

export function ClientPortal({ workspace }: { workspace: Workspace }) {
  const scan = getLatestScan(workspace);
  const completedTasks = workspace.tasks.filter((task) => task.status === "Done").length;

  return (
    <main className="page">
      <PageHeader
        eyebrow="Client portal preview"
        title={`${workspace.clientName} SEO progress`}
        description="A read-only client view with score movement, traffic direction, completed work, and next-month focus. Internal notes, raw methodology, and team KPIs stay hidden."
        actionHref={`/workspaces/${workspace.id}`}
        actionLabel="Back to workspace"
      />

      <section className="summary-grid">
        <MetricCard label="Composite SEO Score" value={workspace.scores.composite} detail="Latest verified scan" />
        <MetricCard label="Monthly Score Change" value={`${workspace.scoreDeltaMom > 0 ? "+" : ""}${workspace.scoreDeltaMom}`} detail="Compared with last report" />
        <MetricCard label="Organic Traffic" value={`${workspace.organicTrafficDelta > 0 ? "+" : ""}${workspace.organicTrafficDelta}%`} detail="Month over month" />
        <MetricCard label="Top 10 Keywords" value={workspace.keywordsTop10} detail="Tracked keyword set" />
        <MetricCard label="Work Completed" value={completedTasks} detail="Visible client summary" />
        <MetricCard label="Last Updated" value={workspace.lastScan} detail="Scan-backed data" />
      </section>

      <section className="two-column">
        <div className="panel">
          <p className="eyebrow">Performance overview</p>
          <h2>Account health</h2>
          <p>
            <ScorePill score={workspace.scores.composite} />{" "}
            <Delta value={workspace.scoreDeltaMom} /> score movement this month.
          </p>
          <p className="muted">
            The latest scan reviewed {scan.pagesCrawled} pages and generated {scan.suggestionsGenerated} improvement
            suggestions for the SEO team.
          </p>
        </div>

        <div className="panel">
          <p className="eyebrow">Next month focus</p>
          <h2>Planned priorities</h2>
          <ul className="stack-list">
            {workspace.auditCategories.slice(0, 3).map((category) => (
              <li className="audit-card" key={category.id}>
                <strong>{category.name}</strong>
                <p className="muted">{category.topIssue}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Wins and work in progress</p>
        <h2>What the SEO team is working on</h2>
        <div className="audit-grid">
          {workspace.tasks.map((task) => (
            <article className="task-card" key={task.id}>
              <strong>{task.title}</strong>
              <p className="muted">
                Status: {task.status}. Evidence {task.evidenceRequired ? "required" : "not required"}.
              </p>
            </article>
          ))}
        </div>
      </section>

      <Link className="button" href="/dashboard">
        Open Command Centre
      </Link>
    </main>
  );
}
