import Link from "next/link";
import { workspaces } from "@/lib/rankflow-data";

const modules = [
  "Dashboard",
  "Scan History",
  "On-Page Audit",
  "AI Suggestions",
  "Keywords",
  "Workbook",
  "Off-Page",
  "Competitors",
  "Reports"
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
          <strong>{workspaces[0].clientName}</strong>
        </div>

        <p className="nav-section-title">Modules</p>
        <ul className="nav-list">
          {modules.map((module, index) => (
            <li key={module}>
              <Link className={`nav-link ${index === 0 ? "active" : ""}`} href={index === 0 ? "/" : "#"}>
                {module}
                {module === "AI Suggestions" ? <span className="badge high">112</span> : null}
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
