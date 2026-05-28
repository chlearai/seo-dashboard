import type { AuditEvidenceSourceStatus, AuthoritySignal } from "@rankflow/shared";

export interface AhrefsLiveConfig {
  enabled: boolean;
  snapshotUrl?: string;
  accessToken?: string;
  fetchImpl?: typeof fetch;
}

export interface AhrefsSnapshot {
  sourceStatus: AuditEvidenceSourceStatus;
  authoritySignals: AuthoritySignal[];
}

export interface AhrefsConnector {
  getSnapshot(workspaceId: string): Promise<AhrefsSnapshot | null>;
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

export function createAhrefsConnector(config: AhrefsLiveConfig): AhrefsConnector {
  return {
    async getSnapshot(workspaceId: string) {
      if (!config.enabled) {
        return null;
      }

      if (!config.snapshotUrl || !config.accessToken) {
        throw new Error(`Ahrefs live mode is missing snapshotUrl or accessToken for ${workspaceId}`);
      }

      const fetchImpl = resolveFetch(config.fetchImpl);
      const response = await fetchImpl(buildSnapshotUrl(config.snapshotUrl, workspaceId), {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Ahrefs snapshot request failed: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as AhrefsSnapshot;
    }
  };
}

export function createAhrefsLiveConfigFromEnv(): AhrefsLiveConfig {
  return {
    enabled: process.env.RANKFLOW_AHREFS_LIVE_MODE === "1" || process.env.RANKFLOW_AHREFS_LIVE_MODE === "true",
    snapshotUrl: process.env.RANKFLOW_AHREFS_SNAPSHOT_URL,
    accessToken: process.env.RANKFLOW_AHREFS_ACCESS_TOKEN
  };
}
