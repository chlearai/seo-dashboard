# SEO Dashboard Agent Instructions

## Development Workflow

- Use Superpowers skills as the primary development workflow for every non-trivial task.
- Use GStack alongside Superpowers whenever the task involves UI, browser behavior, screenshots, responsive checks, or manual flow verification.
- Do not treat Superpowers and GStack as alternatives: Superpowers controls the engineering workflow, and GStack provides browser evidence.
- Start feature work with `brainstorming` when shaping product or UX decisions.
- Use `writing-plans` for multi-step implementation plans.
- Use `test-driven-development` for meaningful application logic and regressions.
- Use `systematic-debugging` before fixing bugs or unexplained failures.
- Use `verification-before-completion` before claiming work is complete.

## Browser QA

- Use GStack for browser-driven checks, screenshots, responsive review, and manual flow verification.
- Use Playwright for repeatable automated browser tests.
- Prefer the direct commands now available on PATH:
  - `gstack browse <command>`
  - `browse <command>`
  - `npx playwright ...`

## Practical Split

- Superpowers: plan, architecture, implementation, debugging, review, shipping discipline.
- GStack: fast browser eyes, screenshots, click-through QA, visual evidence.
- Playwright: durable automated tests for core workflows.
