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
import {
  actionItemsByWorkspace,
  aiBrainByWorkspace,
  auditIntelligenceByWorkspace,
  currentSession,
  expertEfficiencyByWorkspace,
  getHodSummary,
  getWorkspaceById,
  growthCyclesByWorkspace,
  organicMetricSnapshotsByWorkspace,
  ownCrawlerByWorkspace,
  workspaces
} from "../rankflow-data";
import {
  createGoogleSearchConsoleConnector,
  createGoogleSearchConsoleLiveConfigFromEnv,
  type GoogleSearchConsoleConnector,
  type GoogleSearchConsoleSnapshot
} from "../connectors/google-search-console";
import {
  createGoogleAnalytics4Connector,
  createGoogleAnalytics4LiveConfigFromEnv,
  type GoogleAnalytics4Connector,
  type GoogleAnalytics4Snapshot
} from "../connectors/google-analytics-4";

export interface RankFlowRepository {
  listWorkspaces(): Promise<Workspace[]>;
  getWorkspace(id: string): Promise<Workspace | undefined>;
  getSession(): Promise<RankFlowSession>;
  getHodSummary(): Promise<HodSummary>;
  listScans(workspaceId: string): Promise<ScanSnapshot[]>;
  listAuditCategories(workspaceId: string): Promise<AuditCategory[]>;
  listSuggestions(workspaceId: string): Promise<AiSuggestion[]>;
  listTasks(workspaceId: string): Promise<WorkbookTask[]>;
  listKeywords(workspaceId: string): Promise<KeywordRanking[]>;
  listReports(workspaceId: string): Promise<ReportSnapshot[]>;
  getLocalVisibility(workspaceId: string): Promise<LocalVisibilityProfile | undefined>;
  listGrowthCycles(workspaceId: string): Promise<OrganicGrowthCycle[]>;
  listOrganicMetricSnapshots(workspaceId: string): Promise<OrganicGrowthMetricSnapshot[]>;
  listActionItems(workspaceId: string): Promise<ActionItem[]>;
  listExpertEfficiency(workspaceId: string): Promise<ExpertEfficiency[]>;
  getOwnCrawler(workspaceId: string): Promise<CrawlerEvaluation | undefined>;
  getAiBrain(workspaceId: string): Promise<AiBrainProfile | undefined>;
  getAuditIntelligence(workspaceId: string): Promise<AuditIntelligenceStack | undefined>;
}

export interface FixtureRankFlowRepositoryOptions {
  googleSearchConsoleConnector?: GoogleSearchConsoleConnector;
  googleAnalytics4Connector?: GoogleAnalytics4Connector;
}

function mergeGoogleSearchConsoleSnapshot(
  stack: AuditIntelligenceStack,
  snapshot: GoogleSearchConsoleSnapshot | null
): AuditIntelligenceStack {
  if (!snapshot) {
    return stack;
  }

  return {
    ...stack,
    sourceStatuses: stack.sourceStatuses.map((source) =>
      source.source === "gsc" ? snapshot.sourceStatus : source
    ),
    searchPerformance: [
      ...stack.searchPerformance.filter((signal) => signal.source !== "gsc"),
      ...snapshot.searchPerformance
    ].sort((a, b) => a.label.localeCompare(b.label))
  };
}

function mergeGoogleAnalytics4Snapshot(
  stack: AuditIntelligenceStack,
  snapshot: GoogleAnalytics4Snapshot | null
): AuditIntelligenceStack {
  if (!snapshot) {
    return stack;
  }

  return {
    ...stack,
    sourceStatuses: stack.sourceStatuses.map((source) =>
      source.source === "ga4" ? snapshot.sourceStatus : source
    ),
    searchPerformance: [
      ...stack.searchPerformance.filter((signal) => signal.source !== "ga4"),
      ...snapshot.searchPerformance
    ].sort((a, b) => a.label.localeCompare(b.label))
  };
}

export class FixtureRankFlowRepository implements RankFlowRepository {
  private readonly googleSearchConsoleConnector: GoogleSearchConsoleConnector;
  private readonly googleAnalytics4Connector: GoogleAnalytics4Connector;

  constructor(options: FixtureRankFlowRepositoryOptions = {}) {
    this.googleSearchConsoleConnector =
      options.googleSearchConsoleConnector ?? createGoogleSearchConsoleConnector(createGoogleSearchConsoleLiveConfigFromEnv());
    this.googleAnalytics4Connector =
      options.googleAnalytics4Connector ?? createGoogleAnalytics4Connector(createGoogleAnalytics4LiveConfigFromEnv());
  }

  async listWorkspaces() {
    return workspaces;
  }

  async getWorkspace(id: string) {
    return getWorkspaceById(id);
  }

  async getSession() {
    return currentSession;
  }

  async getHodSummary() {
    return getHodSummary(workspaces);
  }

  async listScans(workspaceId: string) {
    return getWorkspaceById(workspaceId)?.scans ?? [];
  }

  async listAuditCategories(workspaceId: string) {
    return getWorkspaceById(workspaceId)?.auditCategories ?? [];
  }

  async listSuggestions(workspaceId: string) {
    return getWorkspaceById(workspaceId)?.suggestions ?? [];
  }

  async listTasks(workspaceId: string) {
    return getWorkspaceById(workspaceId)?.tasks ?? [];
  }

  async listKeywords(workspaceId: string) {
    return getWorkspaceById(workspaceId)?.keywords ?? [];
  }

  async listReports(workspaceId: string) {
    return getWorkspaceById(workspaceId)?.reports ?? [];
  }

  async getLocalVisibility(workspaceId: string) {
    return getWorkspaceById(workspaceId)?.localVisibility;
  }

  async listGrowthCycles(workspaceId: string) {
    return growthCyclesByWorkspace[workspaceId] ?? [];
  }

  async listOrganicMetricSnapshots(workspaceId: string) {
    return organicMetricSnapshotsByWorkspace[workspaceId] ?? [];
  }

  async listActionItems(workspaceId: string) {
    return actionItemsByWorkspace[workspaceId] ?? [];
  }

  async listExpertEfficiency(workspaceId: string) {
    return expertEfficiencyByWorkspace[workspaceId] ?? [];
  }

  async getOwnCrawler(workspaceId: string) {
    return ownCrawlerByWorkspace[workspaceId];
  }

  async getAiBrain(workspaceId: string) {
    return aiBrainByWorkspace[workspaceId];
  }

  async getAuditIntelligence(workspaceId: string) {
    const stack = auditIntelligenceByWorkspace[workspaceId];
    if (!stack) {
      return undefined;
    }

    try {
      const [gscSnapshot, ga4Snapshot] = await Promise.all([
        this.googleSearchConsoleConnector.getSnapshot(workspaceId),
        this.googleAnalytics4Connector.getSnapshot(workspaceId)
      ]);

      return mergeGoogleAnalytics4Snapshot(mergeGoogleSearchConsoleSnapshot(stack, gscSnapshot), ga4Snapshot);
    } catch {
      return stack;
    }
  }
}

export const rankFlowRepository: RankFlowRepository = new FixtureRankFlowRepository();
