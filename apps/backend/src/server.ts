import { createServer, type ServerResponse } from "node:http";
import {
  getHodSummary,
  getWorkspaceById,
  workspaces
} from "./rankflow-data";

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

const server = createServer((request, response) => {
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
    jsonResponse(response, 200, getHodSummary(workspaces));
    return;
  }

  if (url.pathname === "/api/workspaces") {
    jsonResponse(response, 200, workspaces);
    return;
  }

  const workspaceMatch = url.pathname.match(/^\/api\/workspaces\/([^/]+)$/);
  if (workspaceMatch) {
    const workspace = getWorkspaceById(workspaceMatch[1]);
    if (!workspace) {
      jsonResponse(response, 404, { error: "Workspace not found" });
      return;
    }
    jsonResponse(response, 200, workspace);
    return;
  }

  jsonResponse(response, 404, { error: "Route not found" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`RankFlow backend listening on http://127.0.0.1:${port}`);
});
