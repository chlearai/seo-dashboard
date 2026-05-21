import { notFound } from "next/navigation";
import { OnPageAuditModule } from "@/components/workspace-modules";
import { getWorkspace, getWorkspaceAuditCategories } from "@/lib/rankflow-api";

interface OnPageAuditPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function OnPageAuditPage({ params }: OnPageAuditPageProps) {
  const { workspaceId } = await params;

  try {
    const [workspace, auditCategories] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceAuditCategories(workspaceId)
    ]);

    return <OnPageAuditModule workspace={workspace} auditCategories={auditCategories} />;
  } catch {
    notFound();
  }
}
