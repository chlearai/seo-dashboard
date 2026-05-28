import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">Workspace not found</p>
      <h1>The RankFlow workspace you requested is not available.</h1>
      <p>Check the workspace slug or return to the HOD Command Centre.</p>
      <Link className="button primary" href="/dashboard">
        Back to Command Centre
      </Link>
    </main>
  );
}
