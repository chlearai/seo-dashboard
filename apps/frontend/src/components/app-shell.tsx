import Link from "next/link";

const modules = [
  { label: "Dashboard", href: "/" },
  { label: "Scan History", href: "/workspaces/aurora-education/scans" },
  { label: "On-Page Audit", href: "/workspaces/aurora-education/audit" },
  { label: "AI Suggestions", href: "/workspaces/aurora-education/suggestions" },
  { label: "Keywords", href: "/workspaces/aurora-education/keywords" },
  { label: "Workbook", href: "/workspaces/aurora-education/workbook" },
  { label: "Off-Page", href: "#" },
  { label: "Competitors", href: "#" },
  { label: "Reports", href: "/workspaces/aurora-education/reports" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
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
        </div>

        <p className="nav-section-title">Modules</p>
        <ul className="nav-list">
          {modules.map((module, index) => (
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
            <button className="button" type="button">
              Run Scan
            </button>
            <button className="button primary" type="button">
              New Task
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
