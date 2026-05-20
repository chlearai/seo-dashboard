# RankFlow SEO Dashboard

RankFlow is an SEO Intelligence SaaS platform with a separated frontend and backend architecture.

## Project Structure

```txt
apps/
  frontend/   Next.js product UI
  backend/    Node TypeScript API service
packages/
  shared/     Shared RankFlow domain types and helpers
```

## Local Development

Run both services together:

```bash
npm run dev
```

Service URLs:

- Frontend: `http://127.0.0.1:3000`
- Backend health: `http://127.0.0.1:4000/health`

Run services separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Backend API

- `GET /health`
- `GET /api/hod/summary`
- `GET /api/workspaces`
- `GET /api/workspaces/:id`

The frontend reads RankFlow data through backend APIs. Shared TypeScript contracts live in `packages/shared`.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```
