import type { HodSummary, Workspace } from "@rankflow/shared";

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
