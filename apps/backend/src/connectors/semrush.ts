import type { AuditEvidenceSourceStatus, AuthoritySignal } from "@rankflow/shared";

export interface SemrushLiveConfig {
  enabled: boolean;
  snapshotUrl?: string;
  accessToken?: string;
  fetchImpl?: typeof fetch;
}

export interface SemrushSnapshot {
  sourceStatus: AuditEvidenceSourceStatus;
  authoritySignals: AuthoritySignal[];
}

export interface SemrushConnector {
  getSnapshot(workspaceId: string): Promise<SemrushSnapshot | null>;
}

function resolveFetch(fetchImpl: typeof fetch | undefined) {
  if (fetchImpl) return fetchImpl;
  if (typeof fetch === "undefined") {
    throw new Error("Global fetch is unavailable");
  }
  return fetch;
}

function buildSnapshotUrl(snapshotUrl: string, workspaceId: string) {
  const url = new URL(snapshotUrl);
  url.searchParams.set("workspaceId", workspaceId);
  return url.toString();
}

export function createSemrushConnector(config: SemrushLiveConfig): SemrushConnector {
  return {
    async getSnapshot(workspaceId: string) {
      if (!config.enabled) {
        return null;
      }

      if (!config.snapshotUrl || !config.accessToken) {
        throw new Error(`Semrush live mode is missing snapshotUrl or accessToken for ${workspaceId}`);
      }

      const fetchImpl = resolveFetch(config.fetchImpl);
      const response = await fetchImpl(buildSnapshotUrl(config.snapshotUrl, workspaceId), {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Semrush snapshot request failed: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as SemrushSnapshot;
    }
  };
}

export function createSemrushLiveConfigFromEnv(): SemrushLiveConfig {
  return {
    enabled: process.env.RANKFLOW_SEMRUSH_LIVE_MODE === "1" || process.env.RANKFLOW_SEMRUSH_LIVE_MODE === "true",
    snapshotUrl: process.env.RANKFLOW_SEMRUSH_SNAPSHOT_URL,
    accessToken: process.env.RANKFLOW_SEMRUSH_ACCESS_TOKEN
  };
}
