# CLAUDE.md

## Project Overview

**RankFlow** — AI-native SEO workflow automation platform with Postgres-backed live state.

- **Frontend**: React 18 + TypeScript + Vite (in `apps/frontend`)
- **Backend**: Node.js server with Hono (in `apps/backend`)
- **Testing**: Playwright for e2e tests
- **Architecture**: Monorepo with shared types in `packages/shared`
- **Live State**: Postgres repository (`postgres-rankflow-repository.ts`)
- **AI Workflow**: Approval-gate based AI agent workflow console

## Key Files

- `apps/frontend/src/app/page.tsx` — Main application
- `apps/frontend/src/components/workspace-modules.tsx` — Workspace modules UI
- `apps/backend/src/server.ts` — Backend server entry
- `apps/backend/src/repositories/postgres-rankflow-repository.ts` — Postgres state repository
- `packages/shared/src/rankflow-types.ts` — Shared TypeScript types
- `packages/shared/src/rankflow-helpers.ts` — Helper utilities
- `packages/shared/src/rankflow-ai-workflow-helpers.test.ts` — AI workflow tests

## Workflow Skills

Use these skills for proper discipline:

- `brainstorming` — Before creative work or feature changes
- `systematic-debugging` — For bugs and test failures
- `test-driven-development` — Before writing implementation code
- `verification-before-completion` — Before committing or claiming work done
- `subagent-driven-development` — For executing multi-step plans

## Conventions

1. Always use TDD for meaningful application logic
2. Check `docs/superpowers/plans/` for implementation plans before starting tasks
3. Keep working tree clean — commit incrementally with clear messages
4. Run lint and tests before claiming completion
5. Use approval gates for AI agent workflow actions

## Recent Commits

```
6034617 feat: add AI-native workflow console
92f9bf4 feat: add Postgres live state repository
498d1f6 fix: bind backend to railway host
18b518e fix: pin deploy runtime to node 24
dfd2275 chore: prepare RankFlow staging deploy
```