import { describe, expect, it } from "vitest";
import type { KeywordRanking, ReportSnapshot } from "./rankflow-types";
import { getKeywordSummary, getReportReadinessSummary } from "./rankflow-helpers";

describe("rankflow growth module helpers", () => {
  it("summarizes keyword visibility distribution and movement", () => {
    const keywords: KeywordRanking[] = [
      keyword("mba admissions", 3, 2),
      keyword("executive mba india", 9, -1),
      keyword("online mba fees", 18, 5),
      keyword("business school ranking", 42, -8)
    ];

    expect(getKeywordSummary(keywords)).toEqual({
      tracked: 4,
      top3: 1,
      top10: 2,
      top20: 3,
      improved: 2,
      declined: 2,
      averagePosition: 18
    });
  });

  it("summarizes report readiness across published and draft reports", () => {
    const reports: ReportSnapshot[] = [
      report("May SEO Progress Report", "Published", 100),
      report("June SEO Progress Report", "Draft", 72),
      report("Quarterly Growth Review", "Review", 88)
    ];

    expect(getReportReadinessSummary(reports)).toEqual({
      total: 3,
      published: 1,
      needsReview: 1,
      drafts: 1,
      averageReadiness: 87
    });
  });
});

function keyword(keywordText: string, position: number, delta: number): KeywordRanking {
  return {
    id: keywordText.toLowerCase().replaceAll(" ", "-"),
    keyword: keywordText,
    intent: "Commercial",
    mappedPage: "/mba/admissions",
    currentPosition: position,
    previousPosition: position + delta,
    positionDelta: delta,
    volume: 2400,
    difficulty: 52,
    serpFeatures: ["PAA"],
    updatedAt: "2026-05-20"
  };
}

function report(title: string, status: ReportSnapshot["status"], readinessScore: number): ReportSnapshot {
  return {
    id: title.toLowerCase().replaceAll(" ", "-"),
    title,
    period: "May 2026",
    status,
    dueDate: "2026-05-24",
    readinessScore,
    sectionsReady: 10,
    totalSections: 14,
    lastUpdated: "2026-05-20",
    clientVisible: status === "Published",
    owner: "Maya Iyer"
  };
}
