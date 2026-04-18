# Show top cycle assignees

## Status: implemented

Depends on: `select-team-on-dashboard`, `show-top-cycle-projects` (reuses the right-side column and the shared card / drill-down drawer shells).

## Implementation

### Bounded Context
Analytics (fullstack — backend + frontend).

### Artifacts — Backend
- **Schema**: `top-cycle-assignees.schema.ts` — Zod shapes for active cycle locator, assignee aggregate, issue detail, drawer result. No entity class (mirrors `top-cycle-projects` — no domain invariants worth an aggregate).
- **Gateway port**: `TopCycleAssigneesDataGateway` (abstract class) — 3 methods: `getActiveCycleLocator`, `getCycleAssigneeAggregates`, `getCycleIssuesForAssignee`.
- **Gateway impl**: `TopCycleAssigneesDataInPrismaGateway` — Prisma query over `Cycle.issueExternalIds`, JS-side filter on `completedStatuses` and non-null `assigneeName`, group via `for...of` + `Map`, cycle-time computation from `StateTransition` rows.
- **Use cases**:
  - `GetTopCycleAssigneesUsecase` — resolves active cycle + workflow config (via `ResolveWorkflowConfigUsecase`), returns ranking aggregates.
  - `GetCycleIssuesForAssigneeUsecase` — returns the assignee's completed cycle issues for the drawer.
- **Presenters**:
  - `TopCycleAssigneesPresenter` — sort desc by `issueCount`, tie-break by `assigneeName.localeCompare`, slice to `MAX_ASSIGNEES_IN_TOP = 5`.
  - `CycleAssigneeIssuesPresenter` — drawer DTO (no per-row `assigneeName` since fixed per drawer). Issue rows carry `totalCycleTimeInHours` per spec rule.
- **Controller**: `TopCycleAssigneesController` — 2 routes, zero business logic.
- **Test doubles**: `stub.top-cycle-assignees-data.gateway.ts` (good-path with helper setters + last-statuses capture) + `failing.top-cycle-assignees-data.gateway.ts` (always throws `GatewayError`).

### Endpoints
| Method | Route | Usecase |
|--------|-------|---------|
| GET | `/api/analytics/top-cycle-assignees/:teamId` | `GetTopCycleAssigneesUsecase` |
| GET | `/api/analytics/top-cycle-assignees/:teamId/assignees/:assigneeName/issues` | `GetCycleIssuesForAssigneeUsecase` |

### Architectural Decisions
- **Ranking key = `assigneeName` (denormalized)** — `Issue` carries only `assigneeName: String?`, no `assigneeExternalId`. KISS over a migration. Accepted limitation: two members with identical display names merge in the ranking.
- **`:assigneeName` URL path param (URL-encoded)** — NestJS auto-decodes. No sentinel bucket — unassigned issues are filtered out at the Prisma gateway (spec rule: no "Unassigned" bucket).
- **Top 5 cap (`MAX_ASSIGNEES_IN_TOP = 5`)** — diverges from `top-cycle-projects` (which caps at 10 with show-more affordance). Spec explicitly excludes a show-more affordance for assignees.
- **Backend returns all 3 metrics per row** (count, points, time) — frontend re-sorts on metric toggle, no round-trip per toggle. Consistent with projects pattern.
- **Cycle-time helper duplicated inline** — 15 lines, KISS over premature extraction to a shared module.
- **Both aggregate and drawer methods take `startedStatuses` + `completedStatuses`** — cycle-time computation needs the started→completed pair, even though aggregate gating only uses `completedStatuses`.
- **No Prisma migration** — uses existing `Issue.assigneeName` synced field.

### Artifacts — Frontend
- **Entity**: `top-cycle-assignees.response.schema.ts` + `top-cycle-assignees.response.ts` — Zod discriminated unions for ranking + drawer responses. Abstract gateway port `TopCycleAssigneesGateway` with 2 methods.
- **Gateway impl**: `TopCycleAssigneesInHttpGateway` — `encodeURIComponent(teamId)` + `encodeURIComponent(assigneeName)` for URL path params. Throws `GatewayError` on non-OK response and on guard parse failure.
- **Use cases**: `GetTopCycleAssigneesUsecase`, `ListCycleAssigneeIssuesUsecase`.
- **Presenters**:
  - `TopCycleAssigneesPresenter` — constructor `(translations, activeMetric)`. Sort desc by active metric, tie-break by `assigneeName.localeCompare`. Backend caps at 5 — defensive `.slice(0, 5)` applied. No `showExpandButton`.
  - `CycleAssigneeIssuesDrawerPresenter` — constructor `(translations)`. Input discriminated union `{ kind: 'closed' | 'loading' | 'error' | 'ready' }`. Issue row carries `cycleTimeLabel` (formatted via `formatDurationHours`) and no `assigneeLabel` (drawer is fixed per assignee). `linearUrl = https://linear.app/issue/${externalId}`.
