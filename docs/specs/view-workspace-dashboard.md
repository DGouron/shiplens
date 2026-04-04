# View workspace dashboard

## Status: implemented

## Context
The tech lead opens Shiplens to get an instant overview of their workspace. Today, they have to navigate Linear team by team to mentally reconstruct the global state. Shiplens displays a centralized dashboard with key indicators for each team and quick access to reports.

## Rules
- The dashboard displays all workspace teams that have an active cycle
- Each team displays its current active cycle with its KPIs: velocity trend, completion rate, number of blocked issues
- Velocity trend compares the active cycle to previous cycles of the same team
- Completion rate represents the ratio between completed issues and total issues of the active cycle
- The latest generated sprint report is accessible in one click from each team
- The Linear synchronization status is permanently visible: last synchronization date and next planned synchronization
- The dashboard prioritizes desktop display but remains usable on mobile

## Scenarios
- nominal dashboard: {connected workspace, 3 teams with active cycles, synchronized data} -> 3 team cards displayed + KPIs per team (velocity trend, completion rate, blocked issues) + synchronization status visible
- team without active cycle: {connected workspace, 1 team without active cycle among 3 teams} -> 2 team cards with KPIs + 1 team card with note "Aucun cycle actif"
- report access from dashboard: {team with latest report generated} -> click on the report -> navigation to the full report page
- team without report: {team with active cycle, no report generated} -> team card displayed without report link + note "Aucun rapport disponible"
- no synchronized teams: {connected workspace, no synchronized teams} -> reject "Aucune équipe synchronisée. Veuillez d'abord sélectionner des équipes à synchroniser."
- workspace not connected: {no workspace connected} -> reject "Aucun workspace connecté. Veuillez connecter votre workspace Linear."
- synchronization overdue: {last synchronization > 24h} -> synchronization status displayed as alert + note "Synchronisation en retard"
- all issues blocked: {team with 100% blocked issues} -> blocked issues KPI displayed as alert on the team card

## Out of scope
- Customization of team card order or layout
- Team filtering or search on the dashboard
- Cycle creation or modification from the dashboard
- Display of teams from multiple workspaces
- Real-time notifications on KPI changes

## Glossary
| Term | Definition |
|------|------------|
| Dashboard | Home page displaying a workspace overview |
| Team card | Visual block summarizing the active cycle state of a team |
| Active cycle | Cycle (sprint) currently in progress for a given team |
| Velocity trend | Evolution of the active cycle's velocity compared to previous cycles |
| Completion rate | Percentage of completed issues out of the total cycle issues |
| Blocked issues | Cycle issues marked as blocked in Linear |
| Synchronization status | Indicator showing when the last synchronization occurred and when the next one is planned |

## Implementation

- **Bounded Context** : Analytics
- **Use Case** : `GetWorkspaceDashboardUsecase` — agrège KPIs par équipe (complétion, vélocité, issues bloquées)
- **Presenter** : `WorkspaceDashboardPresenter` — formate les données brutes en DTO affichable
- **Controller** : `WorkspaceDashboardController` — `GET /dashboard` (HTML SSR) + `GET /dashboard/data` (JSON API)
- **Gateway** : `WorkspaceDashboardDataGateway` (port) / `WorkspaceDashboardDataInPrismaGateway` (adapter)
- **Migration** : `add-updated-at-to-sync-progress` — ajout `updatedAt` sur `SyncProgress`

### Decisions architecturales
- Tendance vélocité : seuil 10% — comparaison cycle actif vs moyenne des 3 derniers cycles terminés
- Issues bloquées : statusName contenant "blocked" (case-insensitive)
- Lien rapport : redirige vers `/cycle-report?teamId=xxx` (rapports générés à la volée)
- Prochaine synchronisation : affiche "Synchronisation manuelle" (pas de scheduler)
