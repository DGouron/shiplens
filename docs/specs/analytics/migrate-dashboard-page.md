# Migrate dashboard page

## Status: implemented

Slice 3 of the frontend migration. Depends on Slice 1 (setup-react-spa) and Slice 2 (extract-design-system).

## Implementation

- **Bounded contexts**: `frontend/src/modules/analytics/` (dashboard view + presentation) + `frontend/src/modules/synchronization/` (sync gateway + orchestration)
- **Gateway**: `WorkspaceDashboardGateway` (port) + `WorkspaceDashboardInHttpGateway` (HTTP impl) reading `GET /dashboard/data`. Discriminated union response: data variant or empty variant (`{ status: 'not_connected' | 'no_teams', message }`).
- **Sync gateway**: `SyncGateway` (port) + `SyncInHttpGateway` (HTTP impl) wrapping `GET /sync/teams`, `POST /sync/selection`, `GET /sync/selection`, `POST /sync/reference-data`, `POST /sync/issue-data`.
- **Use cases**: `GetWorkspaceDashboardUsecase` + `DiscoverSyncTeamsUsecase` (throws `NoTeamsAvailableInWorkspace` `ApplicationRuleViolation` if empty) + `SelectAllSyncTargetsUsecase` + `SyncReferenceDataUsecase` + `SyncTeamIssuesUsecase` + `GetSyncSelectionUsecase`.
- **Presenter**: `DashboardPresenter` transforms the response into a `DashboardViewModel` (Zod-validated). Computes health tier (`healthy` >=60%, `warning` >=30%, `danger` <30% or any blocked alert), ring stroke color (CSS vars), ring dash offset, locale-formatted last-sync label.
- **Hooks**: `useDashboard` (TanStack Query `useQuery`, returns `AsyncState<DashboardViewModel, { status: 'empty', empty: { kind, message } }>`), `useSyncOrchestrator` (state machine `idle | running{step,attempt} | succeeded | failed`, exponential backoff 1s/2s/4s up to 3 attempts on auto-sync, no retry on manual resync), `useDashboardPage` (composition hook auto-triggering sync on `no_teams`).
- **View** (humble, Humble Object pattern): `DashboardView`, `TeamCardView`, `TeamCardIdleView`, `CompletionRingView`, `SyncStatusBarView`, `DashboardEmptyStateView`, `DashboardErrorStateView`, `DashboardLoadingStateView`.
- **Translations**: duplicated in `frontend/src/modules/analytics/interface-adapters/presenters/dashboard.translations.ts` (en/fr).
- **Route**: `/dashboard` mounted in `frontend/src/main.tsx`. `/` redirects to `/dashboard` via `<Navigate>`.
- **DI registry**: `frontend/src/main/dependencies.ts` exposes `usecases`, `overrideUsecases()`, `resetUsecases()`.
- **Test doubles**: `stub.workspace-dashboard.in-memory.gateway.ts`, `stub.empty-workspace-dashboard.in-memory.gateway.ts`, `failing.workspace-dashboard.in-memory.gateway.ts`, `stub.sync.in-memory.gateway.ts`, `failing.sync.in-memory.gateway.ts`, `failing-once.sync.in-memory.gateway.ts`.
- **Naming convention**: frontend uses `Response`/`*.response.ts` instead of `Dto` (frontend consumes responses, does not produce DTOs).

## Context

The dashboard is the Shiplens home page. It displays an overview of all workspace teams with their active cycle KPIs (completion rate, velocity trend, blocked issues), synchronization status, and quick access to cycle reports. The current implementation is an inline HTML template (`workspace-dashboard.html.ts`) with approximately 650 lines of mixed CSS, HTML, and JavaScript. The inline JS fetches `/dashboard/data`, manually builds DOM strings, and handles synchronization orchestration (team discovery, selection, reference data sync, issue sync with retry logic). The `WorkspaceDashboardPresenter` already produces a `WorkspaceDashboardDto` consumed by the inline JS.

## Rules

