import { notFound } from "next/navigation";
import { WorkspaceDetail } from "@/components/workspace-detail";
import { getWorkspace } from "@/lib/rankflow-api";

interface WorkspacePageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;
  try {
    const workspace = await getWorkspace(workspaceId);
    return <WorkspaceDetail workspace={workspace} />;
  } catch {
    notFound();
  }
}
