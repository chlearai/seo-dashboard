import { notFound } from "next/navigation";
import { ScreamingFrogModule } from "@/components/workspace-modules";
import { getWorkspace, getWorkspaceScreamingFrog } from "@/lib/rankflow-api";

interface ScreamingFrogPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function ScreamingFrogPage({ params }: ScreamingFrogPageProps) {
  const { workspaceId } = await params;

  try {
    const [workspace, crawler] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceScreamingFrog(workspaceId)
    ]);

    return <ScreamingFrogModule workspace={workspace} crawler={crawler} />;
  } catch {
    notFound();
  }
}
