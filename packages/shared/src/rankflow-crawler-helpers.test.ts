import { describe, expect, it } from "vitest";
import { evaluateCrawlerPages } from "./rankflow-helpers";
import type { CrawlerPageSnapshot } from "./rankflow-types";

describe("rankflow crawler helpers", () => {
  it("evaluates common technical crawl rules into findings and rule checks", () => {
    const pages: CrawlerPageSnapshot[] = [
      {
        id: "p-1",
        url: "https://aurora.edu/mba-admissions",
        priority: "core",
        statusCode: 200,
        title: "MBA Admissions | Aurora",
        metaDescription: "Apply for MBA at Aurora",
        h1: "MBA Admissions",
        canonicalUrl: "https://aurora.edu/mba-admissions",
        indexable: true,
        schemaTypes: ["Course", "FAQPage"],
        missingImageAlts: 0,
        brokenInternalLinks: 0,
        loadTimeMs: 1900
      },
      {
        id: "p-2",
        url: "https://aurora.edu/programs/pgdm",
        priority: "important",
        statusCode: 200,
        title: null,
        metaDescription: "Apply for MBA at Aurora",
        h1: null,
        canonicalUrl: "https://aurora.edu/programs",
        indexable: false,
        schemaTypes: [],
        missingImageAlts: 2,
        brokenInternalLinks: 3,
        loadTimeMs: 3200
      }
    ];

    const evaluation = evaluateCrawlerPages(pages);

    expect(evaluation.sourceStatus.source).toBe("own-crawler");
    expect(evaluation.summary).toMatchObject({
      pagesCrawled: 2,
      findings: 10,
      criticalFindings: 2,
      missingTitles: 1,
      missingH1s: 1,
      duplicateMetaDescriptions: 2,
      canonicalConflicts: 1,
      blockedImportantPages: 1,
      brokenInternalLinks: 1,
      schemaMissing: 1,
      imageAltMissing: 1,
      slowPages: 1,
      statusCodeErrors: 0
    });
    expect(evaluation.ruleChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Missing titles", failedUrls: 1 }),
        expect.objectContaining({ label: "Canonical conflicts", failedUrls: 1 }),
        expect.objectContaining({ label: "Duplicate meta descriptions", failedUrls: 2 })
      ])
    );
    expect(evaluation.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rule: "missing-title", url: "https://aurora.edu/programs/pgdm" }),
        expect.objectContaining({ rule: "canonical-conflict", severity: "critical" })
      ])
    );
  });
});