- **Translations**: `top-cycle-assignees.translations.ts` — EN + FR. ASCII style (matches project convention, e.g. "Top 5 assignes du cycle" without accent pending i18n pass).
- **Hook**: `useTopCycleAssignees` — params `{ teamId }`. State: `activeMetric` (default `'count'`), `selectedAssigneeName`. NO `isExpanded`. Reset both on `teamId` change. Two `useQuery`s (ranking + drawer).
- **Views (humble)** under `views/top-cycle-assignees/`: section, ready, loading, error, drawer. Five files, one component per file, zero hooks in views, zero comparisons on domain data in JSX.
- **Stubs**: good-path `stub.top-cycle-assignees.in-memory.gateway.ts` with counters and clone-on-return; bad-path `failing.top-cycle-assignees.in-memory.gateway.ts` throws `GatewayError`.
- **Registry**: `frontend/src/main/dependencies.ts` wires the gateway and the two use cases (both in `usecases` export and in `resetUsecases()`).
- **Dashboard integration**: `<TopCycleAssigneesSectionView teamId={selectedTeamId} />` mounted directly below `<TopCycleProjectsSectionView />` in the aside column (no epics widget exists yet).

### Shared shell extension (backward-compatible)
`cycle-insight-drawer-issue-row.view.tsx` extended with OPTIONAL `cycleTimeLabel?` and made `assigneeLabel?` OPTIONAL. Projects drawer keeps passing `assigneeLabel` and omits `cycleTimeLabel`; assignees drawer passes `cycleTimeLabel` and omits `assigneeLabel`. Visibility resolved via semantic booleans computed in the component body — no domain comparisons in JSX.

### Frontend Architectural Decisions
- **No entity class** — plain Zod schemas + gateway + usecase + presenter (same pattern as projects).
- **Top 5 cap enforced by backend** — frontend applies defensive `.slice(0, 5)` in the presenter; no show-more affordance in views.
- **Metric toggle re-sorts client-side** — backend returns all 3 metrics per row, presenter re-sorts on `activeMetric` change. Zero round-trip per toggle.
- **Drawer state = pure overlay (no URL param)** — ephemeral `useState<string | null>` in the widget hook.
- **Drawer a11y** — Escape + click-outside via shared `use-dismissable-overlay`, listeners attached only when drawer is open.
- **Linear URL built frontend-side** — backend returns `externalId`, presenter constructs `https://linear.app/issue/${externalId}` (same convention as projects).
- **URL encoding for `:assigneeName`** — gateway applies `encodeURIComponent` on teamId and assigneeName; spec scenario covers a name with a space.

## Context

Below the epic widget, a third card ranks the assignees who delivered the most in the selected team's active cycle. It is a per-cycle snapshot — intentionally distinct from the cross-cycle trends available on the member-health page. It answers "who delivered the most in the current cycle?" for quick retro and stand-up visibility.

## Rules

- A card titled "Top cycle assignees" is displayed in the dashboard right-side column directly below "Top cycle epics"
- Only assignees with at least one completed issue in the selected team's active cycle appear in the ranking
- "Completed" uses the team's workflow configuration (`completedStatuses` from the `auto-detect-team-workflow-statuses` feature)
- Each row shows the assignee display name and the metric value for that cycle
- Metric toggle values: count (completed issues), points (sum of their story points), time (sum of their cycle time)
- Rows are sorted descending by the active metric
- Unassigned issues are NOT included in the ranking — this widget does not surface an "Unassigned" bucket
- When fewer than 5 assignees have completed issues, only available rows are shown
- When no active cycle exists, the card shows "No active cycle for this team."
- When no assignee completed issues in the cycle, the card shows "No completed work this cycle."
- Clicking a row opens the shared drill-down drawer listing the issues completed by that assignee in the cycle with title, points, cycle time, status, Linear link
- The drawer closes on click-outside, Escape, or an explicit close button
- All text is translated via the workspace language

## Scenarios

- rank by count: {Alice completed 5 issues, Bob 3, Charlie 2 in the cycle} → Alice (5), Bob (3), Charlie (2)
- rank by points: {Alice 5 issues totaling 15 points, Bob 3 issues totaling 24 points} → Bob (24), Alice (15)
- rank by time: {user toggles to time} → rows reorder by summed cycle time
- unassigned excluded: {cycle has 3 unassigned completed issues} → those issues do not appear in the ranking
- zero completions: {Diana is assigned issues but completed none} → Diana is not listed
- completed uses workflow config: {team completedStatuses=["Shipped"], Alice moved 4 issues to "Shipped"} → Alice's count is 4
- click row opens drawer: {user clicks Alice's row} → drawer lists her 5 completed cycle issues
- fewer than 5 assignees: {only 2 assignees completed issues} → only 2 rows rendered
- no active cycle: {team has no active cycle} → card shows "No active cycle for this team."
- empty completion: {active cycle has zero completed issues} → card shows "No completed work this cycle."
- team switch reloads: {user selects another team} → card reloads for the new team's active cycle
- language switch: {workspace language changes} → labels re-rendered

## Out of scope

- Trends across cycles (covered by the member-health page)
- Assignee contribution on in-progress or blocked work (only completed work here)
- Filtering by project, label, or priority
- An "Unassigned" bucket
- Per-assignee workflow configuration (uses the team-level workflow config)

## Glossary

| Term | Definition |
|------|------------|
| Cycle assignee ranking | Per-cycle snapshot of assignees ordered by a delivery metric — independent from cross-cycle member-health trends |
