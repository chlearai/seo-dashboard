import { describe, expect, it, vi } from "vitest";
import { createGoogleAnalytics4Connector } from "../src/connectors/google-analytics-4";

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Bad Request",
    json: async () => body
  } as Response;
}

describe("google analytics 4 connector", () => {
  it("returns null when live mode is disabled", async () => {
    const connector = createGoogleAnalytics4Connector({
      enabled: false,
      propertyId: "123456789",
      accessToken: "token",
      fetchImpl: vi.fn()
    });

    await expect(connector.getSnapshot("aurora-education")).resolves.toBeNull();
  });

  it("queries organic and referral traffic and normalizes the metrics", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          rowCount: 1,
          rows: [
            {
              dimensionValues: [{ value: "Organic Search" }],
              metricValues: [{ value: "9800" }, { value: "7600" }, { value: "318" }, { value: "0.038" }]
            }
          ]
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          rowCount: 1,
          rows: [
            {
              dimensionValues: [{ value: "Organic Search" }],
              metricValues: [{ value: "7600" }, { value: "6200" }, { value: "210" }, { value: "0.027" }]
            }
          ]
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          rowCount: 1,
          rows: [
            {
              dimensionValues: [{ value: "Referral" }],
              metricValues: [{ value: "920" }, { value: "860" }, { value: "12" }, { value: "0.014" }]
            }
          ]
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          rowCount: 1,
          rows: [
            {
              dimensionValues: [{ value: "Referral" }],
              metricValues: [{ value: "700" }, { value: "640" }, { value: "8" }, { value: "0.012" }]
            }
          ]
        })
      );

    const connector = createGoogleAnalytics4Connector({
      enabled: true,
      propertyId: "123456789",
      accessToken: "token",
      fetchImpl,
      now: () => new Date("2026-05-28T12:00:00.000Z")
    });

    await expect(connector.getSnapshot("aurora-education")).resolves.toMatchObject({
      sourceStatus: {
        source: "ga4",
        label: "Google Analytics 4",
        status: "Connected",
        recordsAvailable: 2
      },
      searchPerformance: expect.arrayContaining([
        expect.objectContaining({ label: "Organic sessions", value: 9800, delta: 2200, category: "sessions" }),
        expect.objectContaining({ label: "Organic users", value: 7600, delta: 1400, category: "users" }),
        expect.objectContaining({ label: "Organic leads", value: 318, delta: 108, category: "leads" }),
        expect.objectContaining({ label: "Organic conversion rate", value: 3.8, delta: 1.1, category: "conversions" }),
        expect.objectContaining({ label: "Referral sessions", value: 920, delta: 220, category: "referral" })
      ])
    });

    expect(fetchImpl).toHaveBeenCalledTimes(4);
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://analyticsdata.googleapis.com/v1beta/properties/123456789:runReport",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer token"
        })
      })
    );
  });
});
