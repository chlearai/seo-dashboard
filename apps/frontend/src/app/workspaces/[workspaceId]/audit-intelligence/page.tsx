import { notFound } from "next/navigation";
import { AuditIntelligenceModule } from "@/components/workspace-modules";
import { getWorkspace, getWorkspaceAuditIntelligence } from "@/lib/rankflow-api";

interface AuditIntelligencePageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AuditIntelligencePage({ params }: AuditIntelligencePageProps) {
  const { workspaceId } = await params;

  try {
    const [workspace, stack] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceAuditIntelligence(workspaceId)
    ]);

    return <AuditIntelligenceModule workspace={workspace} stack={stack} />;
  } catch {
    notFound();
  }
}
