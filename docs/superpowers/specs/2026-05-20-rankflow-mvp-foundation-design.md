# RankFlow MVP Foundation Design

## Approved Scope

Build the first working RankFlow SaaS foundation from the PRD. This phase creates a production-grade app shell and operational dashboard surfaces, backed by typed mock data that can later connect to real backend services.

## Product Slice

The first build focuses on the HOD and agency-operations workflow:

- HOD Command Centre as the default screen.
- Client/workspace MIS table.
- Scan history and score movement.
- On-page audit category summary.
- AI suggestion inbox.
- SEO workbook task board.
- Client portal preview.

This deliberately excludes the real crawler, live OAuth integrations, billing, AI API calls, and PDF generation. Those should come after the app contracts and workflows are stable.

## Architecture

Use a Next.js TypeScript app with a typed domain layer. UI components consume view models from `src/lib/rankflow-data.ts`, keeping mock data behind the same shape that a future Supabase/API layer can serve.

Core files:

- `src/lib/rankflow-types.ts`: domain types for workspaces, scans, suggestions, tasks, scores, and roles.
- `src/lib/rankflow-data.ts`: seeded MVP data and view-model selectors.
- `src/app/page.tsx`: HOD Command Centre.
- `src/app/workspaces/[workspaceId]/page.tsx`: workspace drill-down.
- `src/app/client-portal/[workspaceId]/page.tsx`: client-facing preview.
- `src/components/*`: app shell, metric cards, tables, badges, and workflow panels.

## UX Design

The first viewport must be the usable product, not a marketing page. Use a fixed top bar, workspace-aware sidebar, contextual action bar, summary strip, risk panel, and client MIS table.

Visual style follows `DESIGN.md`: off-white background, blue operational chrome, neutral data surfaces, lime only for accent/positive state, explicit red/orange/yellow/green severity language.

## Data Flow

Seeded data models represent:

- Multiple client workspaces.
- Composite and category SEO scores.
- Scan history with status, scan type, issue counts, and deltas.
- AI suggestions with source checks and acceptance state.
- Workbook tasks with assignees, due dates, priorities, and evidence.

Selectors compute HOD totals, accounts improved, accounts at risk, open critical issues, due tasks, report counts, and per-workspace drill-down summaries.

## Error Handling

Unknown workspace IDs render a clear not-found state. Empty lists render operational empty states with the next action. Score and severity helpers clamp invalid input to predictable display ranges.

## Testing

Use Vitest for domain logic:

- Score health classification.
- Severity counts.
- HOD summary metrics.
- Workspace lookup and not-found behavior.

Use Playwright once the app runs for basic route smoke checks. Use GStack for visual browser inspection and screenshot/responsive evidence.

## Acceptance Criteria

- The project has a runnable Next.js app.
- The default route shows the HOD Command Centre with real-looking RankFlow data.
- Workspace and client portal routes render from typed seeded data.
- Domain logic has tests that pass.
- Build and lint/typecheck pass, or any blocker is reported with exact output.
- Browser verification is run with GStack and Playwright when the dev server is available.
