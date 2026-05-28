import type { AuditEvidenceSourceStatus, AuthoritySignal } from "@rankflow/shared";

export interface AhrefsLiveConfig {
  enabled: boolean;
  apiKey?: string;
  fetchImpl?: typeof fetch;
  now?: () => Date;
}

export interface AhrefsSnapshot {
  sourceStatus: AuditEvidenceSourceStatus;
  authoritySignals: AuthoritySignal[];
}

export interface AhrefsConnector {
  getSnapshot(workspaceId: string, context: { domain: string }): Promise<AhrefsSnapshot | null>;
}

interface AhrefsDomainRatingResponse {
  domain_rating?: {
    domain_rating?: number;
    ahrefs_rank?: number | null;
  };
}

interface AhrefsBacklinksStatsResponse {
  metrics?: {
    all_time?: number;
    all_time_refdomains?: number;
    live?: number;
    live_refdomains?: number;
  };
}

function resolveFetch(fetchImpl: typeof fetch | undefined) {
  if (fetchImpl) return fetchImpl;
  if (typeof fetch === "undefined") {
    throw new Error("Global fetch is unavailable");
  }
  return fetch;
}

function buildUrl(baseUrl: string, target: string, date: string, extra: Record<string, string>) {
  const url = new URL(baseUrl);
  url.searchParams.set("protocol", "both");
  url.searchParams.set("target", target);
  url.searchParams.set("date", date);
  url.searchParams.set("output", "json");

  for (const [key, value] of Object.entries(extra)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

async function fetchJson<T>(fetchImpl: typeof fetch, url: string, apiKey: string) {
  const response = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Ahrefs request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export function createAhrefsConnector(config: AhrefsLiveConfig): AhrefsConnector {
  return {
    async getSnapshot(workspaceId: string, context: { domain: string }) {
      if (!config.enabled) {
        return null;
      }

      if (!config.apiKey) {
        throw new Error(`Ahrefs live mode is missing apiKey for ${workspaceId}`);
      }

      const fetchImpl = resolveFetch(config.fetchImpl);
      const date = config.now?.() ?? new Date();
      const dateValue = date.toISOString().slice(0, 10);

      const [domainRating, backlinksStats] = await Promise.all([
        fetchJson<AhrefsDomainRatingResponse>(
          fetchImpl,
          buildUrl("https://api.ahrefs.com/v3/site-explorer/domain-rating", context.domain, dateValue, {}),
          config.apiKey
        ),
        fetchJson<AhrefsBacklinksStatsResponse>(
          fetchImpl,
          buildUrl("https://api.ahrefs.com/v3/site-explorer/backlinks-stats", context.domain, dateValue, {
            mode: "domain"
          }),
          config.apiKey
        )
      ]);

      const rating = domainRating.domain_rating?.domain_rating ?? 0;
      const backlinks = backlinksStats.metrics?.live ?? 0;
      const refdomains = backlinksStats.metrics?.live_refdomains ?? 0;

      return {
        sourceStatus: {
          source: "ahrefs",
          label: "Ahrefs",
          status: "Connected",
          coverageScore: 100,
          lastSyncedAt: date.toISOString(),
          recordsAvailable: 2,
          primaryUse: "Backlinks, referring domains, and domain authority"
        },
        authoritySignals: [
          {
            id: `ahrefs-domain-rating-${workspaceId}`,
            source: "ahrefs",
            label: "Domain rating",
            value: rating,
            delta: rating,
            category: "authority-score"
          },
          {
            id: `ahrefs-backlinks-${workspaceId}`,
            source: "ahrefs",
            label: "Backlinks",
            value: backlinks,
            delta: backlinks,
            category: "backlinks"
          },
          {
            id: `ahrefs-refdomains-${workspaceId}`,
            source: "ahrefs",
            label: "Referring domains",
            value: refdomains,
            delta: refdomains,
            category: "referring-domains"
          }
        ]
      };
    }
  };
}

export function createAhrefsLiveConfigFromEnv(): AhrefsLiveConfig {
  return {
    enabled: process.env.RANKFLOW_AHREFS_LIVE_MODE === "1" || process.env.RANKFLOW_AHREFS_LIVE_MODE === "true",
    apiKey: process.env.RANKFLOW_AHREFS_API_KEY
  };
}
