"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ScanSnapshot, ActionItem, AuditCategory, Workspace } from "@rankflow/shared";
import { ReAuditComparisonModule } from "./workspace-modules";

export function ReAuditPageClient({
  workspace,
  scans,
  actions,
  auditCategories,
  defaultSince,
  defaultVs
}: {
  workspace: Workspace;
  scans: ScanSnapshot[];
  actions: ActionItem[];
  auditCategories: AuditCategory[];
  defaultSince: string;
  defaultVs: string;
}) {
  const router = useRouter();
  const [sinceId, setSinceId] = useState(defaultSince);
  const [vsId, setVsId] = useState(defaultVs);

  const update = (since: string, vs: string) => {
    setSinceId(since);
    setVsId(vs);
    router.replace(`/workspaces/${workspace.id}/re-audit?since=${since}&vs=${vs}`, {
      scroll: false
    });
  };

  return (
    <>
      {/* Comparison Controls */}
      <div className="comparison-controls">
        <div className="scan-control">
          <label htmlFor="since-scan">Since scan:</label>
          <select
            id="since-scan"
            value={sinceId}
            onChange={(e) => update(e.target.value, vsId)}
          >
            {scans.map((scan) => (
              <option key={scan.id} value={scan.id}>
                {scan.completedAt} · {scan.type} · Score {scan.score} · C{scan.issues.critical}/H{scan.issues.high}/M{scan.issues.medium}/L{scan.issues.low}
              </option>
            ))}
          </select>
        </div>
        <div className="scan-control">
          <label htmlFor="vs-scan">vs scan:</label>
          <select
            id="vs-scan"
            value={vsId}
            onChange={(e) => update(sinceId, e.target.value)}
          >
            {scans.map((scan) => (
              <option key={scan.id} value={scan.id}>
                {scan.completedAt} · {scan.type} · Score {scan.score} · C{scan.issues.critical}/H{scan.issues.high}/M{scan.issues.medium}/L{scan.issues.low}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick pick chips */}
      <div className="quick-pick-row">
        <button
          type="button"
          className="chip"
          onClick={() => scans[0] && scans[1] && update(scans[0].id, scans[1].id)}
        >
          Last vs Previous
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => {
            if (scans.length < 2) return;
            const oldest = scans[scans.length - 1];
            if (oldest) update(scans[0].id, oldest.id);
          }}
        >
          vs Earliest
        </button>
      </div>

      {/* Comparison Module */}
      <ReAuditComparisonModule
        workspace={workspace}
        scans={scans}
        actions={actions}
        auditCategories={auditCategories}
        sinceScanId={sinceId}
        vsScanId={vsId}
      />
    </>
  );
}