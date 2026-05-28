import type {
  ActionItem,
  AiBrainProfile,
  AiSuggestion,
  AuditCategory,
  AuditIntelligenceStack,
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
  workspaces
} from "../rankflow-data";

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
  getAiBrain(workspaceId: string): Promise<AiBrainProfile | undefined>;
  getAuditIntelligence(workspaceId: string): Promise<AuditIntelligenceStack | undefined>;
}

export class FixtureRankFlowRepository implements RankFlowRepository {
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

  async getAiBrain(workspaceId: string) {
    return aiBrainByWorkspace[workspaceId];
  }

  async getAuditIntelligence(workspaceId: string) {
    return auditIntelligenceByWorkspace[workspaceId];
  }
}

export const rankFlowRepository: RankFlowRepository = new FixtureRankFlowRepository();
