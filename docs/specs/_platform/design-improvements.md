# Design improvements — UX and data visualization

## Status: planned (applies across slices 2-5)

Transversal spec. Documents the design improvements identified in the UX audit (2026-04-09) that must be implemented as part of the React frontend migration, NOT retrofitted into the legacy HTML templates. Each improvement references the slice where it should land.

## Context

An audit of the 4 existing HTML pages identified 12 design weaknesses: generic dark theme with no brand identity, flat information hierarchy, depressing empty states, monotone indigo palette, no data visualization for an analytics tool, broken light mode (now fixed), boring typography (now upgraded), no visual storytelling for health status, minimal navigation, and no micro-interactions. Three of these were addressed in the legacy HTML (light mode fix, typography, health-coded cards + progress rings + bar chart). The remaining improvements should be built as proper React components from the start.

## Audit reference

Source: `/frontend-design` audit session, 2026-04-09. Findings are grouped by priority.

## Already done in legacy HTML (carry forward as React components)

These exist in the `.html.ts` files and must be recreated as React components during migration:

- SVG progress rings for completion % on dashboard team cards (Slice 3)
- Horizontal bar chart for bottleneck median times (Slice 4)
- Health-coded left borders with inset glow on team cards (Slice 3)
- Skeleton loaders replacing spinners on all pages (Slice 2 — shared component)
- DM Sans + JetBrains Mono typography (Slice 2 — tokens.css)
- Light mode with proper contrast (Slice 2 — tokens.css)
- Empty state with SVG clock icon for idle teams (Slice 3)

## New improvements to build in React

### Slice 2 — Design system

#### Tab bar navigation
- Replace the current breadcrumb-only nav with a persistent tab bar below the navbar
- Tabs: Dashboard | Cycle Report | Health Trends | Settings
- Active tab is visually highlighted (bottom border accent + bold text)
- Tabs are links, not buttons — standard `<a>` with React Router `NavLink`
- Mobile: tabs scroll horizontally if needed

Rules:
- The `AppNavbar` component includes a `<nav>` tab bar section below the brand bar
- Active route is detected via React Router `useLocation`
- Tab labels come from the translation system
- The breadcrumb trail is removed — tabs replace it for page-level navigation
- The "Settings" link in nav-right is removed — Settings has its own tab

Scenarios:
- tab bar renders: {any page} -> 4 tabs visible below brand bar
- active tab highlighted: {user is on /dashboard} -> "Dashboard" tab has accent bottom border
- tab navigation: {user clicks "Cycle Report" tab} -> navigates to /cycle-report
- tab preserves query params: {user is on /cycle-report?teamId=xxx, clicks "Settings"} -> navigates to /settings?teamId=xxx (team context carried)

#### Color palette expansion
- Introduce a secondary accent color for positive signals, distinct from the indigo primary
- Replace mono-indigo gradient accents with a purposeful semantic palette

Rules:
- `--accent-1` remains indigo `#6366f1` (brand primary)
- Add `--accent-positive: #0d9488` (teal) for success trends, healthy states, positive evolution
- Add `--accent-alert: #f59e0b` (amber) for warnings, first deviations — replaces `--warning` in data contexts
- `--danger` remains `#ef4444` for critical/blocked
- Metric value gradients use context-appropriate colors, not always indigo->purple
- Positive evolution percentages use `--accent-positive`, negative use `--danger`
- Neutral/informational data keeps `--accent-1` (indigo)

Scenarios:
- positive metric: {velocity trend is "Up"} -> velocity value rendered in teal
- negative metric: {velocity trend is "Down"} -> velocity value rendered in red
- neutral metric: {throughput with no trend} -> value rendered in indigo gradient
- bottleneck bar normal: {status is not the bottleneck} -> bar uses indigo gradient
- bottleneck bar highlight: {status is the bottleneck} -> bar uses red gradient

### Slice 3 — Dashboard

#### Hero health score
- Add a workspace-level health summary at the top of the dashboard, before the team cards
- Shows an aggregate signal: how many teams are healthy / warning / danger / idle
- Renders as a compact row of colored dots or a segmented bar — not a big chart

Rules:
- The hero section sits between the sync status bar and the teams grid
- It counts teams by health status: healthy (completion >= 60%), warning (30-59%), danger (< 30% or blocked), idle (no cycle)
- Rendering: `N healthy · N warning · N danger · N idle` with colored dots
- If all teams are healthy, the row is green-tinted. If any team is danger, the row has a subtle red accent
- The hero section is NOT a new API call — it derives from the existing `/dashboard/data` response
- Clicking a health status filters the grid to show only matching teams

