# Handle dashboard empty states

## Status: implemented

## Context
When a user opens the dashboard for the first time, they get a 500 error instead of an explanatory screen. Whether the workspace is not connected or no team is synchronized, the dashboard must guide the user toward the next action instead of crashing.

## Rules
- The dashboard never returns an error when no data is available
- If no workspace is connected, the dashboard returns a "not connected" state with a message guiding toward connection
- If no team is synchronized, the dashboard returns a "no teams" state with a message guiding toward team selection
- The "not connected" state takes priority over the "no teams" state: connection is checked first
- The guidance message is in French and indicates the concrete action to perform

## Scenarios
- workspace not connected: {no workspace connected} -> status "not_connected" + message "Aucun workspace connecté. Veuillez connecter votre workspace Linear."
- no synchronized team: {workspace connected, no team synchronized} -> status "no_teams" + message "Aucune équipe synchronisée. Veuillez d'abord sélectionner des équipes à synchroniser."
- workspace connected with teams: {workspace connected, 2 synchronized teams with active cycles} -> normal dashboard data (behavior unchanged)

## Out of scope
- Modifying the dashboard HTML/frontend (client-side rendering)
- Adding clickable links in messages
- Multi-step onboarding or configuration wizard

## Glossary
| Term | Definition |
|------|------------|
| Empty state | Dashboard response when prerequisites are not met, containing a status and a guidance message |
