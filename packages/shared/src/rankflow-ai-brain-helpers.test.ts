import { describe, expect, it } from "vitest";
import { getAiBrainSummary } from "./rankflow-helpers";
import type { AiBrainProfile } from "./rankflow-types";

describe("rankflow AI brain helpers", () => {
  it("summarizes system intelligence, approved automation, and risks", () => {
    const brain: AiBrainProfile = {
      status: "Active",
      lastRunAt: "2026-05-28 14:30",
      confidenceScore: 86,
      dataCoverageScore: 78,
      automationMode: "approval-required",
      insights: [
        {
          id: "insight-1",
          title: "Organic leads rose after FAQ schema and title updates",
          narrative: "AEO and commercial title work correlate with lead growth.",
          area: "conversion",
          confidence: 88,
          severity: "medium",
          evidenceRefs: ["metrics-aurora-2026-05-20", "act-aurora-faq-schema"]
        }
      ],
      recommendations: [
        {
          id: "rec-1",
          title: "Prioritize GEO evidence blocks on MBA pages",
          reason: "GEO visibility remains the weakest growth lever.",
          targetAction: "act-aurora-geo-evidence",
          priority: "high",
          expectedLift: "Improve AI answer presence by 8-12 points",
          requiresApproval: true
        },
        {
          id: "rec-2",
          title: "Generate draft client narrative",
          reason: "The latest cycle has enough approved evidence for reporting.",
          targetAction: "rep-aurora-may",
          priority: "medium",
          expectedLift: "Reduce reporting time",
          requiresApproval: false
        }
      ],
      narratives: [
        {
          id: "nar-1",
          audience: "client",
          title: "May organic growth story",
          summary: "Visibility, leads, and AEO readiness improved while GEO remains the next focus."
        }
      ],
      risks: [
        {
          id: "risk-1",
          title: "External GEO evidence work lacks approved proof",
          severity: "high",
          mitigation: "Request URL or CMS evidence before next report"
        }
      ]
    };

    expect(getAiBrainSummary(brain)).toEqual({
      status: "Active",
      confidenceScore: 86,
      dataCoverageScore: 78,
      highPriorityRecommendations: 1,
      approvalRequired: 1,
      highRisks: 1,
      clientNarratives: 1
    });
  });
});
