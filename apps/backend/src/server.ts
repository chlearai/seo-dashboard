import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { rankFlowRepository } from "./repositories/rankflow-repository";

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";

function jsonResponse(response: ServerResponse, statusCode: number, body: unknown) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": process.env.CORS_ORIGIN ?? "http://127.0.0.1:3000",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(body));
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
}

const server = createServer(async (request, response) => {
  try {
    if (!request.url) {
      jsonResponse(response, 400, { error: "Missing request URL" });
      return;
    }

    if (request.method === "OPTIONS") {
      jsonResponse(response, 204, null);
      return;
    }

    const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);

    const approvalMatch = url.pathname.match(/^\/api\/workspaces\/([^/]+)\/ai-workflow\/([^/]+)$/);
    if (approvalMatch && request.method === "POST") {
      const [, workspaceId, recommendationId] = approvalMatch;
      const workspace = await rankFlowRepository.getWorkspace(workspaceId);

      if (!workspace) {
        jsonResponse(response, 404, { error: "Workspace not found" });
        return;
      }

      const body = await readJsonBody(request);
      const decision = typeof body === "object" && body && "decision" in body ? body.decision : undefined;
      const decidedBy = typeof body === "object" && body && "decidedBy" in body ? body.decidedBy : undefined;

      if (decision !== "approved" && decision !== "rejected") {
        jsonResponse(response, 400, { error: "decision must be approved or rejected" });
        return;
      }

      const approval = await rankFlowRepository.saveAiWorkflowApproval(workspaceId, {
        recommendationId,
        decision,
        decidedAt: new Date().toISOString(),
        decidedBy: typeof decidedBy === "string" && decidedBy.trim() ? decidedBy : "RankFlow HOD"
      });

      jsonResponse(response, 200, approval);
      return;
    }

    if (request.method !== "GET") {
      jsonResponse(response, 405, { error: "Method not allowed" });
      return;
    }

    if (url.pathname === "/health") {
      jsonResponse(response, 200, { status: "ok", service: "rankflow-backend" });
      return;
    }

    if (url.pathname === "/api/hod/summary") {
      jsonResponse(response, 200, await rankFlowRepository.getHodSummary());
      return;
    }

    if (url.pathname === "/api/session") {
      jsonResponse(response, 200, await rankFlowRepository.getSession());
      return;
    }

    if (url.pathname === "/api/workspaces") {
      jsonResponse(response, 200, await rankFlowRepository.listWorkspaces());
      return;
    }

    const workspaceMatch = url.pathname.match(/^\/api\/workspaces\/([^/]+)$/);
    if (workspaceMatch) {
      const workspace = await rankFlowRepository.getWorkspace(workspaceMatch[1]);
      if (!workspace) {
        jsonResponse(response, 404, { error: "Workspace not found" });
        return;
      }
      jsonResponse(response, 200, workspace);
      return;
    }

    const workspaceCollectionMatch = url.pathname.match(
      /^\/api\/workspaces\/([^/]+)\/(scans|audit-categories|suggestions|tasks|keywords|reports|local-visibility|growth-cycles|organic-metrics|action-items|expert-efficiency|own-crawler|screaming-frog|ai-brain|ai-workflow|audit-intelligence)$/
    );
    if (workspaceCollectionMatch) {
      const [, workspaceId, collection] = workspaceCollectionMatch;
      const workspace = await rankFlowRepository.getWorkspace(workspaceId);

      if (!workspace) {
        jsonResponse(response, 404, { error: "Workspace not found" });
        return;
      }

      if (collection === "scans") {
        jsonResponse(response, 200, await rankFlowRepository.listScans(workspaceId));
        return;
      }

      if (collection === "audit-categories") {
        jsonResponse(response, 200, await rankFlowRepository.listAuditCategories(workspaceId));
        return;
      }

      if (collection === "suggestions") {
        jsonResponse(response, 200, await rankFlowRepository.listSuggestions(workspaceId));
        return;
      }

      if (collection === "tasks") {
        jsonResponse(response, 200, await rankFlowRepository.listTasks(workspaceId));
        return;
      }

      if (collection === "keywords") {
        jsonResponse(response, 200, await rankFlowRepository.listKeywords(workspaceId));
        return;
      }

      if (collection === "local-visibility") {
        jsonResponse(response, 200, await rankFlowRepository.getLocalVisibility(workspaceId));
        return;
      }

      if (collection === "growth-cycles") {
        jsonResponse(response, 200, await rankFlowRepository.listGrowthCycles(workspaceId));
        return;
      }

      if (collection === "organic-metrics") {
        jsonResponse(response, 200, await rankFlowRepository.listOrganicMetricSnapshots(workspaceId));
        return;
      }

      if (collection === "action-items") {
        jsonResponse(response, 200, await rankFlowRepository.listActionItems(workspaceId));
        return;
      }

      if (collection === "expert-efficiency") {
        jsonResponse(response, 200, await rankFlowRepository.listExpertEfficiency(workspaceId));
        return;
      }

      if (collection === "own-crawler") {
        jsonResponse(response, 200, await rankFlowRepository.getOwnCrawler(workspaceId));
        return;
      }

      if (collection === "screaming-frog") {
        jsonResponse(response, 200, await rankFlowRepository.getScreamingFrog(workspaceId));
        return;
      }

      if (collection === "ai-brain") {
        jsonResponse(response, 200, await rankFlowRepository.getAiBrain(workspaceId));
        return;
      }

      if (collection === "ai-workflow") {
        jsonResponse(response, 200, await rankFlowRepository.getAiWorkflowConsole(workspaceId));
        return;
      }

      if (collection === "audit-intelligence") {
        jsonResponse(response, 200, await rankFlowRepository.getAuditIntelligence(workspaceId));
        return;
      }

      jsonResponse(response, 200, await rankFlowRepository.listReports(workspaceId));
      return;
    }

    jsonResponse(response, 404, { error: "Route not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected backend error";
    jsonResponse(response, 503, { error: message });
  }
});

server.listen(port, host, () => {
  console.log(`RankFlow backend listening on http://${host}:${port}`);
});
