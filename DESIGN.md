# RankFlow Design System

## Design Register

Product UI. Design serves recurring operational workflows for SEO teams.

## Visual Direction

RankFlow should feel like a mature international SaaS tool used daily by agency operators and SEO leaders. The UI should be restrained, precise, dense enough for real work, and visually calm under heavy data.

## Color Tokens

- Page background: `#F2F4F7`
- Main surface: `#FBFCFE`
- Subtle surface: `#EEF2F6`
- Border: `#D8DEE8`
- Primary text: `#152033`
- Secondary text: `#4A4E57`
- Muted text: `#727987`
- Primary blue: `#1A3D6B`
- Blue hover: `#163358`
- Lime accent: `#C8F55A`
- Success green: `#166534`
- Critical red: `#B91C1C`
- Warning orange: `#E65C00`
- Caution yellow: `#854D0E`

## Typography

- Use system UI fonts: `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`.
- Keep product headings compact. Avoid hero-scale typography inside dashboards.
- Labels and table text must stay legible at dense sizes.

## Layout

- Fixed top bar for global search, notifications, quick actions, and profile.
- Left sidebar for workspace selector and modules.
- Contextual action bar at the top of content pages.
- HOD Command Centre is the first meaningful screen.
- Use tables for operational comparison and repeated records.
- Use cards only for summary metrics, repeated compact items, and framed tools.

## Components

- Buttons: clear primary, secondary, ghost, disabled, loading, and focus states.
- Severity badges: critical, high, medium, low, resolved, at risk, delivering.
- Score deltas: explicit sign, color, and label.
- Tables: sortable-feeling headers, fixed density, clear hover states.
- Empty states: explain what data is missing and what action creates it.

## Motion

- Use subtle 150-200 ms state transitions only for hover, focus, panel reveal, and status feedback.
- Avoid decorative motion.

## Responsive Rules

- Desktop: persistent sidebar and dense MIS table.
- Tablet: sidebar can compress, tables may horizontally scroll.
- Mobile: sidebar collapses, summary cards stack, key workspace records become scan-friendly rows.
