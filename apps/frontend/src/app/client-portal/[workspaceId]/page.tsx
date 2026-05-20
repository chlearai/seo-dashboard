import { notFound } from "next/navigation";
import { ClientPortal } from "@/components/client-portal";
import { getWorkspace } from "@/lib/rankflow-api";

interface ClientPortalPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ClientPortalPage({ params }: ClientPortalPageProps) {
  const { workspaceId } = await params;
  try {
    const workspace = await getWorkspace(workspaceId);
    return <ClientPortal workspace={workspace} />;
  } catch {
    notFound();
  }
}
