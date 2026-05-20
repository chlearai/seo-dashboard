import type { ScoreHealth, Workspace } from "./rankflow-types";

export function scoreHealth(score: number): ScoreHealth {
  const clamped = Math.max(0, Math.min(100, score));

  if (clamped >= 85) return { label: "Excellent", tone: "success" };
  if (clamped >= 75) return { label: "Healthy", tone: "success" };
  if (clamped >= 65) return { label: "Watch", tone: "warning" };
  return { label: "At Risk", tone: "critical" };
}

export function getLatestScan(workspace: Workspace) {
  return workspace.scans[0];
}
