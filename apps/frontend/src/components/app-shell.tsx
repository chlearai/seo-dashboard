import Link from "next/link";
import {
  BarChart3,
  Bell,
  BrainCircuit,
  ClipboardList,
  FileText,
  RefreshCcwDot,
  LayoutDashboard,
  ListChecks,
  MapPinned,
  MessageSquareText,
  PanelLeft,
  Plus,
  Search,
  ScanSearch,
  Sparkles,
  Target,
  UserRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type RankFlowModule, type RankFlowSession } from "@rankflow/shared";

export function AppShell({
  children,
  session
}: {
  children: React.ReactNode;
  session: RankFlowSession;
}) {
  const workspaceBaseHref = `/workspaces/${session.activeWorkspaceId}`;
  const modules = [
    { id: "dashboard", label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
    { id: "own-crawler", label: "Own Crawler", href: `${workspaceBaseHref}/own-crawler`, Icon: Search },
    { id: "screaming-frog", label: "Screaming Frog", href: `${workspaceBaseHref}/screaming-frog`, Icon: ScanSearch },
    { id: "ai-brain", label: "AI Brain", href: `${workspaceBaseHref}/ai-brain`, Icon: BrainCircuit },
    {
      id: "audit-intelligence",
      label: "Audit Intelligence",
      href: `${workspaceBaseHref}/audit-intelligence`,
      Icon: ScanSearch
    },
    {
      id: "growth-cycle",
      label: "Growth Cycle",
      href: `${workspaceBaseHref}/growth-cycle`,
      Icon: RefreshCcwDot
    },
    { id: "scan-history", label: "Scan History", href: `${workspaceBaseHref}/scans`, Icon: BarChart3 },
    { id: "on-page-audit", label: "On-Page Audit", href: `${workspaceBaseHref}/audit`, Icon: ListChecks },
    { id: "ai-suggestions", label: "AI Suggestions", href: `${workspaceBaseHref}/suggestions`, Icon: Sparkles },
    {
      id: "local-visibility",
      label: "Local + AI Search",
      href: `${workspaceBaseHref}/local-visibility`,
      Icon: MapPinned
    },
    { id: "keywords", label: "Keywords", href: `${workspaceBaseHref}/keywords`, Icon: Target },
    { id: "workbook", label: "Workbook", href: `${workspaceBaseHref}/workbook`, Icon: ClipboardList },
    { id: "reports", label: "Reports", href: `${workspaceBaseHref}/reports`, Icon: FileText },
    { id: "client-portal", label: "Client Portal", href: `/client-portal/${session.activeWorkspaceId}`, Icon: MessageSquareText }
  ] satisfies Array<{ id: RankFlowModule; label: string; href: string; Icon: LucideIcon }>;
  const visibleModules = modules.filter((module) => session.visibleModules.includes(module.id));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/dashboard">
          <span className="brand-mark">R</span>
          <span>
            <strong>RankFlow</strong>
            <span>SEO Intelligence</span>
          </span>
        </Link>

        <div className="workspace-select">
          <span>
            <PanelLeft size={14} aria-hidden="true" />
            Workspace
          </span>
          <strong>Aurora Education Group</strong>
          <small>{session.user.organizationName}</small>
        </div>

        <div className="workspace-select access-card">
          <span>
            <UserRound size={14} aria-hidden="true" />
            Active role
          </span>
          <strong>{session.user.fullName}</strong>
          <small>{session.user.role.replace("_", " ")} access</small>
        </div>

        <p className="nav-section-title">Modules</p>
        <ul className="nav-list">
          {visibleModules.map((module, index) => (
            <li key={module.label}>
              <Link className={`nav-link ${index === 0 ? "active" : ""}`} href={module.href}>
                <span>
                  <module.Icon size={16} aria-hidden="true" />
                  {module.label}
                </span>
                {module.label === "AI Suggestions" ? <span className="badge high">112</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <div className="main">
        <header className="topbar">
          <label className="search-wrap">
            <Search size={17} aria-hidden="true" />
            <input
              className="search"
              aria-label="Global search"
              placeholder="Search workspace, page, keyword, task, or team member"
            />
          </label>
          <div className="top-actions">
            <Link className="icon-button" href={`${workspaceBaseHref}/suggestions`} aria-label="Notifications">
              <Bell size={17} aria-hidden="true" />
            </Link>
            <Link className="button" href={`${workspaceBaseHref}/scans`}>
              <BarChart3 size={16} aria-hidden="true" />
              Run Scan
            </Link>
            <Link className="button primary" href={`${workspaceBaseHref}/workbook`}>
              <Plus size={16} aria-hidden="true" />
              New Task
            </Link>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
