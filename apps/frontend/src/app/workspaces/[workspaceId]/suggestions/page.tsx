import { notFound } from "next/navigation";
import { AiSuggestionsModule } from "@/components/workspace-modules";
import { getWorkspace, getWorkspaceSuggestions } from "@/lib/rankflow-api";

interface SuggestionsPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function SuggestionsPage({ params }: SuggestionsPageProps) {
  const { workspaceId } = await params;

  try {
    const [workspace, suggestions] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceSuggestions(workspaceId)
    ]);

    return <AiSuggestionsModule workspace={workspace} suggestions={suggestions} />;
  } catch {
    notFound();
  }
}
