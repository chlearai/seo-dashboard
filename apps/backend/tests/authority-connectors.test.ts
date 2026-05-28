import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import { createAhrefsConnector } from "../src/connectors/ahrefs";
import { createClaudeSeoBrainConnector } from "../src/connectors/claude-seo-brain";
import { createDataForSeoConnector } from "../src/connectors/dataforseo";
import { createSemrushConnector } from "../src/connectors/semrush";
import type { AuditIntelligenceStack } from "@rankflow/shared";

function basicAuth(login: string, password: string) {
  return `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
}

function normalizeHeaders(headers: HeadersInit | undefined) {
  if (!headers) {
    return undefined;
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  return Object.fromEntries(Object.entries(headers as Record<string, string>));
}

describe("authority connectors", () => {
  it("reads a DataForSEO snapshot from the live endpoints", async () => {
    const calls: Array<{ url: string; method: string; authorization?: string; body?: string }> = [];
    const connector = createDataForSeoConnector({
      enabled: true,
      apiLogin: "login",
      apiPassword: "password",
      fetchImpl: async (input, init) => {
        const url = String(input);
        const headers = init?.headers as Record<string, string> | undefined;
        calls.push({
          url,
          method: init?.method ?? "GET",
          authorization: headers?.Authorization ?? headers?.authorization,
          body: init?.body ? String(init.body) : undefined
        });

        if (url.includes("/dataforseo_labs/domain_rank_overview/live")) {
          return new Response(
            JSON.stringify({
              tasks: [
                {
                  result: [
                    {
                      items: [
                        {
                          metrics: {
                            organic: {
                              pos_1: 3,
                              pos_2_3: 4,
                              pos_4_10: 12,
                              pos_11_20: 18,
                              etv: 1234,
                              is_up: 6,
                              is_down: 1
                            }
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        if (url.includes("/backlinks/summary/live")) {
          return new Response(
            JSON.stringify({
              tasks: [
                {
                  result: [
                    {
                      metrics: {
                        backlinks: 1918,
                        refdomains: 348,
                        new_backlinks: 78,
                        lost_backlinks: 12
                      }
                    }
                  ]
                }
              ]
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        throw new Error(`Unexpected request: ${url}`);
      }
    });

    await expect(connector.getSnapshot("aurora-education", { domain: "aurora.edu" })).resolves.toMatchObject({
      sourceStatus: expect.objectContaining({
        source: "dataforseo",
        status: "Connected"
      }),
      authoritySignals: expect.arrayContaining([
        expect.objectContaining({ source: "dataforseo", label: "Keyword rank movement", category: "keyword-rank" }),
        expect.objectContaining({ source: "dataforseo", label: "Backlinks", category: "backlinks" }),
        expect.objectContaining({ source: "dataforseo", label: "Referring domains", category: "referring-domains" })
      ])
    });

    expect(calls).toEqual([
      expect.objectContaining({
        url: "https://api.dataforseo.com/v3/dataforseo_labs/domain_rank_overview/live",
        method: "POST",
        authorization: basicAuth("login", "password")
      }),
      expect.objectContaining({
        url: "https://api.dataforseo.com/v3/backlinks/summary/live",
        method: "POST",
        authorization: basicAuth("login", "password")
      })
    ]);
  });

  it("reads an Ahrefs snapshot from the live endpoints", async () => {
    const calls: string[] = [];
    const connector = createAhrefsConnector({
      enabled: true,
      apiKey: "ahrefs-key",
      now: () => new Date("2026-05-28T12:00:00.000Z"),
      fetchImpl: async (input, init) => {
        const url = String(input);
        calls.push(url);

        if (url.includes("/site-explorer/domain-rating")) {
          expect(init?.headers).toEqual(expect.objectContaining({ Authorization: "Bearer ahrefs-key" }));
          return new Response(JSON.stringify({ domain_rating: { domain_rating: 52.5, ahrefs_rank: 12345 } }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }

        if (url.includes("/site-explorer/backlinks-stats")) {
          return new Response(
            JSON.stringify({ metrics: { all_time: 1918, all_time_refdomains: 348, live: 1780, live_refdomains: 312 } }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        throw new Error(`Unexpected request: ${url}`);
      }
    });

    await expect(connector.getSnapshot("aurora-education", { domain: "aurora.edu" })).resolves.toMatchObject({
      sourceStatus: expect.objectContaining({
        source: "ahrefs",
        status: "Connected"
      }),
      authoritySignals: expect.arrayContaining([
        expect.objectContaining({ source: "ahrefs", label: "Domain rating", category: "authority-score" }),
        expect.objectContaining({ source: "ahrefs", label: "Backlinks", category: "backlinks" }),
        expect.objectContaining({ source: "ahrefs", label: "Referring domains", category: "referring-domains" })
      ])
    });

    expect(calls).toEqual([
      "https://api.ahrefs.com/v3/site-explorer/domain-rating?protocol=both&target=aurora.edu&date=2026-05-28&output=json",
      "https://api.ahrefs.com/v3/site-explorer/backlinks-stats?protocol=both&target=aurora.edu&date=2026-05-28&output=json&mode=domain"
    ]);
  });

  it("reads a Semrush snapshot from the live endpoint", async () => {
    const calls: string[] = [];
    const connector = createSemrushConnector({
      enabled: true,
      apiKey: "semrush-key",
      database: "us",
      fetchImpl: async (input) => {
        const url = String(input);
        calls.push(url);

        if (!url.includes("type=domain_rank")) {
          throw new Error(`Unexpected request: ${url}`);
        }

        return new Response(
          "Database;Domain;Rank;Organic Keywords;Organic Traffic;Organic Cost;Adwords Keywords;Adwords Traffic;Adwords Cost;PLA keywords;PLA uniques\nus;aurora.edu;1234;12000;98000;5000;0;0;0;0;0",
          { status: 200, headers: { "Content-Type": "text/csv" } }
        );
      }
    });

    await expect(connector.getSnapshot("aurora-education", { domain: "aurora.edu" })).resolves.toMatchObject({
      sourceStatus: expect.objectContaining({
        source: "semrush",
        status: "Connected"
      }),
      authoritySignals: expect.arrayContaining([
        expect.objectContaining({ source: "semrush", label: "Organic keywords", category: "visibility" }),
        expect.objectContaining({ source: "semrush", label: "Organic traffic", category: "traffic" }),
        expect.objectContaining({ source: "semrush", label: "Semrush rank", category: "keyword-rank" })
      ])
    });

    expect(calls).toEqual([
      "https://api.semrush.com/?key=semrush-key&type=domain_rank&domain=aurora.edu&database=us"
    ]);
  });

  it("reads a Claude SEO Brain snapshot from Anthropic Messages", async () => {
    const stack: AuditIntelligenceStack = {
      workspaceId: "aurora-education",
      sourceStatuses: [],
      technicalChecks: [],
      searchPerformance: [],
      authoritySignals: [],
      claudeBrain: {
        id: "placeholder",
        status: "Needs Approval",
        inputSources: [],
        confidenceScore: 0,
        promptVersion: "seo-brain-v1",
        findingsGenerated: 0,
        actionsGenerated: 0,
        reportNarrativesGenerated: 0,
        requiresHumanApproval: true,
        lastRunAt: "2026-05-28T00:00:00.000Z"
      }
    };

    const calls: Array<{ url: string; body?: string; headers?: Record<string, string> }> = [];
    const connector = createClaudeSeoBrainConnector({
      enabled: true,
      apiKey: "claude-key",
      model: "claude-sonnet-4-20250514",
      fetchImpl: async (input, init) => {
        calls.push({
          url: String(input),
          body: init?.body ? String(init.body) : undefined,
          headers: normalizeHeaders(init?.headers)
        });

        return new Response(
          JSON.stringify({
            id: "msg_1",
            type: "message",
            role: "assistant",
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  confidenceScore: 90,
                  findingsGenerated: 21,
                  actionsGenerated: 11,
                  reportNarrativesGenerated: 3,
                  requiresHumanApproval: true,
                  summary: "Prioritize title, schema, and backlink work first."
                })
              }
            ],
            model: "claude-sonnet-4-20250514",
            stop_reason: "end_turn",
            stop_sequence: null,
            usage: {
              input_tokens: 12,
              output_tokens: 6
            }
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    });

    await expect(connector.getSnapshot("aurora-education", { workspace: { clientName: "Aurora Education Group", primaryDomain: "aurora.edu" }, stack })).resolves
      .toMatchObject({
        sourceStatus: expect.objectContaining({
          source: "claude-brain",
          status: "Connected"
        }),
        claudeBrain: expect.objectContaining({
          status: "Ready",
          promptVersion: "claude-sonnet-4-20250514",
          confidenceScore: 90,
          findingsGenerated: 21,
          actionsGenerated: 11,
          reportNarrativesGenerated: 3
        })
      });

    expect(calls[0]).toEqual(
      expect.objectContaining({
        url: "https://api.anthropic.com/v1/messages",
        headers: expect.objectContaining({
          "x-api-key": "claude-key",
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        })
      })
    );
  });
});
