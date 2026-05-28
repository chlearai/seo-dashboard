import { notFound } from "next/navigation";
import { OrganicGrowthCycleModule } from "@/components/workspace-modules";
import {
  getWorkspace,
  getWorkspaceActionItems,
  getWorkspaceExpertEfficiency,
  getWorkspaceGrowthCycles,
  getWorkspaceOrganicMetrics
} from "@/lib/rankflow-api";

interface GrowthCyclePageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function GrowthCyclePage({ params }: GrowthCyclePageProps) {
  const { workspaceId } = await params;

  try {
    const [workspace, cycles, metrics, actions, experts] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceGrowthCycles(workspaceId),
      getWorkspaceOrganicMetrics(workspaceId),
      getWorkspaceActionItems(workspaceId),
      getWorkspaceExpertEfficiency(workspaceId)
    ]);

    return (
      <OrganicGrowthCycleModule
        workspace={workspace}
        cycles={cycles}
        metrics={metrics}
        actions={actions}
        experts={experts}
      />
    );
  } catch {
    notFound();
  }
}
