import { HodCommandCentre } from "@/components/hod-command-centre";
import { getHodSummary, workspaces } from "@/lib/rankflow-data";

export default function Home() {
  return <HodCommandCentre summary={getHodSummary(workspaces)} workspaces={workspaces} />;
}
