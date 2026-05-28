import type { AuditIntelligenceStack, AuditEvidenceSourceStatus, ClaudeBrainAuditRun } from "@rankflow/shared";

export interface ClaudeSeoBrainLiveConfig {
  enabled: boolean;
  apiKey?: string;
  model?: string;
  fetchImpl?: typeof fetch;
}

export interface ClaudeSeoBrainSnapshot {
  sourceStatus: AuditEvidenceSourceStatus;
  claudeBrain: ClaudeBrainAuditRun;
}

export interface ClaudeSeoBrainConnector {
  getSnapshot(
    workspaceId: string,
    context: { workspace: { clientName: string; primaryDomain: string }; stack: AuditIntelligenceStack }
  ): Promise<ClaudeSeoBrainSnapshot | null>;
}

function resolveFetch(fetchImpl: typeof fetch | undefined) {
  if (fetchImpl) return fetchImpl;
  if (typeof fetch === "undefined") {
    throw new Error("Global fetch is unavailable");
  }
  return fetch;
}

function buildPrompt(workspaceName: string, domain: string, stack: AuditIntelligenceStack) {
  return [
    `Workspace: ${workspaceName}`,
    `Primary domain: ${domain}`,
    `Technical checks: ${stack.technicalChecks.length}`,
    `Search performance signals: ${stack.searchPerformance.length}`,
    `Authority signals: ${stack.authoritySignals.length}`,
    `Connected sources: ${stack.sourceStatuses.map((source) => `${source.source}:${source.status}`).join(", ")}`,
    `Return strict JSON with keys confidenceScore, findingsGenerated, actionsGenerated, reportNarrativesGenerated, requiresHumanApproval, summary.`
  ].join("\n");
}

function parseResponseText(text: string) {
  const trimmed = text.trim();
  const jsonStart = trimmed.indexOf("{");
  const jsonEnd = trimmed.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("Claude response did not contain JSON");
  }

  return JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1)) as {
    confidenceScore?: number;
    findingsGenerated?: number;
    actionsGenerated?: number;
    reportNarrativesGenerated?: number;
    requiresHumanApproval?: boolean;
    summary?: string;
  };
}

export function createClaudeSeoBrainConnector(config: ClaudeSeoBrainLiveConfig): ClaudeSeoBrainConnector {
  return {
    async getSnapshot(workspaceId: string, context: { workspace: { clientName: string; primaryDomain: string }; stack: AuditIntelligenceStack }) {
      if (!config.enabled) {
        return null;
      }

      if (!config.apiKey) {
        throw new Error(`Claude SEO Brain live mode is missing apiKey for ${workspaceId}`);
      }

      const fetchImpl = resolveFetch(config.fetchImpl);
      const model = config.model ?? "claude-sonnet-4-20250514";
      const response = await fetchImpl("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": config.apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          system:
            "You are RankFlow's SEO brain. Return strict JSON only. Do not wrap the JSON in markdown. The JSON must contain confidenceScore, findingsGenerated, actionsGenerated, reportNarrativesGenerated, requiresHumanApproval, and summary.",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: buildPrompt(context.workspace.clientName, context.workspace.primaryDomain, context.stack)
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude Messages request failed: ${response.status} ${response.statusText}`);
      }

      const payload = (await response.json()) as {
        content?: Array<{ type: string; text?: string }>;
      };
      const responseText = payload.content?.find((chunk) => chunk.type === "text")?.text ?? "";
      const analysis = parseResponseText(responseText);
      const now = new Date().toISOString();
      const confidenceScore = Number.isFinite(analysis.confidenceScore ?? NaN) ? (analysis.confidenceScore ?? 0) : 0;

      return {
        sourceStatus: {
          source: "claude-brain",
          label: "Claude SEO Brain",
          status: "Connected",
          coverageScore: Math.min(100, 70 + Math.round(confidenceScore / 2)),
          lastSyncedAt: now,
          recordsAvailable: 1,
          primaryUse: analysis.summary ?? "Interpretation, prioritization, and reporting"
        },
        claudeBrain: {
          id: `claude-brain-${workspaceId}-${now}`,
          status: "Ready",
          inputSources: context.stack.sourceStatuses.map((source) => source.source),
          confidenceScore,
          promptVersion: model,
          findingsGenerated: Number.isFinite(analysis.findingsGenerated ?? NaN) ? (analysis.findingsGenerated ?? 0) : 0,
          actionsGenerated: Number.isFinite(analysis.actionsGenerated ?? NaN) ? (analysis.actionsGenerated ?? 0) : 0,
          reportNarrativesGenerated: Number.isFinite(analysis.reportNarrativesGenerated ?? NaN)
            ? (analysis.reportNarrativesGenerated ?? 0)
            : 0,
          requiresHumanApproval: analysis.requiresHumanApproval ?? true,
          lastRunAt: now
        }
      };
    }
  };
}

export function createClaudeSeoBrainLiveConfigFromEnv(): ClaudeSeoBrainLiveConfig {
  return {
    enabled:
      process.env.RANKFLOW_CLAUDE_BRAIN_LIVE_MODE === "1" ||
      process.env.RANKFLOW_CLAUDE_BRAIN_LIVE_MODE === "true",
    apiKey: process.env.RANKFLOW_CLAUDE_BRAIN_API_KEY,
    model: process.env.RANKFLOW_CLAUDE_BRAIN_MODEL ?? "claude-sonnet-4-20250514"
  };
}
