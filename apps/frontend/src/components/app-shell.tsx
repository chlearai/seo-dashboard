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
import { canPerformAction, type RankFlowModule, type RankFlowSession } from "@rankflow/shared";

const modules = [
  { id: "dashboard", label: "Dashboard", href: "/", Icon: LayoutDashboard },
  { id: "ai-brain", label: "AI Brain", href: "/workspaces/aurora-education/ai-brain", Icon: BrainCircuit },
  { id: "audit-intelligence", label: "Audit Intelligence", href: "/workspaces/aurora-education/audit-intelligence", Icon: ScanSearch },
  { id: "growth-cycle", label: "Growth Cycle", href: "/workspaces/aurora-education/growth-cycle", Icon: RefreshCcwDot },
  { id: "scan-history", label: "Scan History", href: "/workspaces/aurora-education/scans", Icon: BarChart3 },
  { id: "on-page-audit", label: "On-Page Audit", href: "/workspaces/aurora-education/audit", Icon: ListChecks },
  { id: "ai-suggestions", label: "AI Suggestions", href: "/workspaces/aurora-education/suggestions", Icon: Sparkles },
  { id: "local-visibility", label: "Local + AI Search", href: "/workspaces/aurora-education/local-visibility", Icon: MapPinned },
  { id: "keywords", label: "Keywords", href: "/workspaces/aurora-education/keywords", Icon: Target },
  { id: "workbook", label: "Workbook", href: "/workspaces/aurora-education/workbook", Icon: ClipboardList },
  { id: "reports", label: "Reports", href: "/workspaces/aurora-education/reports", Icon: FileText },
  { id: "client-portal", label: "Client Portal", href: "/client-portal/aurora-education", Icon: MessageSquareText }
] satisfies Array<{ id: RankFlowModule; label: string; href: string; Icon: LucideIcon }>;

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
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell size={17} aria-hidden="true" />
            </button>
            <button className="button" type="button" disabled={!canRunScan}>
              <BarChart3 size={16} aria-hidden="true" />
              Run Scan
            </button>
            <button className="button primary" type="button" disabled={!canAssignTask}>
              <Plus size={16} aria-hidden="true" />
              New Task
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
