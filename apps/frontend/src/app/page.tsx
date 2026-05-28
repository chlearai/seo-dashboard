import type { Metadata } from "next";
import { PublicHomepage } from "@/components/public-homepage";

export const metadata: Metadata = {
  title: "RankFlow | Organic growth OS",
  description: "Audit, analyse, act, report, and re-audit organic growth in one system."
};

export default function Home() {
  return <PublicHomepage />;
}
