import type { AuditEvidenceSourceStatus, SearchPerformanceSignal } from "@rankflow/shared";

export interface GoogleAnalytics4LiveConfig {
  enabled: boolean;
  propertyId?: string;
  accessToken?: string;
  fetchImpl?: typeof fetch;
  now?: () => Date;
}

export interface GoogleAnalytics4Snapshot {
  sourceStatus: AuditEvidenceSourceStatus;
  searchPerformance: SearchPerformanceSignal[];
}

interface Ga4RunReportResponse {
  rowCount?: number;
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>;
    metricValues?: Array<{ value?: string }>;
  }>;
}

export interface GoogleAnalytics4Connector {
  getSnapshot(workspaceId: string): Promise<GoogleAnalytics4Snapshot | null>;
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

function resolvePropertyResource(propertyId: string) {
  return propertyId.startsWith("properties/") ? propertyId : `properties/${propertyId}`;
}

function roundToTenth(value: number) {
  return Math.round(value * 10) / 10;
}

function buildRunReportRequest(channelGroup: string, startDate: string, endDate: string) {
  return {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "keyEvents" }, { name: "sessionKeyEventRate" }],
    dimensionFilter: {
      filter: {
        fieldName: "sessionDefaultChannelGroup",
        stringFilter: {
          matchType: "EXACT",
          value: channelGroup
        }
      }
    },
    keepEmptyRows: false,
    returnPropertyQuota: false
  };
}

async function runReport(
  baseUrl: string,
  propertyResource: string,
  accessToken: string,
  fetchImpl: typeof fetch,
  channelGroup: string,
  startDate: string,
  endDate: string
) {
  const response = await fetchImpl(`${baseUrl}/${propertyResource}:runReport`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(buildRunReportRequest(channelGroup, startDate, endDate))
  });

  if (!response.ok) {
    throw new Error(`GA4 runReport failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as Ga4RunReportResponse;
}

function parseChannelGroupMetrics(response: Ga4RunReportResponse) {
  const row = response.rows?.[0];
  const metrics = row?.metricValues ?? [];

  return {
    sessions: Number(metrics[0]?.value ?? 0),
    users: Number(metrics[1]?.value ?? 0),
    leads: Number(metrics[2]?.value ?? 0),
    conversionRate: Number(metrics[3]?.value ?? 0),
    rowCount: response.rowCount ?? response.rows?.length ?? 0
  };
}

function buildSignal(
  workspaceId: string,
  source: "ga4",
  idSuffix: string,
  label: string,
  value: number,
  delta: number,
  category: SearchPerformanceSignal["category"]
): SearchPerformanceSignal {
  return {
    id: `ga4-live-${idSuffix}-${workspaceId}`,
    source,
    label,
    value,
    delta,
    category
  };
}

export function createGoogleAnalytics4Connector(
  config: GoogleAnalytics4LiveConfig
): GoogleAnalytics4Connector {
  return {
    async getSnapshot(workspaceId: string) {
      if (!config.enabled) {
        return null;
      }

      if (!config.propertyId || !config.accessToken) {
        throw new Error(`Google Analytics 4 live mode is missing propertyId or accessToken for ${workspaceId}`);
      }

      const fetchImpl = resolveFetch(config.fetchImpl);
      const baseUrl = "https://analyticsdata.googleapis.com/v1beta";
      const propertyResource = resolvePropertyResource(config.propertyId);
      const now = config.now?.() ?? new Date();
      const currentEnd = subtractDays(now, 1);
      const currentStart = subtractDays(now, 28);
      const previousEnd = subtractDays(now, 29);
      const previousStart = subtractDays(now, 56);

      const [currentOrganic, previousOrganic, currentReferral, previousReferral] = await Promise.all([
        runReport(baseUrl, propertyResource, config.accessToken, fetchImpl, "Organic Search", formatIsoDate(currentStart), formatIsoDate(currentEnd)),
        runReport(baseUrl, propertyResource, config.accessToken, fetchImpl, "Organic Search", formatIsoDate(previousStart), formatIsoDate(previousEnd)),
        runReport(baseUrl, propertyResource, config.accessToken, fetchImpl, "Referral", formatIsoDate(currentStart), formatIsoDate(currentEnd)),
        runReport(baseUrl, propertyResource, config.accessToken, fetchImpl, "Referral", formatIsoDate(previousStart), formatIsoDate(previousEnd))
      ]);

      const currentOrganicMetrics = parseChannelGroupMetrics(currentOrganic);
      const previousOrganicMetrics = parseChannelGroupMetrics(previousOrganic);
      const currentReferralMetrics = parseChannelGroupMetrics(currentReferral);
      const previousReferralMetrics = parseChannelGroupMetrics(previousReferral);

      const sourceStatus: AuditEvidenceSourceStatus = {
        source: "ga4",
        label: "Google Analytics 4",
        status: "Connected",
        coverageScore:
          currentOrganicMetrics.rowCount + currentReferralMetrics.rowCount > 0 ? 100 : 80,
        lastSyncedAt: now.toISOString(),
        recordsAvailable: currentOrganicMetrics.rowCount + currentReferralMetrics.rowCount,
        primaryUse: "Live organic traffic, leads, and referral sync"
      };

      const searchPerformance: SearchPerformanceSignal[] = [
        buildSignal(
          workspaceId,
          "ga4",
          "organic-sessions",
          "Organic sessions",
          Math.round(currentOrganicMetrics.sessions),
          Math.round(currentOrganicMetrics.sessions - previousOrganicMetrics.sessions),
          "sessions"
        ),
        buildSignal(
          workspaceId,
          "ga4",
          "organic-users",
          "Organic users",
          Math.round(currentOrganicMetrics.users),
          Math.round(currentOrganicMetrics.users - previousOrganicMetrics.users),
          "users"
        ),
        buildSignal(
          workspaceId,
          "ga4",
          "organic-leads",
          "Organic leads",
          Math.round(currentOrganicMetrics.leads),
          Math.round(currentOrganicMetrics.leads - previousOrganicMetrics.leads),
          "leads"
        ),
        buildSignal(
          workspaceId,
          "ga4",
          "organic-conversion-rate",
          "Organic conversion rate",
          roundToTenth(currentOrganicMetrics.conversionRate * 100),
          roundToTenth((currentOrganicMetrics.conversionRate - previousOrganicMetrics.conversionRate) * 100),
          "conversions"
        ),
        buildSignal(
          workspaceId,
          "ga4",
          "referral-sessions",
          "Referral sessions",
          Math.round(currentReferralMetrics.sessions),
          Math.round(currentReferralMetrics.sessions - previousReferralMetrics.sessions),
          "referral"
        )
      ];

      return {
        sourceStatus,
        searchPerformance
      };
    }
  };
}

export function createGoogleAnalytics4LiveConfigFromEnv(): GoogleAnalytics4LiveConfig {
  return {
    enabled: process.env.RANKFLOW_GA4_LIVE_MODE === "1" || process.env.RANKFLOW_GA4_LIVE_MODE === "true",
    propertyId: process.env.RANKFLOW_GA4_PROPERTY_ID,
    accessToken: process.env.RANKFLOW_GA4_ACCESS_TOKEN
  };
}
