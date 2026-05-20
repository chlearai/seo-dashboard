# RankFlow MVP Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable RankFlow SaaS MVP foundation with HOD Command Centre, workspace drill-down, client portal preview, typed data contracts, and initial tests.

**Architecture:** Use Next.js App Router with TypeScript. Keep product data in typed domain modules under `src/lib`, render it through focused server components and reusable UI components under `src/components`.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Vitest, Playwright, GStack browser QA.

---

## File Structure

- `package.json`: scripts and dependencies.
- `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`: app tooling.
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`: global app shell and HOD route.
- `src/app/workspaces/[workspaceId]/page.tsx`: workspace drill-down.
- `src/app/client-portal/[workspaceId]/page.tsx`: client-facing portal preview.
- `src/components/app-shell.tsx`: top nav and sidebar.
- `src/components/ui.tsx`: shared cards, badges, score pills, empty states.
- `src/components/hod-command-centre.tsx`: HOD summary, alerts, MIS table.
- `src/components/workspace-detail.tsx`: scan, audit, suggestions, and workbook panels.
- `src/components/client-portal.tsx`: read-only client progress view.
- `src/lib/rankflow-types.ts`: domain types.
- `src/lib/rankflow-data.ts`: seeded data plus selectors.
- `tests/rankflow-data.test.ts`: TDD coverage for scoring and HOD summaries.
- `tests/browser-smoke.spec.ts`: Playwright route smoke checks.

## Task 1: Tooling and TDD Domain Contract

- [x] Write failing Vitest tests for HOD summary, score health, severity totals, and workspace lookup in `tests/rankflow-data.test.ts`.
- [x] Add minimal package/tooling files so the tests can run.
- [x] Implement `src/lib/rankflow-types.ts` and `src/lib/rankflow-data.ts`.
- [x] Run `npm test` and confirm the tests pass.

## Task 2: App Shell and HOD Command Centre

- [x] Implement global layout, CSS tokens, app shell, UI primitives, and HOD Command Centre.
- [x] Render summary cards, alert rail, and all-client MIS table on `/`.
- [x] Run lint/typecheck/build and fix any failures.

## Task 3: Workspace and Client Portal Routes

- [x] Implement `/workspaces/[workspaceId]` drill-down route.
- [x] Implement `/client-portal/[workspaceId]` read-only preview.
- [x] Add not-found states for unknown workspaces.
- [x] Run tests and build.

## Task 4: Browser Verification

- [x] Start the local dev server.
- [x] Run Playwright smoke checks against `/`, `/workspaces/aurora-education`, and `/client-portal/aurora-education`.
- [x] Use GStack `browse` to inspect the homepage and capture browser evidence.
- [ ] Report exact verification results and any remaining blockers.
