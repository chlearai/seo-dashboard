import { describe, expect, it, vi } from "vitest";
import { createGoogleSearchConsoleConnector } from "../src/connectors/google-search-console";

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Bad Request",
    json: async () => body
  } as Response;
}

describe("google search console connector", () => {
  it("returns null when live mode is disabled", async () => {
    const connector = createGoogleSearchConsoleConnector({
      enabled: false,
      siteUrl: "sc-domain:aurora.edu",
      accessToken: "token",
      fetchImpl: vi.fn()
    });

    await expect(connector.getSnapshot("aurora-education")).resolves.toBeNull();
  });

  it("queries current and previous ranges and normalizes the metrics", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          clicks: 6100,
          impressions: 134000,
          ctr: 0.0455,
          rows: [{ clicks: 60, impressions: 1200, ctr: 0.05, position: 9.2 }]
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          clicks: 4200,
          impressions: 100000,
          ctr: 0.042,
          rows: [{ clicks: 40, impressions: 1000, ctr: 0.04, position: 10.4 }]
        })
      );

    const connector = createGoogleSearchConsoleConnector({
      enabled: true,
      siteUrl: "sc-domain:aurora.edu",
      accessToken: "token",
      fetchImpl,
      now: () => new Date("2026-05-28T12:00:00.000Z")
    });

    await expect(connector.getSnapshot("aurora-education")).resolves.toMatchObject({
      sourceStatus: {
        source: "gsc",
        label: "Google Search Console",
        status: "Connected",
        recordsAvailable: 1
      },
      searchPerformance: expect.arrayContaining([
        expect.objectContaining({ label: "Search impressions", value: 134000, delta: 34000, category: "impressions" }),
        expect.objectContaining({ label: "Organic clicks", value: 6100, delta: 1900, category: "clicks" }),
        expect.objectContaining({ label: "Organic CTR", value: 4.6, delta: 0.4, category: "ctr" })
      ])
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Aaurora.edu/searchAnalytics/query",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer token"
        })
      })
    );
  });
});
