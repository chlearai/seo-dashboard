import type { AuditEvidenceSourceStatus, AuthoritySignal } from "@rankflow/shared";

export interface DataForSeoLiveConfig {
  enabled: boolean;
  snapshotUrl?: string;
  accessToken?: string;
  fetchImpl?: typeof fetch;
}

export interface DataForSeoSnapshot {
  sourceStatus: AuditEvidenceSourceStatus;
  authoritySignals: AuthoritySignal[];
}

export interface DataForSeoConnector {
  getSnapshot(workspaceId: string): Promise<DataForSeoSnapshot | null>;
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

export function createDataForSeoConnector(config: DataForSeoLiveConfig): DataForSeoConnector {
  return {
    async getSnapshot(workspaceId: string) {
      if (!config.enabled) {
        return null;
      }

      if (!config.snapshotUrl || !config.accessToken) {
        throw new Error(`DataForSEO live mode is missing snapshotUrl or accessToken for ${workspaceId}`);
      }

      const fetchImpl = resolveFetch(config.fetchImpl);
      const response = await fetchImpl(buildSnapshotUrl(config.snapshotUrl, workspaceId), {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`DataForSEO snapshot request failed: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as DataForSeoSnapshot;
    }
  };
}

export function createDataForSeoLiveConfigFromEnv(): DataForSeoLiveConfig {
  return {
    enabled: process.env.RANKFLOW_DATAFORSEO_LIVE_MODE === "1" || process.env.RANKFLOW_DATAFORSEO_LIVE_MODE === "true",
    snapshotUrl: process.env.RANKFLOW_DATAFORSEO_SNAPSHOT_URL,
    accessToken: process.env.RANKFLOW_DATAFORSEO_ACCESS_TOKEN
  };
}
