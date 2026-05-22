import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { getSession } from "@/lib/rankflow-api";

export const metadata: Metadata = {
  title: "RankFlow | SEO Intelligence Platform",
  description: "The Google Ads Manager for SEO teams."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body>
        <AppShell session={session}>{children}</AppShell>
      </body>
    </html>
  );
}
