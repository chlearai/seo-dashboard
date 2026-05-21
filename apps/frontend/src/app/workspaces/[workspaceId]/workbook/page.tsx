import { notFound } from "next/navigation";
import { WorkbookModule } from "@/components/workspace-modules";
import { getWorkspace, getWorkspaceTasks } from "@/lib/rankflow-api";

interface WorkbookPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function WorkbookPage({ params }: WorkbookPageProps) {
  const { workspaceId } = await params;

  try {
    const [workspace, tasks] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceTasks(workspaceId)
    ]);

    return <WorkbookModule workspace={workspace} tasks={tasks} />;
  } catch {
    notFound();
  }
}
