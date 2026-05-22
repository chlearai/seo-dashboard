import Link from "next/link";
import { canPerformAction, type RankFlowModule, type RankFlowSession } from "@rankflow/shared";

const modules: Array<{ id: RankFlowModule; label: string; href: string }> = [
  { id: "dashboard", label: "Dashboard", href: "/" },
  { id: "scan-history", label: "Scan History", href: "/workspaces/aurora-education/scans" },
  { id: "on-page-audit", label: "On-Page Audit", href: "/workspaces/aurora-education/audit" },
  { id: "ai-suggestions", label: "AI Suggestions", href: "/workspaces/aurora-education/suggestions" },
  { id: "keywords", label: "Keywords", href: "/workspaces/aurora-education/keywords" },
  { id: "workbook", label: "Workbook", href: "/workspaces/aurora-education/workbook" },
  { id: "reports", label: "Reports", href: "/workspaces/aurora-education/reports" },
  { id: "client-portal", label: "Client Portal", href: "/client-portal/aurora-education" }
];

export function AppShell({
  children,
  session
}: {
  children: React.ReactNode;
  session: RankFlowSession;
}) {
  const activeAccess = session.user.workspaceAccess.find(
    (access) => access.workspaceId === session.activeWorkspaceId
  );
  const visibleModules = modules.filter((module) => session.visibleModules.includes(module.id));
  const canRunScan = canPerformAction(session.user.role, "run-scan", activeAccess);
  const canAssignTask = canPerformAction(session.user.role, "assign-task", activeAccess);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">R</span>
          <span>
            <strong>RankFlow</strong>
            <span>SEO Intelligence</span>
          </span>
        </Link>

        <div className="workspace-select">
          <span>Workspace</span>
          <strong>Aurora Education Group</strong>
          <small>{session.user.organizationName}</small>
        </div>

        <div className="workspace-select access-card">
          <span>Active role</span>
          <strong>{session.user.fullName}</strong>
          <small>{session.user.role.replace("_", " ")} access</small>
        </div>

        <p className="nav-section-title">Modules</p>
        <ul className="nav-list">
          {visibleModules.map((module, index) => (
            <li key={module.label}>
              <Link className={`nav-link ${index === 0 ? "active" : ""}`} href={module.href}>
                {module.label}
                {module.label === "AI Suggestions" ? <span className="badge high">112</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <div className="main">
        <header className="topbar">
          <input
            className="search"
            aria-label="Global search"
            placeholder="Search workspace, page, keyword, task, or team member"
          />
          <div className="top-actions">
            <button className="button" type="button" disabled={!canRunScan}>
              Run Scan
            </button>
            <button className="button primary" type="button" disabled={!canAssignTask}>
              New Task
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
