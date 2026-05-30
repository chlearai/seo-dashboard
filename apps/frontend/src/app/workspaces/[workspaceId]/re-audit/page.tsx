import { notFound } from "next/navigation";
import { ReAuditPageClient } from "@/components/reaudit-page-client";
import {
  getWorkspace,
  getWorkspaceScans,
  getWorkspaceTasks,
  getWorkspaceGrowthCycles
} from "@/lib/rankflow-api";

interface ReAuditPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
  searchParams: Promise<{
    since?: string;
    vs?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ReAuditPage({ params, searchParams }: ReAuditPageProps) {
  const { workspaceId } = await params;
  const { since: sinceScanId, vs: vsScanId } = await searchParams;

  try {
    const [workspace, scans, tasks, growthCycles] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceScans(workspaceId),
      getWorkspaceTasks(workspaceId),
      getWorkspaceGrowthCycles(workspaceId)
    ]);

    // Default: use the two scans anchoring the current active growth cycle
    const currentCycle = growthCycles.find((c) =>
      c.auditId === scans[0]?.id || c.latestSnapshotId === scans[0]?.id
    );

    const defaultSince = sinceScanId ?? currentCycle?.auditId ?? scans[0]?.id;
    const defaultVs = vsScanId ?? currentCycle?.baselineSnapshotId ?? scans[1]?.id;

    return (
      <ReAuditPageClient
        workspace={workspace}
        scans={scans}
        actions={tasks}
        auditCategories={workspace.auditCategories}
        defaultSince={defaultSince}
        defaultVs={defaultVs}
      />
    );
  } catch {
    notFound();
  }
}
