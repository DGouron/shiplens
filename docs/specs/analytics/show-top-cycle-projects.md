# Show top cycle projects

## Status: implemented

Depends on: `select-team-on-dashboard`. This spec also introduces the dashboard right-side column and the shared card / drawer shells reused by `show-top-cycle-epics`, `show-top-cycle-assignees`, and `detect-cycle-themes-with-ai` (walking skeleton).

## Implementation

### Bounded Context
Analytics (fullstack — touches `synchronization` BC too for the schema change)

### Artifacts — Backend
- **Migration**: `20260417210416_add_issue_project_external_id` — `Issue.projectExternalId String?`
- **Sync BC touch**: `IssueData` schema + GraphQL `project { id }` + Prisma upsert (cross-BC contract change — Issue now carries `projectExternalId`)
- **Schema constants**: `NO_PROJECT_BUCKET_ID = "__no_project__"` + `NO_PROJECT_BUCKET_NAME = "No project"` (sentinel for unset-project bucket)
- **Gateway port**: `TopCycleProjectsDataGateway` — 3 methods (`getActiveCycleLocator`, `getCycleProjectAggregates`, `getCycleIssuesForProject`)
- **Gateway impl**: `TopCycleProjectsDataInPrismaGateway` — SQL aggregation over `Cycle.issueExternalIds` with StateTransition join for cycle time + Project join for names
- **Use cases**: `GetTopCycleProjectsUsecase` (uses `ResolveWorkflowConfigUsecase` for started/completed statuses), `GetCycleIssuesForProjectUsecase`
- **Presenters**: `TopCycleProjectsPresenter` (top 10 truncation, sort by issueCount desc, sentinel mapping), `CycleProjectIssuesPresenter` (issue DTO without linearUrl — frontend builds it)
- **Controller**: `TopCycleProjectsController` — 2 routes

### Endpoints
| Method | Route | Usecase |
|--------|-------|---------|
| GET | `/api/analytics/top-cycle-projects/:teamId` | GetTopCycleProjectsUsecase |
| GET | `/api/analytics/top-cycle-projects/:teamId/projects/:projectId/issues` | GetCycleIssuesForProjectUsecase |

### Artifacts — Frontend
- **Entities**: `top-cycle-projects/` (Zod response schema + port + sentinel constant)
- **Gateway impl**: `TopCycleProjectsInHttpGateway` + response guard
- **Stubs**: good-path `StubTopCycleProjectsGateway`, bad-path `FailingTopCycleProjectsGateway`
- **Use cases**: `GetTopCycleProjectsUsecase`, `ListCycleProjectIssuesUsecase`
- **Presenters**: `TopCycleProjectsPresenter` (constructor takes `translations`, `activeMetric`, `isExpanded` — slice 5 or 10), `CycleProjectIssuesDrawerPresenter` (URL = `https://linear.app/issue/${externalId}`)
- **Translations**: `topCycleProjectsTranslations` (EN + FR) — includes `showMoreLabel` / `showLessLabel` for the expand affordance
- **Hook**: `useTopCycleProjects` — ranking query + drawer query + `activeMetric` state + `selectedProjectId` state + `isExpanded` state; resets all on teamId change
- **Shared hook**: `use-dismissable-overlay` in `shared/foundation/hooks/` (Escape + click-outside), reusable by 3 upcoming widgets
- **Shared shell views** (reusable by `show-top-cycle-epics`, `show-top-cycle-assignees`, `detect-cycle-themes-with-ai`):
  - `cycle-insight-card.view.tsx`, `cycle-insight-metric-toggle.view.tsx`, `cycle-insight-ranking-row.view.tsx`, `cycle-insight-empty-state.view.tsx`
  - `cycle-insight-drawer.view.tsx` + `cycle-insight-drawer-issue-row.view.tsx`
- **Widget views**: `top-cycle-projects-section.view.tsx` (hook caller), `top-cycle-projects-ready.view.tsx` (rows + expand button), `top-cycle-projects-drawer.view.tsx`, loading + error states
- **Dashboard integration**: right-side column added to `dashboard.view.tsx` via CSS grid (`.dashboard-layout`)
- **Route**: no new route — widget sits in `/dashboard`

