import type { AuditEvidenceSourceStatus, SearchPerformanceSignal } from "@rankflow/shared";

export interface GoogleSearchConsoleLiveConfig {
  enabled: boolean;
  siteUrl?: string;
  accessToken?: string;
  fetchImpl?: typeof fetch;
  now?: () => Date;
}

export interface GoogleSearchConsoleSnapshot {
  sourceStatus: AuditEvidenceSourceStatus;
  searchPerformance: SearchPerformanceSignal[];
}

interface SearchAnalyticsResponse {
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
  rows?: Array<{
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
    keys?: string[];
  }>;
}

export interface GoogleSearchConsoleConnector {
  getSnapshot(workspaceId: string): Promise<GoogleSearchConsoleSnapshot | null>;
}

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function subtractDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() - days);
  return copy;
}

function resolveFetch(fetchImpl: typeof fetch | undefined) {
  if (fetchImpl) return fetchImpl;
  if (typeof fetch === "undefined") {
    throw new Error("Global fetch is unavailable");
  }
  return fetch;
}

function buildSearchAnalyticsRequest(startDate: string, endDate: string) {
  return {
    startDate,
    endDate,
    dimensions: ["query"],
    rowLimit: 250
  };
}

function normalizeAggregateMetrics(response: SearchAnalyticsResponse) {
  const rows = response.rows ?? [];
  const rowCount = rows.length;
  const clicks = response.clicks ?? rows.reduce((sum, row) => sum + (row.clicks ?? 0), 0);
  const impressions = response.impressions ?? rows.reduce((sum, row) => sum + (row.impressions ?? 0), 0);
  const ctr = response.ctr ?? (impressions ? clicks / impressions : 0);
  const weightedPosition = rows.reduce(
    (sum, row) => sum + (row.position ?? 0) * (row.impressions ?? 0),
    0
  );
  const position = response.position ?? (impressions ? weightedPosition / impressions : 0);

  return { clicks, impressions, ctr, position, rowCount };
}

async function querySearchAnalytics(
  baseUrl: string,
  siteUrl: string,
  accessToken: string,
  fetchImpl: typeof fetch,
  startDate: string,
  endDate: string
) {
  const response = await fetchImpl(
    `${baseUrl}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildSearchAnalyticsRequest(startDate, endDate))
    }
  );

  if (!response.ok) {
    throw new Error(`Search Console query failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as SearchAnalyticsResponse;
}

export function createGoogleSearchConsoleConnector(
  config: GoogleSearchConsoleLiveConfig
): GoogleSearchConsoleConnector {
  return {
    async getSnapshot(workspaceId: string) {
      if (!config.enabled) {
        return null;
      }

      if (!config.siteUrl || !config.accessToken) {
        throw new Error(`Google Search Console live mode is missing siteUrl or accessToken for ${workspaceId}`);
      }

      const fetchImpl = resolveFetch(config.fetchImpl);
      const baseUrl = "https://www.googleapis.com/webmasters/v3";
      const now = config.now?.() ?? new Date();
      const currentEnd = subtractDays(now, 1);
      const currentStart = subtractDays(now, 28);
      const previousEnd = subtractDays(now, 29);
      const previousStart = subtractDays(now, 56);

      const [current, previous] = await Promise.all([
        querySearchAnalytics(
          baseUrl,
          config.siteUrl,
          config.accessToken,
          fetchImpl,
          formatIsoDate(currentStart),
          formatIsoDate(currentEnd)
        ),
        querySearchAnalytics(
          baseUrl,
          config.siteUrl,
          config.accessToken,
          fetchImpl,
          formatIsoDate(previousStart),
          formatIsoDate(previousEnd)
        )
      ]);

      const currentMetrics = normalizeAggregateMetrics(current);
      const previousMetrics = normalizeAggregateMetrics(previous);

      const sourceStatus: AuditEvidenceSourceStatus = {
        source: "gsc",
        label: "Google Search Console",
        status: "Connected",
        coverageScore: currentMetrics.rowCount > 0 ? 100 : 80,
        lastSyncedAt: now.toISOString(),
        recordsAvailable: currentMetrics.rowCount,
        primaryUse: "Live Search Analytics sync"
      };

      const searchPerformance: SearchPerformanceSignal[] = [
        {
          id: `gsc-live-impressions-${workspaceId}`,
          source: "gsc",
          label: "Search impressions",
          value: Math.round(currentMetrics.impressions),
          delta: Math.round(currentMetrics.impressions - previousMetrics.impressions),
          category: "impressions"
        },
        {
          id: `gsc-live-clicks-${workspaceId}`,
          source: "gsc",
          label: "Organic clicks",
          value: Math.round(currentMetrics.clicks),
          delta: Math.round(currentMetrics.clicks - previousMetrics.clicks),
          category: "clicks"
        },
        {
          id: `gsc-live-ctr-${workspaceId}`,
          source: "gsc",
          label: "Organic CTR",
          value: Math.round(currentMetrics.ctr * 1000) / 10,
          delta: Math.round(((Math.round(currentMetrics.ctr * 1000) / 10) - (Math.round(previousMetrics.ctr * 1000) / 10)) * 10) / 10,
          category: "ctr"
        }
      ];

      return {
        sourceStatus,
        searchPerformance
      };
    }
  };
}

export function createGoogleSearchConsoleLiveConfigFromEnv(): GoogleSearchConsoleLiveConfig {
  return {
    enabled: process.env.RANKFLOW_GSC_LIVE_MODE === "1" || process.env.RANKFLOW_GSC_LIVE_MODE === "true",
    siteUrl: process.env.RANKFLOW_GSC_SITE_URL,
    accessToken: process.env.RANKFLOW_GSC_ACCESS_TOKEN
  };
}
