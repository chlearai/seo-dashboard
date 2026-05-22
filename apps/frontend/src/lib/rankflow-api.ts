import type {
  AiSuggestion,
  AuditCategory,
  HodSummary,
  KeywordRanking,
  RankFlowSession,
  ReportSnapshot,
  ScanSnapshot,
  WorkbookTask,
  Workspace
} from "@rankflow/shared";

const apiBaseUrl = process.env.RANKFLOW_API_URL ?? "http://127.0.0.1:4000";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`RankFlow API request failed: ${response.status} ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function getHodCommandCentreData() {
  const [summary, workspaces] = await Promise.all([
    fetchJson<HodSummary>("/api/hod/summary"),
    fetchJson<Workspace[]>("/api/workspaces")
  ]);

  return { summary, workspaces };
}

export async function getWorkspace(workspaceId: string) {
  return fetchJson<Workspace>(`/api/workspaces/${workspaceId}`);
}

export async function getWorkspaceScans(workspaceId: string) {
  return fetchJson<ScanSnapshot[]>(`/api/workspaces/${workspaceId}/scans`);
}

export async function getWorkspaceAuditCategories(workspaceId: string) {
  return fetchJson<AuditCategory[]>(`/api/workspaces/${workspaceId}/audit-categories`);
}

export async function getWorkspaceSuggestions(workspaceId: string) {
  return fetchJson<AiSuggestion[]>(`/api/workspaces/${workspaceId}/suggestions`);
}

export async function getWorkspaceTasks(workspaceId: string) {
  return fetchJson<WorkbookTask[]>(`/api/workspaces/${workspaceId}/tasks`);
}

export async function getWorkspaceKeywords(workspaceId: string) {
  return fetchJson<KeywordRanking[]>(`/api/workspaces/${workspaceId}/keywords`);
}

export async function getWorkspaceReports(workspaceId: string) {
  return fetchJson<ReportSnapshot[]>(`/api/workspaces/${workspaceId}/reports`);
}

export async function getSession() {
  return fetchJson<RankFlowSession>("/api/session");
}
