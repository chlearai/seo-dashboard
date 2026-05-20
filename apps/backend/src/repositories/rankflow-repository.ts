import type {
  AiSuggestion,
  AuditCategory,
  HodSummary,
  ScanSnapshot,
  WorkbookTask,
  Workspace
} from "@rankflow/shared";
import { getHodSummary, getWorkspaceById, workspaces } from "../rankflow-data";

export interface RankFlowRepository {
  listWorkspaces(): Promise<Workspace[]>;
  getWorkspace(id: string): Promise<Workspace | undefined>;
  getHodSummary(): Promise<HodSummary>;
  listScans(workspaceId: string): Promise<ScanSnapshot[]>;
  listAuditCategories(workspaceId: string): Promise<AuditCategory[]>;
  listSuggestions(workspaceId: string): Promise<AiSuggestion[]>;
  listTasks(workspaceId: string): Promise<WorkbookTask[]>;
}

export class FixtureRankFlowRepository implements RankFlowRepository {
  async listWorkspaces() {
    return workspaces;
  }

  async getWorkspace(id: string) {
    return getWorkspaceById(id);
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
}

export const rankFlowRepository: RankFlowRepository = new FixtureRankFlowRepository();
