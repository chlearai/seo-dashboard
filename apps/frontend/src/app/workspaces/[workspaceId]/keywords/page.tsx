import { notFound } from "next/navigation";
import { KeywordsModule } from "@/components/workspace-modules";
import { getWorkspace, getWorkspaceKeywords } from "@/lib/rankflow-api";

interface KeywordsPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function KeywordsPage({ params }: KeywordsPageProps) {
  const { workspaceId } = await params;

  try {
    const [workspace, keywords] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceKeywords(workspaceId)
    ]);

    return <KeywordsModule workspace={workspace} keywords={keywords} />;
  } catch {
    notFound();
  }
}
