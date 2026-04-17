# Select team on dashboard

## Status: ready

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
