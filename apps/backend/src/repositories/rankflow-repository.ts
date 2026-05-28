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
  screamingFrogByWorkspace,
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
import {
  createAhrefsConnector,
  createAhrefsLiveConfigFromEnv,
  type AhrefsConnector,
  type AhrefsSnapshot
} from "../connectors/ahrefs";
import {
  createClaudeSeoBrainConnector,
  createClaudeSeoBrainLiveConfigFromEnv,
  type ClaudeSeoBrainConnector,
  type ClaudeSeoBrainSnapshot
} from "../connectors/claude-seo-brain";
import {
  createDataForSeoConnector,
  createDataForSeoLiveConfigFromEnv,
  type DataForSeoConnector,
  type DataForSeoSnapshot
} from "../connectors/dataforseo";
import {
  createSemrushConnector,
  createSemrushLiveConfigFromEnv,
  type SemrushConnector,
  type SemrushSnapshot
} from "../connectors/semrush";

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
  getScreamingFrog(workspaceId: string): Promise<CrawlerEvaluation | undefined>;
  getAiBrain(workspaceId: string): Promise<AiBrainProfile | undefined>;
  getAuditIntelligence(workspaceId: string): Promise<AuditIntelligenceStack | undefined>;
}

export interface FixtureRankFlowRepositoryOptions {
  googleSearchConsoleConnector?: GoogleSearchConsoleConnector;
  googleAnalytics4Connector?: GoogleAnalytics4Connector;
  dataForSeoConnector?: DataForSeoConnector;
  ahrefsConnector?: AhrefsConnector;
  semrushConnector?: SemrushConnector;
  claudeBrainConnector?: ClaudeSeoBrainConnector;
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

function mergeAuthoritySnapshot(
  stack: AuditIntelligenceStack,
  snapshot: DataForSeoSnapshot | AhrefsSnapshot | SemrushSnapshot | null
): AuditIntelligenceStack {
  if (!snapshot) {
    return stack;
  }

  return {
    ...stack,
    sourceStatuses: stack.sourceStatuses.map((source) =>
      source.source === snapshot.sourceStatus.source ? snapshot.sourceStatus : source
    ),
    authoritySignals: [
      ...stack.authoritySignals.filter((signal) => signal.source !== snapshot.sourceStatus.source),
      ...snapshot.authoritySignals
    ].sort((a, b) => a.label.localeCompare(b.label))
  };
}

function mergeClaudeBrainSnapshot(
  stack: AuditIntelligenceStack,
  snapshot: ClaudeSeoBrainSnapshot | null
): AuditIntelligenceStack {
  if (!snapshot) {
    return stack;
  }

  return {
    ...stack,
    sourceStatuses: stack.sourceStatuses.map((source) =>
      source.source === "claude-brain" ? snapshot.sourceStatus : source
    ),
    claudeBrain: snapshot.claudeBrain
  };
}

export class FixtureRankFlowRepository implements RankFlowRepository {
  private readonly googleSearchConsoleConnector: GoogleSearchConsoleConnector;
  private readonly googleAnalytics4Connector: GoogleAnalytics4Connector;
  private readonly dataForSeoConnector: DataForSeoConnector;
  private readonly ahrefsConnector: AhrefsConnector;
  private readonly semrushConnector: SemrushConnector;
  private readonly claudeBrainConnector: ClaudeSeoBrainConnector;

  constructor(options: FixtureRankFlowRepositoryOptions = {}) {
    this.googleSearchConsoleConnector =
      options.googleSearchConsoleConnector ?? createGoogleSearchConsoleConnector(createGoogleSearchConsoleLiveConfigFromEnv());
    this.googleAnalytics4Connector =
      options.googleAnalytics4Connector ?? createGoogleAnalytics4Connector(createGoogleAnalytics4LiveConfigFromEnv());
    this.dataForSeoConnector =
      options.dataForSeoConnector ?? createDataForSeoConnector(createDataForSeoLiveConfigFromEnv());
    this.ahrefsConnector = options.ahrefsConnector ?? createAhrefsConnector(createAhrefsLiveConfigFromEnv());
    this.semrushConnector = options.semrushConnector ?? createSemrushConnector(createSemrushLiveConfigFromEnv());
    this.claudeBrainConnector =
      options.claudeBrainConnector ?? createClaudeSeoBrainConnector(createClaudeSeoBrainLiveConfigFromEnv());
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

  async getScreamingFrog(workspaceId: string) {
    return screamingFrogByWorkspace[workspaceId];
  }

  async getAiBrain(workspaceId: string) {
    return aiBrainByWorkspace[workspaceId];
  }

  async getAuditIntelligence(workspaceId: string) {
    const workspace = getWorkspaceById(workspaceId);
    const stack = auditIntelligenceByWorkspace[workspaceId];
    if (!stack) {
      return undefined;
    }

    const domain = workspace?.primaryDomain;
    const [gscSnapshot, ga4Snapshot, dataForSeoSnapshot, ahrefsSnapshot, semrushSnapshot] =
      await Promise.allSettled([
        this.googleSearchConsoleConnector.getSnapshot(workspaceId),
        this.googleAnalytics4Connector.getSnapshot(workspaceId),
        domain ? this.dataForSeoConnector.getSnapshot(workspaceId, { domain }) : Promise.resolve(null),
        domain ? this.ahrefsConnector.getSnapshot(workspaceId, { domain }) : Promise.resolve(null),
        domain ? this.semrushConnector.getSnapshot(workspaceId, { domain }) : Promise.resolve(null)
      ]);

    const mergedEvidence = mergeAuthoritySnapshot(
      mergeAuthoritySnapshot(
        mergeAuthoritySnapshot(
          mergeGoogleAnalytics4Snapshot(
            mergeGoogleSearchConsoleSnapshot(stack, gscSnapshot.status === "fulfilled" ? gscSnapshot.value : null),
            ga4Snapshot.status === "fulfilled" ? ga4Snapshot.value : null
          ),
          dataForSeoSnapshot.status === "fulfilled" ? dataForSeoSnapshot.value : null
        ),
        ahrefsSnapshot.status === "fulfilled" ? ahrefsSnapshot.value : null
      ),
      semrushSnapshot.status === "fulfilled" ? semrushSnapshot.value : null
    );

    const claudeBrainSnapshot = domain && workspace
      ? await this.claudeBrainConnector.getSnapshot(workspaceId, {
          workspace: {
            clientName: workspace.clientName,
            primaryDomain: workspace.primaryDomain
          },
          stack: mergedEvidence
        }).catch(() => null)
      : null;

    return mergeClaudeBrainSnapshot(mergedEvidence, claudeBrainSnapshot);
  }
}

export const rankFlowRepository: RankFlowRepository = new FixtureRankFlowRepository();
