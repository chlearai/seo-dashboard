import { createServer, type ServerResponse } from "node:http";
import { rankFlowRepository } from "./repositories/rankflow-repository";

const port = Number(process.env.PORT ?? 4000);

function jsonResponse(response: ServerResponse, statusCode: number, body: unknown) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": process.env.CORS_ORIGIN ?? "http://127.0.0.1:3000",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  if (!request.url) {
    jsonResponse(response, 400, { error: "Missing request URL" });
    return;
  }

  if (request.method === "OPTIONS") {
    jsonResponse(response, 204, null);
    return;
  }

  if (request.method !== "GET") {
    jsonResponse(response, 405, { error: "Method not allowed" });
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);

  if (url.pathname === "/health") {
    jsonResponse(response, 200, { status: "ok", service: "rankflow-backend" });
    return;
  }

  if (url.pathname === "/api/hod/summary") {
    jsonResponse(response, 200, await rankFlowRepository.getHodSummary());
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
    /^\/api\/workspaces\/([^/]+)\/(scans|audit-categories|suggestions|tasks|keywords|reports)$/
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

    jsonResponse(response, 200, await rankFlowRepository.listReports(workspaceId));
    return;
  }

  jsonResponse(response, 404, { error: "Route not found" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`RankFlow backend listening on http://127.0.0.1:${port}`);
});
