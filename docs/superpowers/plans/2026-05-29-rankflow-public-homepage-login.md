# RankFlow Public Homepage and Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the root HOD dashboard with a public marketing-first homepage and move the authenticated RankFlow shell to a dedicated app route.

**Architecture:** Split the Next.js app router into public and authenticated route groups. Keep the public homepage at `/`, keep the operational shell under `/dashboard`, and move workspace/client portal routes into the authenticated route group so the app chrome only appears where it belongs. Build the homepage from a focused component that reuses RankFlow's existing design tokens and product vocabulary.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript, shared RankFlow types/helpers, the existing CSS token system in `globals.css`, Playwright browser smoke tests.

---

### Task 1: Split public and authenticated routes

**Files:**
- Modify: `apps/frontend/src/app/layout.tsx`
- Create: `apps/frontend/src/app/(app)/layout.tsx`
- Create: `apps/frontend/src/app/(app)/dashboard/page.tsx`
- Create: `apps/frontend/src/app/(app)/workspaces/[workspaceId]/page.tsx`
- Create: `apps/frontend/src/app/(app)/client-portal/[workspaceId]/page.tsx`
- Delete: `apps/frontend/src/app/page.tsx`
- Delete: `apps/frontend/src/app/workspaces/[workspaceId]/page.tsx`
- Delete: `apps/frontend/src/app/client-portal/[workspaceId]/page.tsx`

- [ ] **Step 1: Make the root layout public-only**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RankFlow | SEO Intelligence Platform",
  description: "The Google Ads Manager for SEO teams."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Move the authenticated shell into the app route group**

```tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { getSession } from "@/lib/rankflow-api";

export const metadata: Metadata = {
  title: "RankFlow | SEO Intelligence Platform",
  description: "The Google Ads Manager for SEO teams."
};

export default async function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return <AppShell session={session}>{children}</AppShell>;
}
```

- [ ] **Step 3: Move the current HOD command centre to `/dashboard`**

```tsx
import { HodCommandCentre } from "@/components/hod-command-centre";
import { getHodCommandCentreData } from "@/lib/rankflow-api";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { summary, workspaces } = await getHodCommandCentreData();
  return <HodCommandCentre summary={summary} workspaces={workspaces} />;
}
```

- [ ] **Step 4: Move workspace and client portal routes under the app group without changing their URLs**

```tsx
import { notFound } from "next/navigation";
import { WorkspaceDetail } from "@/components/workspace-detail";
import { getWorkspace } from "@/lib/rankflow-api";

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

export const dynamic = "force-dynamic";

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;
  try {
    const workspace = await getWorkspace(workspaceId);
    return <WorkspaceDetail workspace={workspace} />;
  } catch {
    notFound();
  }
}
```

```tsx
import { notFound } from "next/navigation";
import { ClientPortal } from "@/components/client-portal";
import { getWorkspace } from "@/lib/rankflow-api";

interface ClientPortalPageProps {
  params: Promise<{ workspaceId: string }>;
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
```

- [ ] **Step 5: Verify `/` is no longer wrapped in the app shell while `/dashboard` still is**

---

### Task 2: Build the public homepage component

**Files:**
- Create: `apps/frontend/src/components/public-homepage.tsx`
- Modify: `apps/frontend/src/app/page.tsx`
- Modify: `apps/frontend/src/components/app-shell.tsx`
- Modify: `apps/frontend/src/components/workspace-detail.tsx`
- Modify: `apps/frontend/src/components/client-portal.tsx`
- Modify: `apps/frontend/src/app/not-found.tsx`

- [ ] **Step 1: Create the homepage component with a marketing hero and visible login form**

```tsx
import Link from "next/link";
import { ArrowRight, BrainCircuit, Globe2, LogIn, ScanSearch, ShieldCheck, Sparkles, Target } from "lucide-react";

export function PublicHomepage() {
  return (
    <main className="public-page">
      <header className="public-topbar">
        <Link className="public-brand" href="/">
          <span className="brand-mark">R</span>
          <span>
            <strong>RankFlow</strong>
            <span>Organic growth OS</span>
          </span>
        </Link>
        <div className="public-topbar-actions">
          <span className="public-proof-line">Audit, analyse, act, report, re-audit.</span>
          <Link className="button primary" href="/dashboard">
            Sign in
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </header>
      <section className="public-hero">
        <div className="public-hero-copy">
          <p className="eyebrow">International SEO operations</p>
          <h1>Operate organic growth like a system.</h1>
          <p>
            RankFlow helps teams audit, analyse, act, report, and re-audit across SEO, AEO, GEO,
            local visibility, authority, traffic, and leads.
          </p>
        </div>
        <aside className="public-login-panel">
          <p className="eyebrow">Workspace access</p>
          <h2>Sign in</h2>
          <form className="public-login-form" action="/dashboard" method="get">
            <label>
              Work email
              <input type="email" name="email" placeholder="name@agency.com" />
            </label>
            <label>
              Password
              <input type="password" name="password" placeholder="••••••••" />
            </label>
            <button className="button primary" type="submit">
              <LogIn size={16} aria-hidden="true" />
              Open dashboard
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Point the root page at the homepage component**

```tsx
import { PublicHomepage } from "@/components/public-homepage";

