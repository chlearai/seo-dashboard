import { notFound } from "next/navigation";
import { WorkspaceDetail } from "@/components/workspace-detail";
import { getWorkspaceById, workspaces } from "@/lib/rankflow-data";

interface WorkspacePageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export function generateStaticParams() {
  return workspaces.map((workspace) => ({
    workspaceId: workspace.id
  }));
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;
  const workspace = getWorkspaceById(workspaceId);

  if (!workspace) {
    notFound();
  }

  return <WorkspaceDetail workspace={workspace} />;
}
