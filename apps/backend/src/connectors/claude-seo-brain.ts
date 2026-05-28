import type { AuditEvidenceSourceStatus, ClaudeBrainAuditRun } from "@rankflow/shared";

export interface ClaudeSeoBrainLiveConfig {
  enabled: boolean;
  snapshotUrl?: string;
  accessToken?: string;
  fetchImpl?: typeof fetch;
}

export interface ClaudeSeoBrainSnapshot {
  sourceStatus: AuditEvidenceSourceStatus;
  claudeBrain: ClaudeBrainAuditRun;
}

export interface ClaudeSeoBrainConnector {
  getSnapshot(workspaceId: string): Promise<ClaudeSeoBrainSnapshot | null>;
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

export function createClaudeSeoBrainConnector(config: ClaudeSeoBrainLiveConfig): ClaudeSeoBrainConnector {
  return {
    async getSnapshot(workspaceId: string) {
      if (!config.enabled) {
        return null;
      }

      if (!config.snapshotUrl || !config.accessToken) {
        throw new Error(`Claude SEO Brain live mode is missing snapshotUrl or accessToken for ${workspaceId}`);
      }

      const fetchImpl = resolveFetch(config.fetchImpl);
      const response = await fetchImpl(buildSnapshotUrl(config.snapshotUrl, workspaceId), {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Claude SEO Brain snapshot request failed: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as ClaudeSeoBrainSnapshot;
    }
  };
}

export function createClaudeSeoBrainLiveConfigFromEnv(): ClaudeSeoBrainLiveConfig {
  return {
    enabled:
      process.env.RANKFLOW_CLAUDE_BRAIN_LIVE_MODE === "1" ||
      process.env.RANKFLOW_CLAUDE_BRAIN_LIVE_MODE === "true",
    snapshotUrl: process.env.RANKFLOW_CLAUDE_BRAIN_SNAPSHOT_URL,
    accessToken: process.env.RANKFLOW_CLAUDE_BRAIN_ACCESS_TOKEN
  };
}
