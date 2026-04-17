# Select team on dashboard

## Status: implemented

## Implementation

### Bounded Context
Analytics

### Artifacts
- **Gateway port**: `TeamSelectionStorageGateway` — abstract class with `read(workspaceId)` / `write(workspaceId, teamId)`
- **Gateway impl**: `TeamSelectionInLocalStorageGateway` — `window.localStorage` wrapper, keyed by `shiplens.selectedTeamId:${workspaceId}`, throws `GatewayError` on I/O failure
- **Use cases**: `GetPersistedTeamSelectionUsecase`, `PersistTeamSelectionUsecase`
- **Presenter**: `DashboardPresenter.present(data, { persistedTeamId })` extended with `resolveSelectedTeamId` (alphabetical default / restore / stale fallback) and per-card `isSelected`
- **ViewModel additions**: `selectedTeamId`, `showEmptyTeamsMessage`, `emptyTeamsMessage` at root; `isSelected` per team card
- **Hook**: `useDashboard` maintains click-override state and exposes `onSelectTeam(teamId)`; `useDashboardPage` forwards the callback
- **Views**: `TeamCardView` + `TeamCardIdleView` moved to `views/team-card/` and extended with `isSelected` + `onSelect`; new `TeamSelectionCheckmarkView`; new `DashboardEmptyTeamsView` for the zero-teams branch
- **Translations**: `emptyTeamsMessage` key added (EN + FR)
- **Backend touch**: `WorkspaceDashboardPresenter` now forwards `workspaceId` from the Linear connection via `GetWorkspaceDashboardUsecase` (the dashboard DTO now exposes `workspaceId` so the frontend can scope the localStorage key per workspace)

### Architectural Decisions
- **Storage abstracted as a gateway** — `localStorage` is an I/O boundary; the port enables testable hooks (stub + failing stub) and isolates the key contract
- **Workspace id sourced from the dashboard payload** (Option A) — avoids a second cross-BC gateway into identity; the dashboard round-trip already carries enough context
- **Selection logic in the presenter** — resolving the default team (alphabetical / persisted / fallback) is pure presentation logic; views receive only the resolved `isSelected: boolean`
- **Fire-and-forget persistence** — the hook updates UI state immediately on click and persists asynchronously; selection UX stays responsive even if `localStorage` is disabled
- **No React context for shared state** — downstream widgets will receive `selectedTeamId` via props through `DashboardView`. YAGNI until a second consumer lands.
- **Card as `role="button"` (not `<button>`)** — a team card contains a `<Link>` to the report page, so nesting a `<button>` would produce invalid HTML; `biome-ignore useSemanticElements` documented inline

## Context

The dashboard lists all workspace teams as cards. Upcoming per-team widgets (top cycle projects, epics, assignees, themes) need a single "selected team" context to know which cycle to display. Today the team cards are read-only. This spec makes them selectable so the dashboard becomes a per-team-context experience without leaving the page.

## Rules

- Every team card on the dashboard is clickable
- Exactly one team is selected at any time
- The selected card has a visual indicator distinguishing it from the others (border highlight and a checkmark icon)
- On first visit, the team whose name comes first alphabetically is selected by default
- The selection is persisted in browser local storage, keyed by workspace identifier, so switching workspaces gives a clean slate
- On dashboard load, the selection is restored from local storage if the referenced team still exists in the workspace
- If the persisted team no longer exists, the dashboard falls back to the alphabetical default
- When the workspace has zero teams, no selection exists and an empty-state message is displayed in place of the team cards: "No teams available. Connect Linear and select teams to sync first."
- The empty-state message is translated via the workspace language
- The selected team identifier is exposed as shared dashboard state that downstream widgets consume
- Selecting a team never triggers a page reload — the state propagates synchronously to consumers

## Scenarios

- first load alphabetical default: {workspace has teams "Bravo", "Alpha", "Charlie", no local storage entry} → selected team is "Alpha"
- first load empty workspace: {workspace has zero teams} → no selection, empty-state message shown in place of cards
- restore from local storage: {local storage says "team-bravo" is selected, team still exists} → selected team is "team-bravo"
- stale local storage: {local storage says "team-deleted" is selected, team no longer exists} → fall back to the alphabetical default
- user clicks a card: {user clicks the card of "Charlie"} → "Charlie" becomes selected, previous selection cleared, local storage updated
- visual indicator active: {"Alpha" is selected} → "Alpha" card has border highlight and checkmark, other cards keep default styling
- language switch on empty state: {no teams, workspace language switches from EN to FR} → empty-state text re-rendered in FR
- selection shared with consumers: {user selects "Bravo"} → any widget listening to dashboard selection state receives "team-bravo"
- workspace switch resets scope: {user switches to another workspace with its own local storage entry} → each workspace's last selection is independent

## Out of scope

- Multi-team selection
- Team filtering or search on the dashboard
- Reordering team cards
- Marking a team as favorite
- Persisting the selection across workspaces (selection is per workspace by design)
- The downstream widgets themselves (each has its own spec)

## Glossary

| Term | Definition |
|------|------------|
| Team selection | Per-workspace state identifying which team's data is currently focused on the dashboard |
| Workspace-scoped persistence | Local storage entry keyed by workspace identifier so switching workspaces gives a clean slate |
