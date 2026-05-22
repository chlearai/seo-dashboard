import { describe, expect, it } from "vitest";
import type { RankFlowRole, WorkspaceAccess } from "./rankflow-types";
import {
  canAccessModule,
  canPerformAction,
  getVisibleModules,
  hasWorkspaceAccess
} from "./rankflow-helpers";

describe("rankflow access helpers", () => {
  const managerAccess: WorkspaceAccess = {
    workspaceId: "aurora-education",
    role: "manager",
    modulesEnabled: ["dashboard", "scan-history", "ai-suggestions", "workbook", "reports"],
    canAssignTasks: true,
    suggestionAccess: "full",
    canGenerateReports: true,
    canSeeInternalNotes: true,
    canRunScans: true,
    canExport: true
  };

  it("allows HOD users to access every workspace without assignment", () => {
    expect(hasWorkspaceAccess("hod", [], "nimbus-health")).toBe(true);
    expect(canPerformAction("hod", "delete-workspace")).toBe(true);
  });

  it("restricts specialists to assigned workspace modules and task execution actions", () => {
    const specialistAccess: WorkspaceAccess = {
      ...managerAccess,
      role: "specialist",
      modulesEnabled: ["dashboard", "scan-history", "ai-suggestions", "workbook"],
      canAssignTasks: false,
      canGenerateReports: false
    };

    expect(hasWorkspaceAccess("specialist", [specialistAccess], "aurora-education")).toBe(true);
    expect(hasWorkspaceAccess("specialist", [specialistAccess], "nimbus-health")).toBe(false);
    expect(canAccessModule("specialist", specialistAccess, "reports")).toBe(false);
    expect(canPerformAction("specialist", "update-task", specialistAccess)).toBe(true);
    expect(canPerformAction("specialist", "assign-task", specialistAccess)).toBe(false);
  });

  it("limits client users to portal visibility and no internal modules", () => {
    const role: RankFlowRole = "client";

    expect(getVisibleModules(role, [managerAccess])).toEqual(["client-portal"]);
    expect(canPerformAction(role, "run-scan", managerAccess)).toBe(false);
    expect(canPerformAction(role, "view-client-portal", managerAccess)).toBe(true);
  });
});