- The dashboard page is a React route at `/dashboard`
- The route is the default route: navigating to `/` redirects to `/dashboard`
- Data fetching uses a custom hook `useDashboardViewModel` that calls `GET /dashboard/data`
- The hook returns a discriminated union: `loading` | `loaded` | `empty` | `error`
- The `loaded` state contains `teams: TeamCardViewModel[]` and `synchronization: SyncStatusViewModel`
- The `empty` state contains `status: 'not_connected' | 'no_teams'` and `message: string`
- Team cards display: team name, cycle name, completion ring (SVG), velocity with trend label, blocked issues count, report link
- A team without an active cycle displays the team name and a "No active cycle" message with a clock icon
- Health-based card borders are preserved: green (completion >= 60%), orange (30-59%), red (< 30% or all blocked), dim (no cycle)
- The sync status bar displays last sync date (locale-formatted), late warning when applicable, and a "Resynchronize" button
- The synchronization orchestration (auto-sync on first visit with no teams, manual resync) is extracted into a `useSyncOrchestrator` hook
- Sync orchestration calls the existing endpoints in order: `GET /sync/teams` -> `POST /sync/selection` -> `POST /sync/reference-data` -> `POST /sync/issue-data` (per team)
- Retry logic is preserved: up to 3 attempts with exponential backoff
- Loading state displays skeleton cards (matching current skeleton layout)
- All user-facing text comes from the translation system (matching the existing `WorkspaceDashboardTranslationKeys`)
- The `WorkspaceDashboardController` keeps only the `GET /dashboard/data` endpoint; the `GET /dashboard` HTML endpoint is removed in Slice 6
- Every component and hook has Vitest tests

## Scenarios

- nominal dashboard: {3 teams with active cycles, synced data} -> 3 team cards with completion rings, velocity, blocked count + sync status bar
- team without active cycle: {1 team without cycle among 3} -> 2 full team cards + 1 idle card with clock icon and "No active cycle"
- healthy team card: {team with 75% completion, 0 blocked} -> green left border + green completion ring
- warning team card: {team with 45% completion} -> orange left border + orange completion ring
- danger team card: {team with 100% blocked issues} -> red left border + red blocked count
- report link present: {team with active cycle} -> "View report" link pointing to `/cycle-report?teamId=xxx`
- report link absent: {team with active cycle, no report} -> "No report available" text
- sync status normal: {last sync 2 hours ago} -> green dot + formatted date + "Resynchronize" button
- sync status late: {last sync 25 hours ago} -> red dot + late warning text + "Resynchronize" button
- never synced: {no sync history} -> "Never synced" text
- empty state not connected: {no workspace connected} -> empty state message guiding toward connection
- empty state no teams: {workspace connected, no teams synced} -> auto-sync starts immediately
- auto sync succeeds: {no teams synced, sync endpoints respond 200} -> page reloads with dashboard data
- auto sync fails with retry: {sync fails on first attempt} -> retries after exponential backoff + progress text updated
- auto sync exhausts retries: {3 consecutive failures} -> error message displayed + retry button enabled
- manual resync: {user clicks "Resynchronize"} -> sync orchestration runs + page reloads on success
- loading state: {data being fetched} -> skeleton cards displayed
- error state: {API returns 500} -> error message displayed
- locale french: {workspace language is FR} -> all labels in French
- locale english: {workspace language is EN} -> all labels in English

## Out of scope

- Modifying the `WorkspaceDashboardPresenter` or `GetWorkspaceDashboardUsecase`
- Changing the `/dashboard/data` API response shape
- Adding new KPIs or visual elements not present in the current dashboard
- Mobile-specific layout improvements beyond matching current behavior
- WebSocket or SSE for real-time sync status

## Glossary

| Term | Definition |
|------|------------|
| ViewModel hook | A custom React hook that fetches API data, manages loading/error states, and returns a view-ready data structure for the component |
| Sync orchestration | The multi-step process of discovering teams, selecting them, syncing reference data, and syncing issue data per team |
| Completion ring | An SVG circular progress indicator showing the cycle completion percentage |
| Discriminated union | A TypeScript type where each variant has a literal `status` field that narrows the type |
