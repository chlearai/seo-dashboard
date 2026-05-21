import { notFound } from "next/navigation";
import { ScanHistoryModule } from "@/components/workspace-modules";
import { getWorkspace, getWorkspaceScans } from "@/lib/rankflow-api";

interface ScanHistoryPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ScanHistoryPage({ params }: ScanHistoryPageProps) {
  const { workspaceId } = await params;

  try {
    const [workspace, scans] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceScans(workspaceId)
    ]);

    return <ScanHistoryModule workspace={workspace} scans={scans} />;
  } catch {
    notFound();
  }
}
