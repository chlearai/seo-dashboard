import type { Metadata } from "next";
import { HodCommandCentre } from "@/components/hod-command-centre";
import { getHodCommandCentreData } from "@/lib/rankflow-api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "RankFlow Dashboard | SEO Intelligence Platform",
  description: "HOD command centre for RankFlow workspaces."
};

export default async function DashboardPage() {
  const { summary, workspaces } = await getHodCommandCentreData();

  return <HodCommandCentre summary={summary} workspaces={workspaces} />;
}
