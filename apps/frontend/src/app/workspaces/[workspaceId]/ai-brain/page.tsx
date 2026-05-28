import { notFound } from "next/navigation";
import { AiBrainModule } from "@/components/workspace-modules";
import { getWorkspace, getWorkspaceAiBrain } from "@/lib/rankflow-api";

interface AiBrainPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AiBrainPage({ params }: AiBrainPageProps) {
  const { workspaceId } = await params;

  try {
    const [workspace, brain] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceAiBrain(workspaceId)
    ]);

    return <AiBrainModule workspace={workspace} brain={brain} />;
  } catch {
    notFound();
  }
}
