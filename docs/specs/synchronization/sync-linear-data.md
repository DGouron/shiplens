# Synchronize issues and cycles from Linear

## Status: implemented

## Context
Shiplens analyzes Linear data to produce insights. Before any analysis, the system must import issues, cycles and their state transitions for the selected teams. These are the high-volume, analytics-critical data.

## Rules
- Only teams explicitly selected by the user are synchronized
- Synchronization imports issues with their properties: title, status, points, labels, assignee, dates
- Synchronization imports cycles with their dates and associated issue scope
- Issue state transitions (timestamped status changes) are imported — they are essential for analytics
- Synchronization can be re-run without creating duplicates
- Synchronization resumes where it left off after an interruption
- Synchronization respects the rate limits imposed by the data provider
- The user can track the progress of an ongoing synchronization

## Scenarios
- issue import: {connected workspace, 1 team with 150 issues} -> 150 issues imported with title, status, points, labels, assignee
- cycle import: {connected workspace, 1 team with 5 cycles} -> 5 cycles imported with dates and associated issues
- state transition import: {issue with 4 status changes} -> 4 timestamped transitions imported
- visible progress: {sync in progress, 200 out of 500 issues imported} -> progress "40%"
- re-run without duplicates: {sync already completed, re-run} -> no duplicate data + status "synchronized"
- resume after interruption: {sync interrupted at 60%} -> re-run resumes where it left off + status "synchronized" at the end
- provider rate limit saturated: {too many requests in a short time} -> sync automatically throttled + resumes without data loss
- no team selected: {connected workspace, 0 teams selected} -> reject "Veuillez sélectionner au moins une équipe avant de lancer la synchronisation."
- workspace not connected: {no Linear workspace connected} -> reject "Veuillez d'abord connecter votre workspace Linear."
- team without issues: {connected workspace, selected team with no issues} -> status "synchronized" + 0 issues imported

## Out of scope
- Import of reference data (labels, statuses, members) — covered by sync-linear-reference-data
- Real-time synchronization — covered by sync-linear-realtime
- Transformation or analysis of imported data
- Import of data outside the selected teams

## Glossary
| Term | Definition |
|------|------------|
| Issue | Task or work ticket in Linear |
| Cycle | Iterative work period (sprint) in Linear, with start and end dates |
| State transition | Status change of an issue (e.g. "In Progress" -> "Done"), timestamped |
| Initial synchronization | Full import of Linear data history for the selected teams |

## Implementation

**Bounded Context** : Synchronization

**Artefacts** :
- Entity : `SyncProgress` (progression, curseur, complétion)
- Schemas Zod : `IssueData`, `CycleData`, `StateTransitionData`, `PaginatedIssues`
- Use Cases : `SyncIssueDataUsecase`, `GetSyncProgressUsecase`
- Controller : `SyncIssueDataController`
- Presenter : `SyncProgressPresenter`
- Gateways : `IssueDataGateway` (port), `LinearIssueDataGateway` (port), `SyncProgressGateway` (port)
- Gateways concrets : `IssueDataInPrismaGateway`, `SyncProgressInPrismaGateway`, `LinearIssueDataInHttpGateway`
- Migration : `add-issues-cycles-transitions-sync-progress` (4 modèles Prisma)

**Endpoints** :
| Méthode | Route | Use Case |
|---------|-------|----------|
| POST | `/sync/issue-data` | SyncIssueDataUsecase |
| GET | `/sync/issue-data/progress` | GetSyncProgressUsecase |

**Décisions architecturales** :
- Issue/Cycle/StateTransition : pas de classes Entity, schemas Zod + types dérivés (même pattern que reference-data)
- SyncProgress : vraie Entity avec logique (progression %, curseur, reprise)
- Pagination par curseurs Linear avec persistance du curseur pour reprise après interruption
- Rate limiting : retry avec backoff exponentiel sur HTTP 429 dans le gateway HTTP
- labelIds et issueExternalIds stockés en JSON string (contrainte SQLite)
- Sync synchrone en V1
