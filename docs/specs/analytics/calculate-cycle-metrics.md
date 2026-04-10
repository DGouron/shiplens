# Calculate metrics for a completed cycle

## Status: implemented

## Context
At the end of a cycle, the tech lead needs a quantified summary to understand what actually happened. Without reliable metrics, retrospectives remain subjective and the same problems repeat cycle after cycle.

## Rules
- Metrics can only be calculated for a cycle whose status is completed
- Velocity compares completed points to points planned at cycle start
- Cycle time is measured between entering the in-progress state and completion
- Lead time is measured between issue creation and its completion
- Scope creep only counts issues added after the cycle start date
- Completion rate is based on the initial cycle scope, not the final scope
- The trend requires at least 3 completed cycles to be displayed

## Scenarios
- nominal metrics: {completed cycle with 8 issues completed out of 10 planned, 21 points completed out of 25 planned} -> velocity "21/25 points" + throughput "8 issues" + completion rate "80%"
- cycle time and lead time: {completed cycle, issues with complete transition history} -> average cycle time calculated + average lead time calculated
- scope creep detected: {completed cycle, 10 issues at start, 13 issues at end} -> scope creep "3 issues added"
- trend with sufficient history: {completed cycle, 3 previous cycles available} -> comparison with the last 3 cycles displayed
- trend without sufficient history: {completed cycle, fewer than 3 previous cycles} -> reject "Pas assez d'historique pour afficher la tendance. Minimum 3 cycles terminés requis."
- uncompleted cycle: {cycle in progress} -> reject "Les métriques ne sont disponibles que pour les cycles terminés."
- cycle without issues: {completed cycle, no issues} -> reject "Ce cycle ne contient aucune issue. Impossible de calculer les métriques."
- issue without status transition: {completed cycle, issue never entered in-progress state} -> issue excluded from cycle time calculation

## Out of scope
- Real-time metrics during an ongoing cycle
- Performance goals or targets to achieve
- Comparison between teams
- Metrics export

## Glossary
| Term | Definition |
|------|------------|
| Cycle | Defined work period with a start and end date (sprint in Linear) |
| Velocity | Ratio between completed points and points planned at start |
| Throughput | Total number of issues completed in the cycle |
| Cycle time | Duration between the moment an issue enters in-progress state and its completion |
| Lead time | Duration between issue creation and its completion |
| Scope creep | Issues added to the cycle after its start date |
| Completion rate | Percentage of completed issues relative to the initial cycle scope |
| Trend | Evolution of a metric compared to the last 3 completed cycles |

## Implementation

### Bounded Context
Analytics (new module)

### Artefacts
- **Entity** : `CycleSnapshot` — pure calculation logic for metrics (velocity, throughput, completion rate, scope creep, cycle time, lead time)
- **Use Case** : `CalculateCycleMetricsUsecase` — orchestrates data retrieval and snapshot creation
- **Controller** : `CycleMetricsController` — exposes the HTTP endpoint
- **Presenter** : `CycleMetricsPresenter` — transforms domain to formatted DTO
- **Gateway Port** : `CycleMetricsDataGateway` — abstract class, read-only on Issue/Cycle/StateTransition
- **Gateway Impl** : `CycleMetricsDataInPrismaGateway` — Prisma implementation

### Endpoints
| Method | Route | Use Case |
|--------|-------|----------|
| GET | `/analytics/cycles/:cycleId/metrics?teamId=xxx` | CalculateCycleMetricsUsecase |

### Architectural decisions
- Completed cycle = `endsAt < now()` (no status field in database)
- Initial scope = issues where `createdAt <= cycle.startsAt`
- No Prisma migration (reads existing tables)
- Completed issue = statusName contains "Done" or "Completed"
