import type { AuditEvidenceSourceStatus, AuthoritySignal } from "@rankflow/shared";

export interface SemrushLiveConfig {
  enabled: boolean;
  apiKey?: string;
  database?: string;
  fetchImpl?: typeof fetch;
}

export interface SemrushSnapshot {
  sourceStatus: AuditEvidenceSourceStatus;
  authoritySignals: AuthoritySignal[];
}

export interface SemrushConnector {
  getSnapshot(workspaceId: string, context: { domain: string }): Promise<SemrushSnapshot | null>;
}

function resolveFetch(fetchImpl: typeof fetch | undefined) {
  if (fetchImpl) return fetchImpl;
  if (typeof fetch === "undefined") {
    throw new Error("Global fetch is unavailable");
  }
  return fetch;
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ";" && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function parseSemrushCsv(csvText: string) {
  const trimmed = csvText.trim();
  if (!trimmed) return [];

  const [headerLine, ...lines] = trimmed.split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

  return lines.filter(Boolean).map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])) as Record<string, string>;
  });
}

function parseInteger(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildUrl(apiKey: string, domain: string, database: string) {
  const url = new URL("https://api.semrush.com/");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("type", "domain_rank");
  url.searchParams.set("domain", domain);
  url.searchParams.set("database", database);
  return url.toString();
}

export function createSemrushConnector(config: SemrushLiveConfig): SemrushConnector {
  return {
    async getSnapshot(workspaceId: string, context: { domain: string }) {
      if (!config.enabled) {
        return null;
      }

      if (!config.apiKey) {
        throw new Error(`Semrush live mode is missing apiKey for ${workspaceId}`);
      }

      const fetchImpl = resolveFetch(config.fetchImpl);
      const response = await fetchImpl(buildUrl(config.apiKey, context.domain, config.database ?? "us"));

      if (!response.ok) {
        throw new Error(`Semrush request failed: ${response.status} ${response.statusText}`);
      }

      const rows = parseSemrushCsv(await response.text());
      const row = rows[0] ?? {};
      const rank = parseInteger(row.Rank);
      const organicKeywords = parseInteger(row["Organic Keywords"]);
      const organicTraffic = parseInteger(row["Organic Traffic"]);

      return {
        sourceStatus: {
          source: "semrush",
          label: "Semrush",
          status: "Connected",
          coverageScore: 100,
          lastSyncedAt: new Date().toISOString(),
          recordsAvailable: rows.length,
          primaryUse: "Keyword authority, visibility, and competitive benchmarks"
        },
        authoritySignals: [
          {
            id: `semrush-keyword-rank-${workspaceId}`,
            source: "semrush",
            label: "Semrush rank",
            value: rank,
            delta: 0,
            category: "keyword-rank"
          },
          {
            id: `semrush-organic-keywords-${workspaceId}`,
            source: "semrush",
            label: "Organic keywords",
            value: organicKeywords,
            delta: 0,
            category: "visibility"
          },
          {
            id: `semrush-organic-traffic-${workspaceId}`,
            source: "semrush",
            label: "Organic traffic",
            value: organicTraffic,
            delta: 0,
            category: "traffic"
          }
        ]
      };
    }
  };
}

export function createSemrushLiveConfigFromEnv(): SemrushLiveConfig {
  return {
    enabled: process.env.RANKFLOW_SEMRUSH_LIVE_MODE === "1" || process.env.RANKFLOW_SEMRUSH_LIVE_MODE === "true",
    apiKey: process.env.RANKFLOW_SEMRUSH_API_KEY,
    database: process.env.RANKFLOW_SEMRUSH_DATABASE ?? "us"
  };
}
