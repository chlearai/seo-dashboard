import { notFound } from "next/navigation";
import { ReportsModule } from "@/components/workspace-modules";
import { getWorkspace, getWorkspaceReports } from "@/lib/rankflow-api";

interface ReportsPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ReportsPage({ params }: ReportsPageProps) {
  const { workspaceId } = await params;

  try {
    const [workspace, reports] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceReports(workspaceId)
    ]);

    return <ReportsModule workspace={workspace} reports={reports} />;
  } catch {
    notFound();
  }
}
