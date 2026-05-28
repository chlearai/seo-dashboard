import type { AuditEvidenceSourceStatus, AuthoritySignal } from "@rankflow/shared";
import { Buffer } from "node:buffer";

export interface DataForSeoLiveConfig {
  enabled: boolean;
  apiLogin?: string;
  apiPassword?: string;
  fetchImpl?: typeof fetch;
  locationName?: string;
  languageName?: string;
  now?: () => Date;
}

export interface DataForSeoSnapshot {
  sourceStatus: AuditEvidenceSourceStatus;
  authoritySignals: AuthoritySignal[];
}

export interface DataForSeoConnector {
  getSnapshot(workspaceId: string, context: { domain: string }): Promise<DataForSeoSnapshot | null>;
}

interface DataForSeoTaskResponse<T> {
  tasks?: Array<{
    result?: Array<T>;
  }>;
}

interface DomainRankOverviewItem {
  metrics?: {
    organic?: {
      pos_1?: number;
      pos_2_3?: number;
      pos_4_10?: number;
      pos_11_20?: number;
      etv?: number;
      is_up?: number;
      is_down?: number;
    };
  };
}

interface BacklinksSummaryItem {
  metrics?: {
    backlinks?: number;
    refdomains?: number;
    new_backlinks?: number;
    lost_backlinks?: number;
  };
}

function resolveFetch(fetchImpl: typeof fetch | undefined) {
  if (fetchImpl) return fetchImpl;
  if (typeof fetch === "undefined") {
    throw new Error("Global fetch is unavailable");
  }
  return fetch;
}

function basicAuth(login: string, password: string) {
  return `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
}

function createHeaders(config: DataForSeoLiveConfig) {
  if (!config.apiLogin || !config.apiPassword) {
    throw new Error("DataForSEO live mode is missing apiLogin or apiPassword");
  }

  return {
    Authorization: basicAuth(config.apiLogin, config.apiPassword),
    "Content-Type": "application/json"
  };
}

function parseFirstTask<T>(payload: DataForSeoTaskResponse<T>) {
  return payload.tasks?.[0]?.result?.[0];
}

function toNumber(value: number | undefined) {
  return Number.isFinite(value ?? NaN) ? (value ?? 0) : 0;
}

async function postJson<T>(
  fetchImpl: typeof fetch,
  url: string,
  headers: Record<string, string>,
  body: unknown
): Promise<T> {
  const response = await fetchImpl(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`DataForSEO request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export function createDataForSeoConnector(config: DataForSeoLiveConfig): DataForSeoConnector {
  return {
    async getSnapshot(workspaceId: string, context: { domain: string }) {
      if (!config.enabled) {
        return null;
      }

      const fetchImpl = resolveFetch(config.fetchImpl);
      const headers = createHeaders(config);
      const date = config.now?.() ?? new Date();

      const [rankOverview, backlinksSummary] = await Promise.all([
        postJson<DataForSeoTaskResponse<DomainRankOverviewItem>>(
          fetchImpl,
          "https://api.dataforseo.com/v3/dataforseo_labs/domain_rank_overview/live",
          headers,
          [
            {
              target: context.domain,
              location_name: config.locationName ?? "United States",
              language_name: config.languageName ?? "English"
            }
          ]
        ),
        postJson<DataForSeoTaskResponse<BacklinksSummaryItem>>(
          fetchImpl,
          "https://api.dataforseo.com/v3/backlinks/summary/live",
          headers,
          [
            {
              target: context.domain
            }
          ]
        )
      ]);

      const organic = parseFirstTask(rankOverview)?.metrics?.organic;
      const backlinkMetrics = parseFirstTask(backlinksSummary)?.metrics;

      const keywordMovement = toNumber(organic?.is_up) - toNumber(organic?.is_down);
      const authorityScore = Math.min(
        100,
        Math.round(
          toNumber(organic?.pos_1) * 4 +
            toNumber(organic?.pos_2_3) * 3 +
            toNumber(organic?.pos_4_10) * 2 +
            toNumber(organic?.pos_11_20)
        )
      );

      return {
        sourceStatus: {
          source: "dataforseo",
          label: "DataForSEO",
          status: "Connected",
          coverageScore: 100,
          lastSyncedAt: date.toISOString(),
          recordsAvailable: 2,
          primaryUse: "Rank tracking, backlinks, and competitor visibility"
        },
        authoritySignals: [
          {
            id: `dataforseo-keyword-movement-${workspaceId}`,
            source: "dataforseo",
            label: "Keyword rank movement",
            value: keywordMovement,
            delta: keywordMovement,
            category: "keyword-rank"
          },
          {
            id: `dataforseo-organic-visibility-${workspaceId}`,
            source: "dataforseo",
            label: "Organic visibility",
            value: Math.round(toNumber(organic?.etv)),
            delta: Math.round(toNumber(organic?.etv)),
            category: "visibility"
          },
          {
            id: `dataforseo-backlinks-${workspaceId}`,
            source: "dataforseo",
            label: "Backlinks",
            value: toNumber(backlinkMetrics?.backlinks),
            delta: toNumber(backlinkMetrics?.new_backlinks) - toNumber(backlinkMetrics?.lost_backlinks),
            category: "backlinks"
          },
          {
            id: `dataforseo-refdomains-${workspaceId}`,
            source: "dataforseo",
            label: "Referring domains",
            value: toNumber(backlinkMetrics?.refdomains),
            delta: toNumber(backlinkMetrics?.refdomains),
            category: "referring-domains"
          },
          {
            id: `dataforseo-authority-score-${workspaceId}`,
            source: "dataforseo",
            label: "Authority score",
            value: authorityScore,
            delta: authorityScore,
            category: "authority-score"
          }
        ]
      };
    }
  };
}

export function createDataForSeoLiveConfigFromEnv(): DataForSeoLiveConfig {
  return {
    enabled: process.env.RANKFLOW_DATAFORSEO_LIVE_MODE === "1" || process.env.RANKFLOW_DATAFORSEO_LIVE_MODE === "true",
    apiLogin: process.env.RANKFLOW_DATAFORSEO_LOGIN,
    apiPassword: process.env.RANKFLOW_DATAFORSEO_PASSWORD,
    locationName: process.env.RANKFLOW_DATAFORSEO_LOCATION_NAME ?? "United States",
    languageName: process.env.RANKFLOW_DATAFORSEO_LANGUAGE_NAME ?? "English"
  };
}