### Architectural Decisions
- **Pragmatic cross-BC touch**: `workspaceId` on dashboard response (already shipped by `select-team-on-dashboard`) + `projectExternalId` on `Issue` (this feature) — both are Customer-Supplier from Identity/Synchronization to Analytics. Customer-Supplier wins over Anticorruption Layer for velocity; revisit if coupling grows.
- **No entity class for ranking** — plain Zod schemas + gateway + usecase + presenter (same pattern as `cycle-report-page`). Ranking has no invariants worth an aggregate.
- **Backend returns all 3 metrics per row** (count, points, time); client re-sorts on metric toggle. Avoids round-trip per toggle; payload stays small (≤10 rows).
- **Top 5 visible by default + "Show more" to 10** — user UX decision after dogfooding. Backend truncates to 10, presenter slices to 5 when collapsed. Keeps the right-column balanced across 4 future widgets while letting small projects surface on demand.
- **"No project" bucket participates in the ranking** — spec-mandated. Backend uses `NO_PROJECT_BUCKET_ID = "__no_project__"` sentinel; URL path-segment for drill-down endpoint.
- **Drawer state is pure overlay (no URL param)** — ephemeral per spec. `useState<string | null>` in the widget hook.
- **Drawer a11y**: Escape + click-outside via `use-dismissable-overlay` shared hook (listeners attached only when `isOpen === true`). Opaque panel (`--bg-elevated` + `backdrop-filter: blur saturate`) over 0.55 opacity overlay for legibility.
- **Fire-and-forget is not used here** (unlike `select-team-on-dashboard` persistence) — all queries are user-observable loads.
- **Linear URL construction in frontend** — backend returns `externalId` only, frontend presenter builds `https://linear.app/issue/${externalId}`. Keeps backend agnostic to Linear URL scheme.
- **Card = `role="button"` avoided here** — rows use native `<button>` + onClick (one interactive element per row, no wrapped link).

## Context

Once a team is selected on the dashboard, the user wants to know "what did my team work on during the active cycle?" The first answer is a ranked list of projects touched in the cycle. The dashboard's right-side column hosts this widget and, in subsequent specs, three more widgets. Each widget shows the top 5 entries with a toggle switching the ranking metric between count, points, and time.

## Rules

- The dashboard has a right-side column positioned next to the team cards
- The column hosts a card titled "Top 5 cycle projects" showing the 5 projects most worked on during the selected team's active cycle
- "The cycle" always refers to the active cycle of the currently selected team
- The card has a metric toggle with three values: count (default), points, time
- Each row shows the project name and the metric value for that project
- Rows are sorted descending by the active metric
- Project attribution uses the issue's direct `project` field — sub-issues without their own project are NOT inherited from the parent
- Issues whose `project` is unset are aggregated into a virtual "No project" bucket that participates in the ranking like any other project
- When the cycle has more than 5 projects, a "Show more" affordance reveals rows 6 through 10 inline; the label flips to "Show less" once expanded. The card never shows more than 10 projects.
- When the cycle has fewer than 5 projects with activity, only available rows are shown (no padding) and the "Show more" affordance is hidden
- When the selected team has no active cycle, the card displays "No active cycle for this team."
- When the active cycle has zero issues, the card displays "No activity in the current cycle."
- Clicking a row opens a drill-down drawer sliding from the right at 60% viewport width, overlaying the dashboard
- The drawer lists the issues of the clicked project active in the cycle with: title, assignee, points, current status, link to Linear
- The drawer closes on click-outside, Escape key, or an explicit close button
- Metric toggle state and drawer open/close state are ephemeral (not persisted across page reloads)
- All text is translated via the workspace language

## Scenarios

- nominal ranking by count: {cycle has 12 issues across projects A(5), B(3), C(2), D(1), E(1)} → A, B, C, D, E displayed with counts 5, 3, 2, 1, 1
- fewer than 5 projects: {cycle has 8 issues across projects A(5) and B(3)} → only A and B rendered, no padding
- "No project" bucket: {cycle has 10 issues, 7 in project A, 3 with project unset} → A (7), No project (3)
- sub-issue without project: {parent issue in project A, sub-issue with project unset} → sub-issue counted in "No project", not A
- sort by points: {user switches metric to points; A has count 5 / 8 points, B has count 3 / 15 points} → B (15), A (8)
- sort by time: {user switches metric to time} → rows reorder by summed cycle time
- click row opens drawer: {user clicks the A row} → drawer opens listing A's cycle issues with title, assignee, points, status, Linear link
- drawer close on click-outside: {drawer open, user clicks outside} → drawer closes, metric toggle retains its value
- drawer close on escape: {drawer open, user presses Escape} → drawer closes
- no active cycle: {selected team has no active cycle} → card shows "No active cycle for this team."
- empty cycle: {active cycle has zero issues} → card shows "No activity in the current cycle."
- team switch reloads: {user selects another team} → card reloads with new team's active cycle data
- language switch: {workspace language changes} → card title, metric labels, empty-state messages re-rendered

## Out of scope

- Filtering projects by label, assignee, or status
- Multi-cycle comparison (previous cycle trend)
- Persisting metric toggle state across sessions
- Editing issues from the drawer
- Pagination in the drawer (all project issues listed at once)
- Sorting options inside the drawer
- Exporting the ranking
- Historical cycle view (only active cycle supported)

## Glossary

| Term | Definition |
|------|------------|
| Right-side column | Dashboard area to the right of the team cards hosting per-team insight widgets |
| Top cycle projects | Ranking of projects by chosen metric over the selected team's active cycle |
| Metric toggle | Control allowing the user to switch the ranking metric between count, points, and time |
| No project bucket | Virtual aggregate for issues whose `project` field is unset, participating in the ranking like a named project |
| Drill-down drawer | Side panel sliding from the right at 60% viewport width showing the issues behind a clicked ranking row |
