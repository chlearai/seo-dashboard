import { describe, expect, it } from "vitest";
import { FixtureRankFlowRepository } from "../src/repositories/rankflow-repository";

describe("screaming frog repository", () => {
  const repository = new FixtureRankFlowRepository();

  it("returns the workspace screaming frog import", async () => {
    await expect(repository.getScreamingFrog("aurora-education")).resolves.toMatchObject({
      sourceStatus: expect.objectContaining({
        source: "screaming-frog",
        label: "Screaming Frog",
        status: "Import Ready"
      }),
      summary: expect.objectContaining({
        pagesCrawled: 4,
        findings: 18,
        missingTitles: 1,
        canonicalConflicts: 1,
        blockedImportantPages: 1,
        statusCodeErrors: 1
      }),
      ruleChecks: expect.arrayContaining([
        expect.objectContaining({ label: "Missing titles", failedUrls: 1 }),
        expect.objectContaining({ label: "Duplicate meta descriptions", failedUrls: 3 }),
        expect.objectContaining({ label: "Schema missing", failedUrls: 4 })
      ])
    });
  });

  it("returns undefined for missing workspace screaming frog import", async () => {
    await expect(repository.getScreamingFrog("missing")).resolves.toBeUndefined();
  });
});
