# RankFlow Public Homepage and Login Design

## Approved Scope

Create a public-facing homepage for RankFlow that feels like an international SaaS product, not a generic landing page. The first screen should persuade visitors with concise product proof, then give them a prominent sign-in path into the product.

This slice covers the public homepage, the visible login entry, and the route/layout changes needed so the marketing screen is not forced through the authenticated app shell.

## Product Goal

RankFlow is already a dense operational product. The homepage should translate that into a cleaner entry point:

- Explain what RankFlow does in one sentence.
- Show the Audit, Analyse, Act, Report operating loop.
- Surface proof that the platform covers SEO, AEO, GEO, local visibility, authority, and reporting.
- Put sign-in at the center of the page.

## Architecture

The current root layout wraps every route in the authenticated `AppShell`, which is not suitable for a marketing-first homepage. The implementation should split the app router so public and authenticated surfaces can be designed separately.

Recommended structure:

- `app/(public)/page.tsx` for the homepage.
- `app/(app)/layout.tsx` for the authenticated shell.
- `app/(app)/page.tsx` for the HOD command centre.
- Existing workspace and client portal routes move under the app route group without changing their URLs.

This keeps the public homepage visually clean while preserving the current operational shell for the product.

## Page Structure

The homepage should have four visible bands:

1. **Top bar**
   - RankFlow wordmark
   - one short proof line
   - a clear sign-in button

2. **Hero**
   - Headline: continuous organic growth, not one-off SEO auditing
   - Subhead: RankFlow helps teams audit, analyse, act, report, then re-audit
   - Primary action: sign in
   - Secondary action: see product modules

3. **Evidence strip**
   - Audit
   - Analyse
   - Act
   - Report
   - Re-audit

4. **Product proof area**
   - compact module preview
   - short capability bullets
   - a credibility band for SEO, AEO, GEO, local visibility, and authority data

The page should feel like a product entry, not a marketing brochure.

## Login Entry

The sign-in control should be visually dominant and easy to reach from the hero and top bar.

Design intent:

- a compact login panel with email and password fields
- a primary sign-in action
- a secondary route for workspace access or demo entry if needed
- clear helper text for trust and access

Because the repository does not yet have a full auth provider, the UI must not pretend to do more than the app can actually support. The design should reserve a proper hook for future auth wiring while keeping the entry action useful in the current system.

## Visual Direction

Use the existing RankFlow product palette and typography:

- pale operational background
- white or near-white surfaces
- navy primary action
- lime only as a restrained accent
- explicit severity and proof language

The page should avoid:

- oversized generic SaaS hero treatment
- gradient text
- glassy cards as decoration
- oversized marketing illustrations that do not reflect the product

The creative content should come from the copy and the information hierarchy, not from visual noise.

## Content Direction

The copy should sound like an international SaaS product for serious SEO teams.

Headline direction:

- "Operate organic growth like a system"
- "Audit, analyse, act, report, then improve again"
- "One workspace for SEO, AEO, GEO, and local growth"

Support copy should emphasize:

- continuous improvement, not static audits
- evidence-backed recommendations
- action tracking and reporting
- visibility into traffic, rankings, leads, backlinks, and local presence

## Data Flow

The public page does not need live business metrics, but it should reuse the existing product vocabulary and module names so it feels connected to the actual system.

The page should be able to render from:

- a small static homepage content model
- existing product module labels
- existing design tokens
- a single sign-in destination

If the implementation adds demo or preview content, it must be clearly framed as preview content, not live workspace data.

## Error Handling

The public homepage should degrade cleanly:

- if sign-in is unavailable, show a clear fallback message and a secondary access path
- if the route split is incomplete, keep the page readable rather than collapsing into a broken shell
- if the public page is accessed on a small screen, the login panel must stack cleanly and remain usable

## Testing

Test the homepage as a real route, not just as a component.

Minimum checks:

- homepage loads without the authenticated app chrome
- hero text fits on desktop and mobile
- sign-in action is visible above the fold
- evidence strip remains readable on narrow screens
- no layout overlap between hero copy, login panel, and product proof
- root navigation still reaches the app shell for authenticated surfaces

Use browser verification after implementation to confirm the public page feels like a real product entry and not a generic template.

## Acceptance Criteria

- The root homepage is public and marketing-first.
- The homepage clearly communicates RankFlow's operating loop.
- Sign-in is the main action.
- The authenticated app shell remains intact for the dashboard and workspace routes.
- The page uses the existing RankFlow design system and does not look like a stock SaaS landing page.
- The implementation has route-level tests or browser verification that prove the public shell and the app shell are separated.
