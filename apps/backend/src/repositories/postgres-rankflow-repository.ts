import { Pool } from "pg";
import { getHodSummary } from "../rankflow-data";
import type {
  ActionItem,
  AiBrainProfile,
  AiSuggestion,
  AuditCategory,
  AuditIntelligenceStack,
  CrawlerEvaluation,
  ExpertEfficiency,
  HodSummary,
  KeywordRanking,
  LocalVisibilityProfile,
  OrganicGrowthCycle,
  OrganicGrowthMetricSnapshot,
  RankFlowSession,
  ReportSnapshot,
  ScanSnapshot,
  WorkbookTask,
  Workspace
} from "@rankflow/shared";
import type { RankFlowRepository } from "./rankflow-repository";

export interface QueryClient {
  query<T>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

const missingLiveStateMessage =
  "RankFlow live data is not initialized. Seed rankflow_live_state before using RANKFLOW_DATA_MODE=live.";

export class JsonPostgresRankFlowRepository implements RankFlowRepository {
  constructor(private readonly client: QueryClient) {}

  private async getState<T>(key: string): Promise<T> {
    const result = await this.client.query<{ payload: T }>(
      "select payload from public.rankflow_live_state where key = $1 limit 1",
      [key]
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error(missingLiveStateMessage);
    }
    return row.payload;
  }

  private async getWorkspaces() {
    return this.getState<Workspace[]>("workspaces");
  }

  async getSession(): Promise<RankFlowSession> {
    return this.getState<RankFlowSession>("session");
  }

  async getHodSummary(): Promise<HodSummary> {
    return getHodSummary(await this.getWorkspaces());
  }

  async listWorkspaces(): Promise<Workspace[]> {
    return this.getWorkspaces();
  }

  async getWorkspace(id: string): Promise<Workspace | undefined> {
    return (await this.getWorkspaces()).find((workspace) => workspace.id === id);
  }

  async listScans(workspaceId: string): Promise<ScanSnapshot[]> {
    return (await this.getWorkspace(workspaceId))?.scans ?? [];
  }

  async listAuditCategories(workspaceId: string): Promise<AuditCategory[]> {
    return (await this.getWorkspace(workspaceId))?.auditCategories ?? [];
  }

  async listSuggestions(workspaceId: string): Promise<AiSuggestion[]> {
    return (await this.getWorkspace(workspaceId))?.suggestions ?? [];
  }

  async listTasks(workspaceId: string): Promise<WorkbookTask[]> {
    return (await this.getWorkspace(workspaceId))?.tasks ?? [];
  }

  async listKeywords(workspaceId: string): Promise<KeywordRanking[]> {
    return (await this.getWorkspace(workspaceId))?.keywords ?? [];
  }

  async listReports(workspaceId: string): Promise<ReportSnapshot[]> {
    return (await this.getWorkspace(workspaceId))?.reports ?? [];
  }

  async getLocalVisibility(workspaceId: string): Promise<LocalVisibilityProfile | undefined> {
    return (await this.getWorkspace(workspaceId))?.localVisibility;
  }

  async listGrowthCycles(workspaceId: string): Promise<OrganicGrowthCycle[]> {
    return (await this.getState<Record<string, OrganicGrowthCycle[]>>("growthCyclesByWorkspace"))[workspaceId] ?? [];
  }

  async listOrganicMetricSnapshots(workspaceId: string): Promise<OrganicGrowthMetricSnapshot[]> {
    return (await this.getState<Record<string, OrganicGrowthMetricSnapshot[]>>("organicMetricSnapshotsByWorkspace"))[workspaceId] ?? [];
  }

  async listActionItems(workspaceId: string): Promise<ActionItem[]> {
    return (await this.getState<Record<string, ActionItem[]>>("actionItemsByWorkspace"))[workspaceId] ?? [];
  }

  async listExpertEfficiency(workspaceId: string): Promise<ExpertEfficiency[]> {
    return (await this.getState<Record<string, ExpertEfficiency[]>>("expertEfficiencyByWorkspace"))[workspaceId] ?? [];
  }

  async getOwnCrawler(workspaceId: string): Promise<CrawlerEvaluation | undefined> {
    return (await this.getState<Record<string, CrawlerEvaluation>>("ownCrawlerByWorkspace"))[workspaceId];
  }

  async getScreamingFrog(workspaceId: string): Promise<CrawlerEvaluation | undefined> {
    return (await this.getState<Record<string, CrawlerEvaluation>>("screamingFrogByWorkspace"))[workspaceId];
  }

  async getAiBrain(workspaceId: string): Promise<AiBrainProfile | undefined> {
    return (await this.getState<Record<string, AiBrainProfile>>("aiBrainByWorkspace"))[workspaceId];
  }

  async getAuditIntelligence(workspaceId: string): Promise<AuditIntelligenceStack | undefined> {
    return (await this.getState<Record<string, AuditIntelligenceStack>>("auditIntelligenceByWorkspace"))[workspaceId];
  }
}

export function createPostgresQueryClientFromEnv(): QueryClient {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required when RANKFLOW_DATA_MODE=live");
  }
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "disable" ? false : { rejectUnauthorized: false }
  });
}
