# Auto-detect team workflow statuses

## Status: implemented

## Implementation

### Bounded Context
Analytics

### Artifacts
- **Entity**: `WorkflowConfig` — pure domain object with started/completed statuses and source
- **Schema**: `workflow-config.schema.ts` — Zod validation for WorkflowConfigProps
- **Guard**: `workflow-config.guard.ts` — Zod-based input validation
- **Patterns**: `workflow-status-patterns.ts` — case-insensitive substring matching against known patterns
- **Gateway port**: `WorkflowConfigGateway` — abstract class (findByTeamId, save)
- **Gateway impl**: `WorkflowConfigInPrismaGateway` — Prisma persistence with JSON-serialized status arrays
- **Use cases**: `ResolveWorkflowConfigUsecase` (hybrid resolution), `GetWorkflowConfigUsecase`, `SetWorkflowConfigUsecase`
- **Controller**: `WorkflowConfigController` — GET + PUT endpoints
- **Presenter**: `WorkflowConfigPresenter` — domain to DTO
- **Migration**: `20260416133338_add_team_workflow_config` — TeamWorkflowConfig model

### Endpoints
| Method | Route | Use Case |
|--------|-------|----------|
| GET | `/api/analytics/teams/:teamId/workflow-config` | GetWorkflowConfigUsecase |
| PUT | `/api/analytics/teams/:teamId/workflow-config` | SetWorkflowConfigUsecase |

### Architectural Decisions
- Gateway signatures parameterized: 4 affected gateways + MemberHealthDataGateway receive started/completed statuses as parameters instead of hardcoding them
- Use cases orchestrate resolution: each use case that needs cycle time calls ResolveWorkflowConfigUsecase first, then passes statuses to gateways
- AvailableStatusesGateway extended: added getDistinctTransitionStatusNames scanning StateTransition.toStatusName for pattern matching
- Persistence via Prisma: TeamWorkflowConfig model with JSON-serialized arrays (unlike file-based TeamSettings)

## Context

All cycle time-based analytics (estimation accuracy, average cycle time, underestimation ratio, bottleneck filtering, sprint report context, duration prediction) rely on identifying which state transitions mark an issue as "started" and "completed". These status names are currently hardcoded to "In Progress"/"Started" and "Done"/"Completed". Teams using different workflow names (e.g. "In Dev", "A Valider", "ON-STAGE") get zero data for these metrics — the signals show "Not applicable" even though the member has real activity.

## Rules

- Each team has a workflow configuration consisting of a list of started status names and a list of completed status names
- On first access, the system auto-detects the configuration using a hybrid resolution strategy (in order):
  1. Manual override: if the team already has a persisted configuration, use it
  2. Pattern matching: scan the team's distinct state transition names and match against known patterns (case-insensitive): started patterns include "progress", "dev", "doing", "started", "in development"; completed patterns include "done", "completed", "closed", "shipped", "released"
  3. Hardcoded fallback: if pattern matching finds nothing, use ["In Progress", "Started"] and ["Done", "Completed"]
- The auto-detection runs against the team's actual state transition history in the database
- The detected or configured status names replace all hardcoded references in the 4 affected gateways: estimation accuracy data, bottleneck analysis data, sprint report data, duration prediction data
- The configuration is persisted per team so auto-detection only runs once (until manually changed)
- A GET endpoint exposes the current workflow configuration for a team
- A PUT endpoint allows overriding the started and completed status names
- When the configuration is empty after all resolution steps (no matching transitions at all), analytics that depend on cycle time display a guidance message: "No workflow statuses detected. If you think this is wrong, configure your workflow in Settings." with a link to the settings page
- Changing the workflow configuration does not retroactively recompute past analytics — it applies on the next data access
- The review status name (already in TeamSettings) remains a separate configuration

## Scenarios

- auto-detect standard workflow: {team with "In Progress" and "Done" transitions} -> started: ["In Progress"], completed: ["Done"]
- auto-detect custom workflow: {team with "In Dev", "In Review", "A Valider", "Done" transitions} -> started: ["In Dev"], completed: ["Done"]
- auto-detect multiple matches: {team with "In Progress", "In Dev", "Started" transitions} -> started: ["In Progress", "In Dev", "Started"]
- pattern matching case-insensitive: {team with "IN PROGRESS" and "done" transitions} -> started: ["IN PROGRESS"], completed: ["done"]
- fallback when no match: {team with "Phase1", "Phase2", "Phase3" transitions only} -> started: ["In Progress", "Started"], completed: ["Done", "Completed"]
- manual override persisted: {team configures started: ["In Dev"], completed: ["Shipped"]} -> subsequent access returns ["In Dev"] and ["Shipped"]
- manual override takes precedence: {team has auto-detected ["In Progress"] but user sets ["In Dev"]} -> started: ["In Dev"]
- estimation accuracy uses config: {team with started: ["In Dev"], member with issues transitioning through "In Dev" -> "Done"} -> estimation score is computed (not "Not applicable")
- bottleneck analysis uses config: {team with completed: ["Shipped"]} -> completed issues filtered by "Shipped" transition
- sprint report uses config: {team with started: ["In Dev"]} -> cycle time computed from "In Dev" transition
- duration prediction uses config: {team with started: ["In Dev"], completed: ["Done"]} -> similar issues computed with correct cycle time
- get workflow config endpoint: {GET /api/analytics/teams/:teamId/workflow-config} -> returns { startedStatuses: [...], completedStatuses: [...], source: "auto-detected" | "manual" }
- put workflow config endpoint: {PUT /api/analytics/teams/:teamId/workflow-config with body} -> persists and returns updated config with source: "manual"
- empty workflow guidance: {team with no transitions at all} -> analytics show "No workflow statuses detected" guidance message
- review status unaffected: {team changes workflow config} -> review status name remains unchanged

## Out of scope

- Frontend settings UI for workflow configuration (spec B — workflow-configuration-ui)
- Ordered workflow sequence with drag & drop (spec B)
- Retroactive recomputation of past analytics after config change
- Auto-detection by workflow position (first status after backlog = started)
- Webhook-triggered re-detection when new statuses appear

## Glossary

| Term | Definition |
|------|------------|
| Workflow configuration | Per-team mapping defining which status names correspond to "started" (work begins) and "completed" (work finished) for cycle time computation |
| Started status | Status name that marks the beginning of active work on an issue — used as the start point for cycle time |
| Completed status | Status name that marks the end of work on an issue — used as the end point for cycle time |
| Hybrid resolution | Three-tier strategy: manual override > pattern matching > hardcoded fallback |
| Pattern matching | Case-insensitive substring search against known workflow patterns in the team's state transition history |
