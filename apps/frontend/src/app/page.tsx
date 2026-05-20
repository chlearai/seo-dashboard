import { HodCommandCentre } from "@/components/hod-command-centre";
import { getHodCommandCentreData } from "@/lib/rankflow-api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { summary, workspaces } = await getHodCommandCentreData();

  return <HodCommandCentre summary={summary} workspaces={workspaces} />;
}
