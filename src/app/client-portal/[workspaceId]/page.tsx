import { notFound } from "next/navigation";
import { ClientPortal } from "@/components/client-portal";
import { getWorkspaceById, workspaces } from "@/lib/rankflow-data";

interface ClientPortalPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export function generateStaticParams() {
  return workspaces.map((workspace) => ({
    workspaceId: workspace.id
  }));
}

export default async function ClientPortalPage({ params }: ClientPortalPageProps) {
  const { workspaceId } = await params;
  const workspace = getWorkspaceById(workspaceId);

  if (!workspace) {
    notFound();
  }

  return <ClientPortal workspace={workspace} />;
}
