import { describe, expect, it } from "vitest";
import { FixtureRankFlowRepository } from "../src/repositories/rankflow-repository";

describe("own crawler repository", () => {
  const repository = new FixtureRankFlowRepository();

  it("returns the workspace crawler evaluation", async () => {
    await expect(repository.getOwnCrawler("aurora-education")).resolves.toMatchObject({
      sourceStatus: expect.objectContaining({
        source: "own-crawler",
        status: "Connected"
      }),
      summary: expect.objectContaining({
        pagesCrawled: 5,
        missingTitles: 1,
        canonicalConflicts: 1,
        blockedImportantPages: 1
      }),
      ruleChecks: expect.arrayContaining([
        expect.objectContaining({ label: "Missing titles", failedUrls: 1 }),
        expect.objectContaining({ label: "Canonical conflicts", failedUrls: 1 })
      ])
    });
  });

  it("returns undefined for missing workspace crawler evaluation", async () => {
    await expect(repository.getOwnCrawler("missing")).resolves.toBeUndefined();
  });
});
