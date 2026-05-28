import { notFound } from "next/navigation";
import { LocalVisibilityModule } from "@/components/workspace-modules";
import { getWorkspace, getWorkspaceLocalVisibility } from "@/lib/rankflow-api";

interface LocalVisibilityPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function LocalVisibilityPage({ params }: LocalVisibilityPageProps) {
  const { workspaceId } = await params;

  try {
    const [workspace, localVisibility] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceLocalVisibility(workspaceId)
    ]);

    return <LocalVisibilityModule workspace={workspace} localVisibility={localVisibility} />;
  } catch {
    notFound();
  }
}