export default function Home() {
  return <PublicHomepage />;
}
```

- [ ] **Step 3: Point app-shell navigation and backlinks at `/dashboard` instead of `/`**

```tsx
{ id: "dashboard", label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard }
```

```tsx
<Link className="brand" href="/dashboard">
```

```tsx
<Link className="button" href="/dashboard">
  Back to HOD Command Centre
</Link>
```

```tsx
<Link className="button" href="/dashboard">
  Open Command Centre
</Link>
```

- [ ] **Step 4: Update the not-found page to return users to `/dashboard`**

```tsx
<p>Check the workspace slug or return to the HOD Command Centre.</p>
<Link className="button primary" href="/dashboard">
  Back to Command Centre
</Link>
```

- [ ] **Step 5: Make sure the homepage copy stays honest about the current login surface**

---

### Task 3: Add public homepage styles and responsive behavior

**Files:**
- Modify: `apps/frontend/src/app/globals.css`

- [ ] **Step 1: Add homepage layout tokens and bands**

```css
.public-page {
  display: grid;
  gap: 18px;
  min-height: 100vh;
  padding: 18px;
}

.public-topbar,
.public-hero,
.public-band {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  box-shadow: var(--shadow);
}
```

- [ ] **Step 2: Add hero, proof strip, and login panel rules**

```css
.public-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(340px, 420px);
  gap: 16px;
  padding: 18px;
}

.public-login-form {
  display: grid;
  gap: 10px;
}

.public-login-form label {
  display: grid;
  gap: 6px;
}
```

- [ ] **Step 3: Add compact evidence and module preview rows**

```css
.public-evidence-strip,
.public-module-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}
```

- [ ] **Step 4: Add mobile stacking rules so the hero and login remain readable**

```css
@media (max-width: 860px) {
  .public-hero,
  .public-evidence-strip,
  .public-module-strip {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Verify no overlap, clipping, or card-grid repetition appears on small screens**

---

### Task 4: Update browser smoke coverage for the new root and app routes

**Files:**
- Modify: `apps/frontend/tests/browser-smoke.spec.ts`

- [ ] **Step 1: Replace the root HOD smoke test with a public homepage check**

```ts
test("public homepage renders the marketing-first entry", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Operate organic growth like a system/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Open dashboard/i })).toBeVisible();
  await expect(page.getByText("Audit, analyse, act, report, re-audit.")).toBeVisible();
});
```

- [ ] **Step 2: Add a dashboard smoke test for the authenticated shell**

```ts
test("dashboard renders the authenticated command centre", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: /all clients, scans/i })).toBeVisible();
  await expect(page.getByText("hod access")).toBeVisible();
});
```

- [ ] **Step 3: Keep the workspace and client portal smoke checks intact**

```ts
await page.goto("/workspaces/aurora-education");
await expect(page.getByRole("heading", { name: "Aurora Education Group" })).toBeVisible();
```

- [ ] **Step 4: Run browser smoke tests and fix any route or selector regressions**

---

### Task 5: Final verification and commit

**Files:**
- No new code. Verify the changed route tree, CSS, and smoke tests.

- [ ] **Step 1: Run the targeted browser smoke test**

Run: `npm run test:e2e`
Expected: the new public homepage and `/dashboard` checks pass alongside the existing workspace routes.

- [ ] **Step 2: Run repository checks**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: all three pass with the new route split.

- [ ] **Step 3: Commit the implementation**

```bash
git add apps/frontend/src/app apps/frontend/src/components apps/frontend/src/app/globals.css apps/frontend/tests/browser-smoke.spec.ts docs/superpowers/plans/2026-05-29-rankflow-public-homepage-login.md
git commit -m "feat: add public RankFlow homepage"
```
