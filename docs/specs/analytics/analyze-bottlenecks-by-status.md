# Identify bottlenecks by status

## Status: implemented

## Context
The tech lead wants to understand which workflow steps systematically slow down delivery. Without this visibility, process improvements are done blindly — optimizing where things aren't stuck.

## Rules
- Time spent in each status is calculated from issue state transitions
- Time distribution covers the entire workflow: Backlog, Todo, In Progress, In Review, Done
- The bottleneck status is the one with the highest median time over the analyzed period
- Comparison between cycles measures how a status evolves over time
- The breakdown by assignee shows individual time distribution per status
- Only completed issues (Done) are included in the calculation

## Scenarios
- nominal distribution: {10 completed issues in the current cycle} -> median time per status (Backlog, Todo, In Progress, In Review, Done) + bottleneck status identified
- bottleneck identification: {median In Review = 36h, median In Progress = 12h, median Todo = 4h} -> bottleneck "In Review"
- comparison between cycles: {cycle 1: median In Review = 48h, cycle 2: median In Review = 30h} -> evolution "-37%" for In Review
- breakdown by assignee: {3 developers in the cycle} -> median time per status for each assignee
- assignee often blocked in review: {Alice: median In Review = 60h, Bob: median In Review = 20h} -> Alice identified with the highest review time
- no completed issues: {current cycle, 0 issues in Done} -> reject "Aucune issue terminée sur cette période. L'analyse nécessite au moins une issue complétée."
- single cycle without comparison: {only one cycle available} -> distribution displayed without comparison + mention "Pas assez de cycles pour comparer l'évolution."
- no synchronized data: {no Linear data imported} -> reject "Veuillez d'abord synchroniser vos données Linear."

## Out of scope
- Analysis of uncompleted issues (in progress or abandoned)
- Automatic workflow improvement recommendations
- Analysis by label, project, or priority (only by status and assignee)
- Workflow status customization (uses the workflow as defined in Linear)
- Analysis data export

## Glossary
| Term | Definition |
|------|------------|
| Bottleneck | Workflow status where issues spend the most time by median |
| Time distribution | Breakdown of time spent by issues in each status |
| Median time | Central value of time spent in a status — more robust than the average against outliers |
| Cycle | Iterative work period (sprint) in Linear |
| State transition | Status change of an issue, timestamped, used as the basis for time-per-status calculation |
| Assignee | Person assigned to an issue in Linear |
| Breakdown | Detailed decomposition of a metric along an axis (here: by assignee) |
| Status | Step in an issue's workflow in Linear (Backlog, Todo, In Progress, In Review, Done) |

## Implementation

| Aspect | Detail |
|--------|--------|
| Bounded Context | analytics |
| Entity | `entities/bottleneck-analysis/bottleneck-analysis.ts` |
| Use Case | `usecases/analyze-bottlenecks-by-status.usecase.ts` |
| Controller | `interface-adapters/controllers/bottleneck-analysis.controller.ts` |
| Presenter | `interface-adapters/presenters/bottleneck-analysis.presenter.ts` |
| Gateway Port | `entities/bottleneck-analysis/bottleneck-analysis-data.gateway.ts` |
| Gateway Impl | `interface-adapters/gateways/bottleneck-analysis-data.in-prisma.gateway.ts` |
| Migration | None (StateTransition, Issue, Cycle already exist) |

| Method | Route | Use Case |
|--------|-------|----------|
| GET | `/analytics/cycles/:cycleId/bottlenecks?teamId=X&includeComparison=true` | AnalyzeBottlenecksByStatusUsecase |
