import { notFound } from "next/navigation";
import { OwnCrawlerModule } from "@/components/workspace-modules";
import { getWorkspace, getWorkspaceOwnCrawler } from "@/lib/rankflow-api";

interface OwnCrawlerPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function OwnCrawlerPage({ params }: OwnCrawlerPageProps) {
  const { workspaceId } = await params;

  try {
    const [workspace, crawler] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceOwnCrawler(workspaceId)
    ]);

    return <OwnCrawlerModule workspace={workspace} crawler={crawler} />;
  } catch {
    notFound();
  }
}