Scenarios:
- all healthy: {3 teams, all >= 60%} -> hero shows "3 healthy" with green tint
- mixed health: {1 healthy, 1 warning, 1 danger} -> hero shows "1 healthy · 1 warning · 1 danger"
- with idle teams: {2 active, 2 idle} -> hero shows "2 healthy · 2 idle"
- click filters: {user clicks "warning" in hero} -> grid shows only warning teams, other cards hidden
- click again clears filter: {user clicks "warning" again} -> filter cleared, all teams visible

#### Sparklines for velocity trend
- Add a mini line chart (sparkline) inside each team card showing velocity over the last 5 cycles
- Renders as a simple SVG polyline, no axes, no labels — just the trend shape

Rules:
- The sparkline appears below the velocity KPI row in the team card
- Data source: requires a new field `velocityHistory: number[]` in the dashboard DTO
- If fewer than 2 data points, the sparkline is not rendered
- The sparkline is 80px wide, 20px tall, stroke color matches the health status
- The last point has a small dot to indicate "current"
- This requires a backend change: `WorkspaceDashboardPresenter` must include velocity history

Scenarios:
- sparkline with 5 points: {team has 5 completed cycles with velocity [40, 55, 48, 62, 58]} -> SVG polyline with 5 points, dot on last
- sparkline with 2 points: {team has 2 completed cycles} -> minimal line rendered
- sparkline insufficient data: {team has 1 or 0 completed cycles} -> no sparkline rendered
- sparkline color matches health: {healthy team} -> green stroke, {warning team} -> amber stroke

#### Counter animations on load
- Metric numbers animate from 0 to their target value on first render
- Duration: 600ms with ease-out easing
- Applies to: completion ring percentage, velocity points, blocked issues count

Rules:
- Animation triggers once on mount, not on re-renders
- Uses `requestAnimationFrame` for smooth interpolation
- Integer values animate as integers (no decimals during animation)
- Percentage values animate the ring arc simultaneously with the counter text
- Animation is skipped if user has `prefers-reduced-motion: reduce`

Scenarios:
- completion animates: {team card mounts with 75% completion} -> number counts 0 -> 75 over 600ms, ring arc grows simultaneously
- velocity animates: {team card mounts with 61 pts} -> "0 pts" -> "61 pts" over 600ms
- reduced motion: {OS prefers-reduced-motion enabled} -> numbers appear instantly, no animation

### Slice 4 — Cycle report

#### Collapsible sections
- Each section (Metrics, Bottlenecks, Blocked Issues, Estimation, Report) can be collapsed/expanded
- Default: all expanded
- Collapse state persists in `sessionStorage` per section

Rules:
- Each section header is clickable with a chevron indicator (▸ collapsed, ▾ expanded)
- Transition: 200ms height animation with overflow hidden
- Empty sections (no data) are collapsed by default with a badge showing "No data"
- Collapse state keyed by section ID in `sessionStorage`

Scenarios:
- section default expanded: {page loads with data} -> all sections expanded, chevron pointing down
- click collapses: {user clicks "BOTTLENECKS" header} -> section content slides up, chevron rotates
- click expands: {user clicks collapsed header} -> section content slides down
- empty section collapsed: {no bottleneck data} -> section collapsed with "No data" badge
- state persists: {user collapses "Metrics", navigates away, comes back} -> "Metrics" still collapsed

### Slice 5 — Health trends

No additional design improvements beyond the migration. The current page design (legend with colored dots, signal table) is adequate. The tab bar navigation (Slice 2) and palette expansion handle the remaining needs.

## Out of scope

- Quick switcher (Cmd+K) — nice-to-have, not part of initial migration
- Sidebar navigation — tab bar is sufficient for 4 pages
- Custom cursor or grain overlays — over-designed for an internal tool
- Real-time updates via WebSocket — separate feature
- Storybook or design documentation site

## Dependencies

- Sparklines require a backend DTO change (`velocityHistory` field) — must be specced and implemented before the dashboard Slice 3
- All other improvements use existing data, no backend changes needed

## Glossary

| Term | Definition |
|------|------------|
| Sparkline | A small, inline chart with no axes or labels, showing trend direction only |
| Hero section | A summary bar at the top of a page providing at-a-glance status before detailed content |
| Counter animation | A number interpolation effect where a value counts up from 0 to its target on first render |
| Tab bar | A persistent horizontal navigation element showing all main routes as clickable tabs |
