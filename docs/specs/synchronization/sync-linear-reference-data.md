# Synchronize Linear reference data

## Status: implemented

## Context
Before importing issues and cycles, Shiplens needs the workspace's reference data: labels, workflow statuses, team members and projects. These data provide structure and context for the issues imported afterwards.

## Rules
- Only reference data from selected teams is imported
- Synchronization imports the labels available for each team
- Synchronization imports the workflow statuses of each team (the possible stages of an issue)
- Synchronization imports the members of each team with their role
- Synchronization imports active projects and milestones of each team
- Synchronization can be re-run without creating duplicates
- Reference data is updated if it has changed since the last synchronization

## Scenarios
- label import: {team with 8 labels} -> 8 labels imported with name and color
- workflow status import: {team with workflow "Backlog -> Todo -> In Progress -> In Review -> Done"} -> 5 statuses imported in workflow order
- member import: {team with 6 members} -> 6 members imported with name and role
- project import: {team with 3 active projects, 1 with 2 milestones} -> 3 projects imported + 2 milestones
- update after modification: {label renamed in Linear since last sync} -> label updated in Shiplens
- re-run without duplicates: {reference sync already completed, re-run} -> no duplicate data
- no team selected: {connected workspace, 0 teams} -> reject "Veuillez sélectionner au moins une équipe avant de lancer la synchronisation."
- workspace not connected: {no workspace connected} -> reject "Veuillez d'abord connecter votre workspace Linear."

## Out of scope
- Import of issues, cycles and state transitions — covered by sync-linear-data
- Real-time synchronization — covered by sync-linear-realtime
- User permission management on Linear

## Glossary
| Term | Definition |
|------|------------|
| Reference data | Structural workspace data: labels, statuses, members, projects, milestones |
| Label | Tag attached to issues for categorization (e.g. "bug", "feature") |
| Workflow status | Possible stage in an issue's lifecycle within a team |
| Member | Person belonging to a Linear team |
| Project | Grouping of issues around an objective in Linear |
| Milestone | Progress checkpoint within a project |

## Implementation

- **Bounded Context** : Synchronization (`src/modules/synchronization/`)
- **Artefacts** :
  - Schemas Zod : `entities/reference-data/reference-data.schema.ts`
  - Gateway ports : `entities/reference-data/linear-reference-data.gateway.ts`, `entities/reference-data/reference-data.gateway.ts`
  - Errors : `entities/reference-data/reference-data.errors.ts`
  - Use case : `usecases/sync-reference-data.usecase.ts`
  - Controller : `interface-adapters/controllers/sync-reference-data.controller.ts`
  - Gateways infra : `interface-adapters/gateways/reference-data.in-prisma.gateway.ts`, `interface-adapters/gateways/linear-reference-data.in-http.gateway.ts`
  - Migration Prisma : `prisma/migrations/20260330222204_add_reference_data_models/`
- **Endpoints** :
  - `POST /sync/reference-data` → `SyncReferenceDataUsecase`
- **Décisions** :
  - Pas d'Entity classes pour les données de référence (records typés Zod, zéro behavior)
  - Upsert via deleteMany + createMany par équipe dans une transaction Prisma
  - Milestone appartient à Project, pas directement à Team
