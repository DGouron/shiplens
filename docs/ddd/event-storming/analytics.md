# Event Storming — Analytics

*Date: 2026-04-18 (cycle-themes addendum)*
*Scope: Sprint metrics, bottleneck analysis, blocked issue detection, duration prediction, AI reports, member health trends, workflow configuration (backend + frontend UI), workspace dashboard (incl. per-workspace team selection + right-side column), top cycle projects widget + drill-down drawer, top cycle assignees widget + drill-down drawer, AI-powered cycle theme detection (backend only — frontend UI pending), drift grid, settings page orchestration*

> Analytics spans BOTH workspaces. Backend owns the business logic, persistence, schedulers, controllers, and HTTP contract. Frontend owns the client-side orchestration: HTTP gateways, client usecases, hooks, presenters producing ViewModels, humble views. The two sides share the same ubiquitous language but different layer terminology (Clean Architecture, not tactical DDD).

---

## Domain Events (Orange)

| Event | Trigger | Source File |
|-------|---------|-------------|
| CycleMetricsCalculated | CalculateCycleMetrics | `backend/src/modules/analytics/usecases/calculate-cycle-metrics.usecase.ts` |
| SprintReportGenerated | GenerateSprintReport | `backend/src/modules/analytics/usecases/generate-sprint-report.usecase.ts` |
| BlockedIssuesDetected | DetectBlockedIssues (hourly scheduler) | `backend/src/modules/analytics/usecases/detect-blocked-issues.usecase.ts` |
| BlockedIssueAlertCreated | DetectBlockedIssues (new alert) | `backend/src/modules/analytics/usecases/detect-blocked-issues.usecase.ts` |
| BlockedIssueAlertResolved | DetectBlockedIssues (issue unblocked) | `backend/src/modules/analytics/usecases/detect-blocked-issues.usecase.ts` |
| StatusThresholdUpdated | SetStatusThreshold | `backend/src/modules/analytics/usecases/set-status-threshold.usecase.ts` |
| BottleneckAnalysisCompleted | AnalyzeBottlenecksByStatus | `backend/src/modules/analytics/usecases/analyze-bottlenecks-by-status.usecase.ts` |
| EstimationAccuracyCalculated | CalculateEstimationAccuracy | `backend/src/modules/analytics/usecases/calculate-estimation-accuracy.usecase.ts` |
| IssueDurationPredicted | PredictIssueDuration | `backend/src/modules/analytics/usecases/predict-issue-duration.usecase.ts` |
| WorkspaceDashboardGenerated | GetWorkspaceDashboard | `backend/src/modules/analytics/usecases/get-workspace-dashboard.usecase.ts` |
| MemberDigestGenerated | GenerateMemberDigest | `backend/src/modules/analytics/usecases/generate-member-digest.usecase.ts` |
| TeamExcludedStatusesUpdated | SetTeamExcludedStatuses | `backend/src/modules/analytics/usecases/set-team-excluded-statuses.usecase.ts` |
| WorkflowConfigAutoDetected | ResolveWorkflowConfig (no existing config) | `backend/src/modules/analytics/usecases/resolve-workflow-config.usecase.ts` |
| WorkflowConfigSaved | SetWorkflowConfig (manual) or ResolveWorkflowConfig (auto-detect persisted) | `backend/src/modules/analytics/usecases/set-workflow-config.usecase.ts` |
| MemberHealthTrendsViewed | GetMemberHealth | `backend/src/modules/analytics/usecases/get-member-health.usecase.ts` |
| TeamSelected (client-side) | PersistTeamSelection (user clicks a team card) | `frontend/src/modules/analytics/usecases/persist-team-selection.usecase.ts` |
| TeamSelectionRestored (client-side) | GetPersistedTeamSelection (dashboard load) | `frontend/src/modules/analytics/usecases/get-persisted-team-selection.usecase.ts` |
| TopCycleProjectsRequested (client-side) | useTopCycleProjects mounts or teamId changes → ranking query fires | `frontend/src/modules/analytics/interface-adapters/hooks/use-top-cycle-projects.ts` |
| CycleProjectIssuesDrawerOpened (client-side) | User clicks a ranking row → `selectedProjectId` flips from `null`, issues query fires | `frontend/src/modules/analytics/interface-adapters/hooks/use-top-cycle-projects.ts` |
| CycleProjectIssuesDrawerDismissed (client-side) | Escape / click-outside / close button → `selectedProjectId` reset to `null` | `frontend/src/modules/analytics/interface-adapters/hooks/use-top-cycle-projects.ts` + `frontend/src/shared/foundation/hooks/use-dismissable-overlay.ts` |
| TopCycleAssigneesRequested (client-side) | `useTopCycleAssignees` mounts or `teamId` changes → ranking query fires | `frontend/src/modules/analytics/interface-adapters/hooks/use-top-cycle-assignees.ts` |
| CycleAssigneeIssuesDrawerOpened (client-side) | User clicks a ranking row → `selectedAssigneeName` flips from `null`, issues query fires | `frontend/src/modules/analytics/interface-adapters/hooks/use-top-cycle-assignees.ts` |
| CycleAssigneeIssuesDrawerDismissed (client-side) | Close button / drawer dismissal → `selectedAssigneeName` reset to `null` | `frontend/src/modules/analytics/interface-adapters/hooks/use-top-cycle-assignees.ts` |
| **CycleThemesRequested** | User (or controller) invokes `DetectCycleThemes` — lazy on-demand from `GET /analytics/cycle-themes/:teamId` | `backend/src/modules/analytics/usecases/detect-cycle-themes.usecase.ts` |
| **CycleThemesServedFromCache** | `DetectCycleThemes` finds a non-stale (<24h) `CycleThemeSet` in cache; no AI call | `backend/src/modules/analytics/usecases/detect-cycle-themes.usecase.ts` (L.72-90) |
| **CycleThemesRefreshed** | `DetectCycleThemes` runs the AI provider and persists a fresh `CycleThemeSet`; fired whether triggered by cache miss, stale cache, or `?refresh=true` | `backend/src/modules/analytics/usecases/detect-cycle-themes.usecase.ts` (L.112-141) |
| **CycleThemeDetectionBelowThreshold** | Candidate-issue count for the active cycle is strictly less than 10; AI is never invoked | `backend/src/modules/analytics/usecases/detect-cycle-themes.usecase.ts` (L.98-103) |
| **AiProviderUnavailableForThemes** | `AiTextGeneratorGateway.generate` throws `AiProviderUnavailableError`; usecase short-circuits with status `ai_unavailable` (no cache write) | `backend/src/modules/analytics/usecases/detect-cycle-themes.usecase.ts` (L.116-121) |
| **CycleThemeDrillDownOpened** | `GetCycleIssuesForTheme` resolves a known theme for the active cycle — consumer (frontend) will open a drawer (UI pending) | `backend/src/modules/analytics/usecases/get-cycle-issues-for-theme.usecase.ts` |

> Client-side events are browser-local (no backend round-trip). They model UX state transitions that downstream dashboard widgets will observe.

---

## Commands (Blue)

### Backend (NestJS usecases)

| Command | Actor | Produced Event | Source File |
|---------|-------|----------------|-------------|
| CalculateCycleMetrics | user | CycleMetricsCalculated | `backend/src/modules/analytics/usecases/calculate-cycle-metrics.usecase.ts` |
| GenerateSprintReport | user | SprintReportGenerated | `backend/src/modules/analytics/usecases/generate-sprint-report.usecase.ts` |
| DetectBlockedIssues | system (hourly cron) | BlockedIssuesDetected | `backend/src/modules/analytics/usecases/detect-blocked-issues.usecase.ts` |
| GetBlockedIssues | user | — (read) | `backend/src/modules/analytics/usecases/get-blocked-issues.usecase.ts` |
| GetAlertHistory | user | — (read) | `backend/src/modules/analytics/usecases/get-alert-history.usecase.ts` |
| SetStatusThreshold | user | StatusThresholdUpdated | `backend/src/modules/analytics/usecases/set-status-threshold.usecase.ts` |
| AnalyzeBottlenecksByStatus | user | BottleneckAnalysisCompleted | `backend/src/modules/analytics/usecases/analyze-bottlenecks-by-status.usecase.ts` |
| CalculateEstimationAccuracy | user | EstimationAccuracyCalculated | `backend/src/modules/analytics/usecases/calculate-estimation-accuracy.usecase.ts` |
| GetEstimationTrend | user | — (read) | `backend/src/modules/analytics/usecases/get-estimation-trend.usecase.ts` |
| PredictIssueDuration | user | IssueDurationPredicted | `backend/src/modules/analytics/usecases/predict-issue-duration.usecase.ts` |
| GetWorkspaceDashboard | user | WorkspaceDashboardGenerated | `backend/src/modules/analytics/usecases/get-workspace-dashboard.usecase.ts` |
| ListTeamCycles | user | — (read) | `backend/src/modules/analytics/usecases/list-team-cycles.usecase.ts` |
| GetCycleIssues | user | — (read) | `backend/src/modules/analytics/usecases/get-cycle-issues.usecase.ts` |
| ListTeamReports | user | — (read) | `backend/src/modules/analytics/usecases/list-team-reports.usecase.ts` |
| GetReport | user | — (read) | `backend/src/modules/analytics/usecases/get-report.usecase.ts` |
| GenerateMemberDigest | user | MemberDigestGenerated | `backend/src/modules/analytics/usecases/generate-member-digest.usecase.ts` |
| GetTeamExcludedStatuses | user | — (read) | `backend/src/modules/analytics/usecases/get-team-excluded-statuses.usecase.ts` |
| SetTeamExcludedStatuses | user | TeamExcludedStatusesUpdated | `backend/src/modules/analytics/usecases/set-team-excluded-statuses.usecase.ts` |
| GetWorkflowConfig | user | WorkflowConfigAutoDetected (first access, no manual config) | `backend/src/modules/analytics/usecases/get-workflow-config.usecase.ts` |
| SetWorkflowConfig | user | WorkflowConfigSaved | `backend/src/modules/analytics/usecases/set-workflow-config.usecase.ts` |
| ResolveWorkflowConfig | system (internal orchestration) | WorkflowConfigAutoDetected | `backend/src/modules/analytics/usecases/resolve-workflow-config.usecase.ts` |
| GetMemberHealth | user | MemberHealthTrendsViewed | `backend/src/modules/analytics/usecases/get-member-health.usecase.ts` |
| DetectDriftingIssues | user | — (read) | `backend/src/modules/analytics/usecases/detect-drifting-issues.usecase.ts` |
| GetWorkspaceLanguage | user | — (read) | `backend/src/modules/analytics/usecases/get-workspace-language.usecase.ts` |
| SetWorkspaceLanguage | user | — (command w/ persistence) | `backend/src/modules/analytics/usecases/set-workspace-language.usecase.ts` |
| GetTopCycleProjects | user (widget loads) | TopCycleProjectsRequested (server-side read, calls `ResolveWorkflowConfigUsecase`) | `backend/src/modules/analytics/usecases/get-top-cycle-projects.usecase.ts` |
| GetCycleIssuesForProject | user (opens drawer) | — (read) | `backend/src/modules/analytics/usecases/get-cycle-issues-for-project.usecase.ts` |
| GetTopCycleAssignees | user (widget loads) | TopCycleAssigneesRequested (server-side read, calls `ResolveWorkflowConfigUsecase`) | `backend/src/modules/analytics/usecases/get-top-cycle-assignees.usecase.ts` |
| GetCycleIssuesForAssignee | user (opens drawer) | — (read) | `backend/src/modules/analytics/usecases/get-cycle-issues-for-assignee.usecase.ts` |
| **DetectCycleThemes** | user (frontend widget, currently only via HTTP endpoint) | CycleThemesRequested + one of CycleThemesServedFromCache / CycleThemesRefreshed / CycleThemeDetectionBelowThreshold / AiProviderUnavailableForThemes | `backend/src/modules/analytics/usecases/detect-cycle-themes.usecase.ts` |
| **GetCycleIssuesForTheme** | user (opens drawer for a theme) | CycleThemeDrillDownOpened | `backend/src/modules/analytics/usecases/get-cycle-issues-for-theme.usecase.ts` |

### Frontend (client-side usecases)

| Command | Actor | Produced Event | Source File |
|---------|-------|----------------|-------------|
| GetWorkspaceDashboard | user (view loads) | — (HTTP read) | `frontend/src/modules/analytics/usecases/get-workspace-dashboard.usecase.ts` |
| ListTeamCycles | user | — (HTTP read) | `frontend/src/modules/analytics/usecases/list-team-cycles.usecase.ts` |
| GetCycleMetrics | user | — (HTTP read) | `frontend/src/modules/analytics/usecases/get-cycle-metrics.usecase.ts` |
| GetBottleneckAnalysis | user | — (HTTP read) | `frontend/src/modules/analytics/usecases/get-bottleneck-analysis.usecase.ts` |
| ListBlockedIssues | user | — (HTTP read) | `frontend/src/modules/analytics/usecases/list-blocked-issues.usecase.ts` |
| GetEstimationAccuracy | user | — (HTTP read) | `frontend/src/modules/analytics/usecases/get-estimation-accuracy.usecase.ts` |
| ListDriftingIssues | user | — (HTTP read) | `frontend/src/modules/analytics/usecases/list-drifting-issues.usecase.ts` |
| ListSprintReports | user | — (HTTP read) | `frontend/src/modules/analytics/usecases/list-sprint-reports.usecase.ts` |
| GetSprintReportDetail | user | — (HTTP read) | `frontend/src/modules/analytics/usecases/get-sprint-report-detail.usecase.ts` |
| GenerateSprintReport | user | SprintReportGenerated (server-side) | `frontend/src/modules/analytics/usecases/generate-sprint-report.usecase.ts` |
| GenerateMemberDigest | user | MemberDigestGenerated (server-side) | `frontend/src/modules/analytics/usecases/generate-member-digest.usecase.ts` |
| GetMemberHealth | user | MemberHealthTrendsViewed (server-side) | `frontend/src/modules/analytics/usecases/get-member-health.usecase.ts` |
| GetWorkspaceLanguage | user | — (HTTP read) | `frontend/src/modules/analytics/usecases/get-workspace-language.usecase.ts` |
| SetWorkspaceLanguage | user | — (HTTP write) | `frontend/src/modules/analytics/usecases/set-workspace-language.usecase.ts` |
| GetTeamTimezone | user | — (HTTP read) | `frontend/src/modules/analytics/usecases/get-team-timezone.usecase.ts` |
| SetTeamTimezone | user | — (HTTP write) | `frontend/src/modules/analytics/usecases/set-team-timezone.usecase.ts` |
| GetTeamStatusSettings | user | — (HTTP read) | `frontend/src/modules/analytics/usecases/get-team-status-settings.usecase.ts` |
| SetTeamExcludedStatuses | user | TeamExcludedStatusesUpdated (server-side) | `frontend/src/modules/analytics/usecases/set-team-excluded-statuses.usecase.ts` |
| GetDriftGridEntries | user | — (HTTP read) | `frontend/src/modules/analytics/usecases/get-drift-grid-entries.usecase.ts` |
| GetTeamWorkflowConfig | user | — (HTTP read) | `frontend/src/modules/analytics/usecases/get-team-workflow-config.usecase.ts` |
| SetTeamWorkflowConfig | user | WorkflowConfigSaved (server-side) | `frontend/src/modules/analytics/usecases/set-team-workflow-config.usecase.ts` |
| ListAvailableTeams | user | — (HTTP read, cross-BC to Synchronization) | `frontend/src/modules/analytics/usecases/list-available-teams.usecase.ts` |
| **PersistTeamSelection** | user (clicks team card) | TeamSelected | `frontend/src/modules/analytics/usecases/persist-team-selection.usecase.ts` |
| **GetPersistedTeamSelection** | system (dashboard mount) | TeamSelectionRestored | `frontend/src/modules/analytics/usecases/get-persisted-team-selection.usecase.ts` |
| **GetTopCycleProjects** | user (widget mount / team switch) | TopCycleProjectsRequested | `frontend/src/modules/analytics/usecases/get-top-cycle-projects.usecase.ts` |
| **ListCycleProjectIssues** | user (clicks ranking row) | CycleProjectIssuesDrawerOpened | `frontend/src/modules/analytics/usecases/list-cycle-project-issues.usecase.ts` |
| **GetTopCycleAssignees** | user (widget mount / team switch) | TopCycleAssigneesRequested | `frontend/src/modules/analytics/usecases/get-top-cycle-assignees.usecase.ts` |
| **ListCycleAssigneeIssues** | user (clicks ranking row) | CycleAssigneeIssuesDrawerOpened | `frontend/src/modules/analytics/usecases/list-cycle-assignee-issues.usecase.ts` |

---

## Entities (Yellow)

### Backend entities

| Entity | Responsibility | Files |
|--------|----------------|-------|
| CycleSnapshot | Snapshot of a completed or in-progress cycle — issues, points, dates. Computes velocity, throughput, completion rate, scope creep, cycle time, lead time. | `backend/src/modules/analytics/entities/cycle-snapshot/cycle-snapshot.ts` |
| SprintReport | AI-generated sprint report — executive summary, trends, highlights, risks, recommendations, audit section. | `backend/src/modules/analytics/entities/sprint-report/sprint-report.ts` |
| BlockedIssueAlert | Alert on an issue stuck beyond its status threshold — severity, duration, resolution timestamp. | `backend/src/modules/analytics/entities/blocked-issue-alert/blocked-issue-alert.ts` |
| StatusThreshold | Per-status configurable threshold (warning x1, critical x2). | `backend/src/modules/analytics/entities/status-threshold/status-threshold.ts` |
| BottleneckAnalysis | Median time distribution per status, per assignee, cross-cycle comparison. | `backend/src/modules/analytics/entities/bottleneck-analysis/bottleneck-analysis.ts` |
| EstimationAccuracy | Points/cycle-time ratio per issue, developer, label, team. | `backend/src/modules/analytics/entities/estimation-accuracy/estimation-accuracy.ts` |
| DurationPrediction | Duration prediction from similar issues — P25/P50/P75 confidence interval. | `backend/src/modules/analytics/entities/duration-prediction/duration-prediction.ts` |
| WorkflowConfig | Per-team mapping of status names to `startedStatuses` / `completedStatuses`, with source (`auto-detected` or `manual`). | `backend/src/modules/analytics/entities/workflow-config/workflow-config.ts` |
| MemberHealth | Per-member health across N cycles — 5 computed signals. | `backend/src/modules/analytics/entities/member-health/member-health.ts` |
| DriftingIssue | In-progress issue exceeding business-hours budget per story point (status: on-track, drifting, needs-splitting). | `backend/src/modules/analytics/entities/drifting-issue/drifting-issue.ts` |
| TeamSettings (port + in-file impl) | Per-team excluded statuses for blocked-issue detection. | `backend/src/modules/analytics/entities/team-settings/team-settings.gateway.ts` |
| WorkspaceSettings | Workspace-scoped language. | `backend/src/modules/analytics/entities/workspace-settings/workspace-settings.gateway.ts` |
| WorkspaceDashboard (aggregate shape) | Per-team dashboard cards + synchronization status. | `backend/src/modules/analytics/entities/workspace-dashboard/` + `backend/src/modules/analytics/usecases/get-workspace-dashboard.usecase.ts` (`WorkspaceDashboardResult`) |
| TopCycleProjects (aggregate shape) | Zod schemas for active-cycle locator, per-project aggregate (count / points / cycle time), per-issue drawer detail. Sentinel constants `NO_PROJECT_BUCKET_ID = "__no_project__"` and `NO_PROJECT_BUCKET_NAME = "No project"`. | `backend/src/modules/analytics/entities/top-cycle-projects/top-cycle-projects.schema.ts` + `top-cycle-projects-data.gateway.ts` |
| TopCycleAssignees (aggregate shape) | Zod schemas for active-cycle locator, per-assignee aggregate (count / points / total cycle time) computed only on issues in `completedStatuses`, per-issue drawer detail. Three abstract gateway methods: `getActiveCycleLocator`, `getCycleAssigneeAggregates`, `getCycleIssuesForAssignee`. | `backend/src/modules/analytics/entities/top-cycle-assignees/top-cycle-assignees.schema.ts` + `top-cycle-assignees-data.gateway.ts` |
| **CycleThemeSet** | Aggregate of 1-5 AI-inferred semantic clusters (themes) for a given cycle+team+language. Each theme has a short name (1-60 chars) and a non-empty list of issue external ids. Exposes `isCachedWithin(nowIso, ttlMilliseconds)` to determine cache freshness (24h TTL). Validated by `cycleThemeSetGuard` (Zod) — uses `BusinessRuleViolation`-based `InsufficientIssuesForThemeDetectionError` (declared but currently unused: the usecase short-circuits to a `below_threshold` result instead of throwing). | `backend/src/modules/analytics/entities/cycle-theme-set/cycle-theme-set.ts` + `cycle-theme-set.schema.ts` + `cycle-theme-set.guard.ts` + `cycle-theme-set.errors.ts` |

### Frontend entities (gateway ports + response shapes)

| Entity | Responsibility | Files |
|--------|----------------|-------|
| **TeamSelectionStorage** | Port for per-workspace persistence of the currently focused team on the dashboard. | `frontend/src/modules/analytics/entities/team-selection/team-selection.gateway.ts` |
| WorkspaceDashboard response | Zod shape of the HTTP response, union of `data` payload and empty-state (`not_connected`, `no_teams`). Now carries `workspaceId`. | `frontend/src/modules/analytics/entities/workspace-dashboard/workspace-dashboard.response.schema.ts` |
| WorkflowConfig response | Zod shape of the HTTP response — `startedStatuses`, `completedStatuses`, `source`, `knownStatuses`. | `frontend/src/modules/analytics/entities/workflow-config/workflow-config.response.schema.ts` |
| DriftGrid entries | Per-workspace drift grid rows (teams × statuses). | `frontend/src/modules/analytics/entities/drift-grid/` |
| TeamCycles, CycleMetrics, BottleneckAnalysis, BlockedIssues, DriftingIssues, EstimationAccuracy, SprintReport, MemberDigest, MemberHealth, TeamSettings, WorkspaceLanguage (response ports) | HTTP gateway ports + response schemas consumed by the React layer. | `frontend/src/modules/analytics/entities/<name>/*.gateway.ts` + `*.response.schema.ts` |

> On the frontend, "entity" is a thin concept: a gateway port (abstract class) and a Zod response schema. Business logic lives on the backend.

---

## Policies and Business Rules (Purple)

### Backend rules

| Rule | Description | Source File |
|------|-------------|-------------|
| CycleCompletionRequired | Relaxed — both completed and in-progress cycles can produce metrics. | `backend/src/modules/analytics/entities/cycle-snapshot/cycle-snapshot.ts` |
| NoCycleIssuesGuard | A cycle without issues cannot produce metrics. | `backend/src/modules/analytics/entities/cycle-snapshot/cycle-snapshot.ts` |
| MinimumHistoryForTrend | Minimum 3 completed cycles required to display a velocity trend. | `backend/src/modules/analytics/usecases/calculate-cycle-metrics.usecase.ts` |
| ThresholdSeverityEscalation | warning if duration >= threshold, critical if duration >= 2x threshold. | `backend/src/modules/analytics/entities/status-threshold/status-threshold.ts` |
| DefaultThresholds | In Progress 48h, In Review 48h, Todo 72h. | `backend/src/modules/analytics/entities/status-threshold/status-threshold.ts` |
| PositiveThresholdOnly | Threshold must be strictly positive. | `backend/src/modules/analytics/entities/status-threshold/status-threshold.ts` |
| EstimationClassification | ratio > 2.0 = over-estimated, ratio < 0.5 = under-estimated, otherwise well estimated. | `backend/src/modules/analytics/entities/estimation-accuracy/estimation-accuracy.ts` |
| MinimumCyclesForPrediction | Minimum 2 completed cycles to enable predictions. | `backend/src/modules/analytics/usecases/predict-issue-duration.usecase.ts` |
| LowConfidenceThreshold | Fewer than 5 similar issues = low confidence. | `backend/src/modules/analytics/entities/duration-prediction/duration-prediction.ts` |
| SupportedLanguages | Only FR and EN supported for report generation. | `backend/src/modules/analytics/usecases/generate-sprint-report.usecase.ts` |
| ExcludedStatusesAutoResolve | When a status is excluded from tracking, active alerts for that status are auto-resolved. | `backend/src/modules/analytics/usecases/set-team-excluded-statuses.usecase.ts` |
| AlertSortOrder | Active alerts sorted by severity (critical first), then by decreasing duration. | `backend/src/modules/analytics/usecases/get-blocked-issues.usecase.ts` |
| WorkflowConfigAutoDetection | If no config exists, scan team's distinct transition status names against known patterns (case-insensitive): started = ["progress", "dev", "doing", "started", "in development"], completed = ["done", "completed", "closed", "shipped", "released"]. | `backend/src/modules/analytics/entities/workflow-config/workflow-status-patterns.ts` |
| WorkflowConfigFallback | When pattern matching finds zero matches, fall back to `["In Progress", "Started"]` / `["Done", "Completed"]`. | `backend/src/modules/analytics/entities/workflow-config/workflow-status-patterns.ts` |
| WorkflowConfigParameterization | Gateway methods receive startedStatuses/completedStatuses as parameters — resolved by `ResolveWorkflowConfigUsecase` before any call. | `backend/src/modules/analytics/entities/sprint-report/sprint-report-data.gateway.ts` |
| WorkflowStartedCompletedDisjoint (client contract) | A status name cannot be both `started` and `completed` at the same time when saving a manual configuration. Enforced by the UI; backend stores both lists independently. | `docs/specs/analytics/configure-workflow-statuses-ui.md` |
| WorkflowEmptyConfigAccepted | Saving an empty configuration (no started, no completed) is allowed — analytics display a guidance message instead. | `docs/specs/analytics/configure-workflow-statuses-ui.md` |
| MemberHealthMinimumHistory | Minimum 3 non-null values across cycles required to compute a trend indicator. | `backend/src/modules/analytics/entities/member-health/health-signal.ts` |
| MemberHealthIndicatorEscalation | 1 consecutive unfavorable change = orange, 2+ = red, stable/favorable = green. | `backend/src/modules/analytics/entities/member-health/health-signal.ts` |
| AssigneeRankingCompletedOnly | Aggregates only count issues whose current status is in the team's `completedStatuses`. Issues without assignees are skipped entirely (no synthetic bucket). | `backend/src/modules/analytics/interface-adapters/gateways/top-cycle-assignees-data.in-prisma.gateway.ts` (`getCycleAssigneeAggregates`) |
| AssigneeRankingSortByCount | Backend presenter sorts aggregates by `issueCount` desc, tiebreaker `assigneeName` alphabetical, then slices to top 5. | `backend/src/modules/analytics/interface-adapters/presenters/top-cycle-assignees.presenter.ts` |
| AssigneeCycleTimeFromTransitions | Per-issue cycle time computed from state transitions — first `started` (by `toStatusType` OR name in `startedStatuses`) to first `completed` (same dual-lookup). `null` when either boundary is missing or when `completedAt <= startedAt`. Aggregated cycle time is `null` until at least one issue contributes a finite value. | `backend/src/modules/analytics/interface-adapters/gateways/top-cycle-assignees-data.in-prisma.gateway.ts` (`computeCycleTimeInHours` + `accumulateCycleTime`) |
| NoActiveCycleShortCircuit | Both usecases (`GetTopCycleAssignees`, `GetCycleIssuesForAssignee`) return `{ status: 'no_active_cycle' }` when no cycle has `startsAt <= now < endsAt` — the `ResolveWorkflowConfigUsecase` is never invoked in this branch. | `backend/src/modules/analytics/usecases/get-top-cycle-assignees.usecase.ts`, `backend/src/modules/analytics/usecases/get-cycle-issues-for-assignee.usecase.ts` |
| **CycleThemeMinimumIssueThreshold** | A cycle must have at least 10 candidate issues before the AI is invoked for theme detection. Below threshold, the usecase returns `{ status: 'below_threshold', issueCount }` and never calls the AI provider. | `backend/src/modules/analytics/usecases/detect-cycle-themes.usecase.ts` (`MINIMUM_ISSUES_FOR_THEME_DETECTION = 10`) |
| **CycleThemeCacheTtl** | A `CycleThemeSet` is considered fresh for 24 hours from its `generatedAt` timestamp. Beyond that, the next `DetectCycleThemes` invocation triggers a refresh. | `backend/src/modules/analytics/usecases/detect-cycle-themes.usecase.ts` (`CACHE_TTL_MILLISECONDS`) + `CycleThemeSet.isCachedWithin` |
| **CycleThemeManualRefreshInvalidatesCache** | When the controller receives `?refresh=true`, the cached `CycleThemeSet` for the active cycle is deleted BEFORE the AI call, guaranteeing a fresh generation even if the cache was still within TTL. | `backend/src/modules/analytics/usecases/detect-cycle-themes.usecase.ts` (L.69-71) + `cycle-themes.controller.ts` (`isTruthyString`) |
| **CycleThemeLanguageMirrorsWorkspace** | The generation language is derived from `WorkspaceSettingsGateway.getLanguage()` — normalized to `EN` or `FR`. The language is persisted on the `CycleThemeSet` and returned in the presenter DTO, so later cached responses retain the language of the moment they were generated (even if the user switched workspace language since). | `backend/src/modules/analytics/usecases/detect-cycle-themes.usecase.ts` (L.105-107 + L.133-139) |
| **CycleThemeAggregationScopedToCurrentIssues** | Theme aggregates (`issueCount`, `totalPoints`, `totalCycleTimeInHours`) are recomputed at every call from the LIVE `getCycleIssuesForThemeDetection` snapshot — NOT from the cached AI output. Consequence: points/time stay up-to-date between cache refreshes even though the theme→issue mapping stays frozen; an issue removed from the cycle after theme generation simply disappears from aggregates. `issueCount` on the aggregate uses the cached list length (intentional — reflects the AI's clustering, not the filtered live count). | `backend/src/modules/analytics/usecases/detect-cycle-themes.usecase.ts` (`aggregateThemes`) |
| **CycleThemeAiResponseParsing** | The AI response is parsed with a greedy regex `\{[\s\S]*\}`. If no JSON block is found, the usecase throws a plain `Error` (NOT a `BusinessRuleViolation`). The `themes` key is tolerated as absent or non-array → `rawThemes = []`, which then fails `cycleThemeSetGuard` (Zod `min(1)` on themes) before any cache write. | `backend/src/modules/analytics/usecases/detect-cycle-themes.usecase.ts` (L.123-139) |
| **CycleThemeCountBoundaries** | `CycleThemeSet` schema enforces 1 to 5 themes; each theme name is 1-60 chars and has at least one issue external id. Validation happens at `CycleThemeSet.create` — the AI is re-prompted with "at most 5 themes" but boundary enforcement is client-side on the backend. | `backend/src/modules/analytics/entities/cycle-theme-set/cycle-theme-set.schema.ts` (`MIN_THEMES = 1`, `MAX_THEMES = 5`) |
| **CycleThemeProviderDefault** | Controller defaults to `Anthropic` when `?provider=` is missing or does not match `OpenAI` / `Anthropic` / `Ollama`. Unknown values silently fall back without an error. | `backend/src/modules/analytics/interface-adapters/controllers/cycle-themes.controller.ts` (`resolveProvider`) |
| **CycleThemeDrillDownLookupByName** | `GetCycleIssuesForTheme` looks up a theme by exact `name` match (case-sensitive). A stale client URL (theme renamed between cache entries) produces `{ status: 'theme_not_found' }`. | `backend/src/modules/analytics/usecases/get-cycle-issues-for-theme.usecase.ts` (L.47-52) |
| **AiUnavailableNeverPoisonsCache** | When the AI provider fails with `AiProviderUnavailableError`, the usecase returns `{ status: 'ai_unavailable' }` WITHOUT writing to the cache, so the next call will retry. Any OTHER error bubbles up unchanged (controller then returns 500 via global filters). | `backend/src/modules/analytics/usecases/detect-cycle-themes.usecase.ts` (L.116-121) |

### Frontend rules (client-side presentation policies)

| Rule | Description | Source File |
|------|-------------|-------------|
| **TeamSelectionAlphabeticalDefault** | On first dashboard visit with no persisted selection, the team whose name comes first alphabetically (locale-aware) is selected. | `frontend/src/modules/analytics/interface-adapters/presenters/dashboard.presenter.ts` (`resolveSelectedTeamId`) |
| **TeamSelectionRestoreIfStillExists** | On mount, persisted `teamId` is honored only if the referenced team is present in the current dashboard payload. | `frontend/src/modules/analytics/interface-adapters/presenters/dashboard.presenter.ts` |
| **TeamSelectionStaleFallback** | If the persisted team no longer exists, fall back to the alphabetical default. | `frontend/src/modules/analytics/interface-adapters/presenters/dashboard.presenter.ts` |
| **WorkspaceScopedPersistence** | Selection is stored in `localStorage` keyed by `shiplens.selectedTeamId:${workspaceId}` — switching workspace gives a clean slate. | `frontend/src/modules/analytics/interface-adapters/gateways/team-selection.in-localstorage.gateway.ts` |
| **FireAndForgetSelectionPersistence** | On click, UI state updates synchronously; persistence happens asynchronously and its failure is swallowed to preserve UX. | `frontend/src/modules/analytics/interface-adapters/hooks/use-dashboard.ts` (l.65-76) |
| **EmptyTeamsZeroSelection** | When `teams.length === 0`, `selectedTeamId` is `null` and the dashboard shows the translated empty-teams guidance in place of the cards. | `frontend/src/modules/analytics/interface-adapters/presenters/dashboard.presenter.ts` |
| **HealthTierRanking** | Team card health tier: `danger` if any blocked alert OR completion < 30, `warning` if 30 <= completion < 60, `healthy` if completion >= 60, `idle` when no active cycle. | `frontend/src/modules/analytics/interface-adapters/presenters/dashboard.presenter.ts` (`computeHealthTier`) |
| **DashboardEmptyStateDiscrimination** | The HTTP response carries a discriminated union: either the data payload or `{ status: 'not_connected' | 'no_teams', message }`. The hook branches accordingly before invoking the presenter. | `frontend/src/modules/analytics/entities/workspace-dashboard/workspace-dashboard.response.schema.ts` |
| **SemanticBooleansOnViewModel** | Views never compare values — presenters expose booleans like `showEmptyTeamsMessage`, `hasSyncHistory`, `isLate`, `isSelected`. | project rule `no-logic-in-views.sh` hook + `dashboard.view-model.schema.ts` |
| **AssigneeRankingMetricClientSort** | Frontend presenter resorts the response by active metric (`count` / `points` / `time`) before slicing top 5 — the backend's count-based ordering is re-applied if user toggles back to `count`, but `points` and `time` views require a local sort. Alphabetical tiebreaker on assignee name. | `frontend/src/modules/analytics/interface-adapters/presenters/top-cycle-assignees.presenter.ts` (`sortByActiveMetric`) |
| **AssigneeTimeMetricFallbackZero** | When sorting by `time`, assignees with `totalCycleTimeInHours === null` are coerced to `0` for ordering (ranked last) but rendered with `-` in the drawer. Metric label uses `formatDurationHours` with a `daysSuffix` beyond 72h. | `frontend/src/modules/analytics/interface-adapters/presenters/top-cycle-assignees.presenter.ts` (`metricValue`, `metricValueLabel`) |
| **AssigneeHookStateResetOnTeamSwitch** | `useTopCycleAssignees` resets `activeMetric` to `'count'` and `selectedAssigneeName` to `null` whenever `teamId` changes — prevents drawer leaking across teams. | `frontend/src/modules/analytics/interface-adapters/hooks/use-top-cycle-assignees.ts` (`useEffect([teamId])`) |
| **AssigneeSectionHiddenWhenNoTeam** | `TopCycleAssigneesSectionView` returns `null` when `teamId` is `null` — the aside column is empty on empty-teams dashboards. | `frontend/src/modules/analytics/interface-adapters/views/top-cycle-assignees/top-cycle-assignees-section.view.tsx` |
| **AssigneeDrawerRendersCycleTime** | Drawer rows for assignees include `cycleTimeLabel` (always rendered). Distinct from the project drawer, which omits `cycleTimeLabel` entirely because the shared `CycleInsightDrawerIssueRowView` treats it as optional. | `frontend/src/modules/analytics/interface-adapters/presenters/cycle-assignee-issues-drawer.presenter.ts` + `views/cycle-insight-drawer/cycle-insight-drawer-issue-row.view.tsx` |

---

## Presenters (Green)

### Backend presenters

| Presenter | Exposed Data | File |
|-----------|--------------|------|
| CycleMetricsPresenter | Velocity, throughput, completion, scope creep, cycle time, lead time, trend | `backend/src/modules/analytics/interface-adapters/presenters/cycle-metrics.presenter.ts` |
| SprintReportPresenter | Executive summary, trends, highlights, risks, recommendations | `backend/src/modules/analytics/interface-adapters/presenters/sprint-report.presenter.ts` |
| BlockedIssuesPresenter | Blocked issues with severity, duration, Linear URL | `backend/src/modules/analytics/interface-adapters/presenters/blocked-issues.presenter.ts` |
| AlertHistoryPresenter | Alert history | `backend/src/modules/analytics/interface-adapters/presenters/alert-history.presenter.ts` |
| BottleneckAnalysisPresenter | Time distribution per status, bottleneck, breakdown per assignee | `backend/src/modules/analytics/interface-adapters/presenters/bottleneck-analysis.presenter.ts` |
| EstimationAccuracyPresenter | Ratio per issue, scores per dev/label/team, classification | `backend/src/modules/analytics/interface-adapters/presenters/estimation-accuracy.presenter.ts` |
| DurationPredictionPresenter | Optimistic/probable/pessimistic prediction, confidence, similar issue count | `backend/src/modules/analytics/interface-adapters/presenters/duration-prediction.presenter.ts` |
| WorkspaceDashboardPresenter | **Now also exposes `workspaceId`** (sourced from `LinearWorkspaceConnection`) + overview of all teams, velocity trend, sync status | `backend/src/modules/analytics/interface-adapters/presenters/workspace-dashboard.presenter.ts` |
| TeamCyclesPresenter | Team cycle list | `backend/src/modules/analytics/interface-adapters/presenters/team-cycles.presenter.ts` |
| CycleIssuesPresenter | Cycle issues | `backend/src/modules/analytics/interface-adapters/presenters/cycle-issues.presenter.ts` |
| ReportHistoryPresenter | Generated report history | `backend/src/modules/analytics/interface-adapters/presenters/report-history.presenter.ts` |
| ReportDetailPresenter | Specific report detail | `backend/src/modules/analytics/interface-adapters/presenters/report-detail.presenter.ts` |
| MemberHealthPresenter | 5 health signals per member with indicator color, trend direction, last value | `backend/src/modules/analytics/interface-adapters/presenters/member-health.presenter.ts` |
| WorkflowConfigPresenter | startedStatuses, completedStatuses, source, **knownStatuses** (distinct transition status names observed in history) | `backend/src/modules/analytics/interface-adapters/presenters/workflow-config.presenter.ts` |
| DriftingIssuesPresenter | Drifting issues with drift status, elapsed time, budget | `backend/src/modules/analytics/interface-adapters/presenters/drifting-issues.presenter.ts` |
| TopCycleAssigneesPresenter | Sorts aggregates by `issueCount` desc, tiebreaker alphabetical, slices to top 5 rows (`assigneeName`, `issueCount`, `totalPoints`, `totalCycleTimeInHours`). Returns `no_active_cycle` or `ready` DTO. | `backend/src/modules/analytics/interface-adapters/presenters/top-cycle-assignees.presenter.ts` |
| CycleAssigneeIssuesPresenter | Maps backend domain issues to drawer DTO rows (externalId, title, points, cycle time in hours, status name). | `backend/src/modules/analytics/interface-adapters/presenters/cycle-assignee-issues.presenter.ts` |
| **CycleThemesPresenter** | Discriminated union DTO: `no_active_cycle` \| `below_threshold` (with `issueCount`) \| `ai_unavailable` \| `ready` (with `cycleId`, `cycleName`, `language`, `themes[]`, `fromCache`). Sorts themes by `issueCount` desc, alphabetical tiebreaker on `name`. Does NOT slice — all 1-5 themes are returned. | `backend/src/modules/analytics/interface-adapters/presenters/cycle-themes.presenter.ts` |
| **CycleThemeIssuesPresenter** | Discriminated union DTO: `no_active_cycle` \| `theme_not_found` \| `ready` (with `cycleId`, `cycleName`, `themeName`, `issues[]`). Maps each `ThemeIssueDetail` to a drawer row (externalId, title, assigneeName, points, statusName, linearUrl). Preserves AI's issue order for a theme (no resort). | `backend/src/modules/analytics/interface-adapters/presenters/cycle-theme-issues.presenter.ts` |

### Frontend presenters (domain response → ViewModel)

| Presenter | Exposed Data | File |
|-----------|--------------|------|
| **DashboardPresenter** | `teams` (array of active/idle `TeamCardViewModel` with `isSelected`), `synchronization` (semantic labels), `selectedTeamId`, `showEmptyTeamsMessage`, `emptyTeamsMessage`. Resolves the default selection (alphabetical / persisted / stale-fallback) in `resolveSelectedTeamId`. | `frontend/src/modules/analytics/interface-adapters/presenters/dashboard.presenter.ts` |
| SettingsPresenter | Breadcrumbs, language section, team selector, timezone section, excluded-statuses section, drift-grid section, **workflow-config section** (rows tagged started/completed/not_tracked, source badge, save enabled when pending), toast. | `frontend/src/modules/analytics/interface-adapters/presenters/settings.presenter.ts` |
| CycleMetricsPresenter | Velocity/throughput/completion/scope-creep KPIs + trend badge | `frontend/src/modules/analytics/interface-adapters/presenters/cycle-metrics.presenter.ts` |
| BottleneckAnalysisPresenter | Bottleneck chart data, median-per-status | `frontend/src/modules/analytics/interface-adapters/presenters/bottleneck-analysis.presenter.ts` |
| BlockedIssuesPresenter | Blocked-issue list | `frontend/src/modules/analytics/interface-adapters/presenters/blocked-issues.presenter.ts` |
| EstimationAccuracyPresenter | Estimation ratio table, classification tags | `frontend/src/modules/analytics/interface-adapters/presenters/estimation-accuracy.presenter.ts` |
| DriftingIssuesPresenter | Drift rows + status tags | `frontend/src/modules/analytics/interface-adapters/presenters/drifting-issues.presenter.ts` |
| AiReportPresenter | Sprint report sections with generation state | `frontend/src/modules/analytics/interface-adapters/presenters/ai-report.presenter.ts` |
| MemberDigestPresenter | Per-member digest with history | `frontend/src/modules/analytics/interface-adapters/presenters/member-digest.presenter.ts` |
| MemberHealthTrendsPresenter | 5 health signals per member + trend arrows | `frontend/src/modules/analytics/interface-adapters/presenters/member-health-trends.presenter.ts` |
| MemberFilterPresenter | Team-member dropdown options | `frontend/src/modules/analytics/interface-adapters/presenters/member-filter.presenter.ts` |
| CycleReportShellPresenter | Nav chrome (breadcrumbs, tab title, resync link) for the cycle report page | `frontend/src/modules/analytics/interface-adapters/presenters/cycle-report-shell.presenter.ts` |
| **TopCycleAssigneesPresenter (frontend)** | `TopCycleAssigneesViewModel` for the ranking card — sorts assignees by active metric (`count` / `points` / `time`) with alphabetical tiebreaker, slices top 5, emits semantic booleans (`showRows`, `showEmptyMessage`). Takes `activeMetric` as constructor param so the hook memoizes per-metric. | `frontend/src/modules/analytics/interface-adapters/presenters/top-cycle-assignees.presenter.ts` |
| **CycleAssigneeIssuesDrawerPresenter** | Four-state discriminated ViewModel for the drill-down drawer (`closed` / `loading` / `error` / `ready`). Produces `CycleAssigneeIssueRowViewModel` rows (title, pointsLabel, cycleTimeLabel, statusName, linearUrl, linearLinkLabel) — cycle time always rendered (distinct from project drawer which omits it). | `frontend/src/modules/analytics/interface-adapters/presenters/cycle-assignee-issues-drawer.presenter.ts` |

---

## Gateways and External Systems (White)

### Backend

| System | Interaction | Gateway |
|--------|-------------|---------|
| Prisma (SQLite) | Read synchronized data, persist alerts, thresholds, reports, workflow configs | `backend/src/modules/analytics/interface-adapters/gateways/*.in-prisma.gateway.ts` |
| AI Provider (OpenAI / Anthropic / Ollama) | Text generation for sprint reports and digests | `backend/src/modules/analytics/interface-adapters/gateways/ai-text-generator.with-provider.gateway.ts` (port `AiTextGeneratorGateway`) |
| Claude CLI (fallback) | Text generation via Claude CLI if no Anthropic API key | `backend/src/modules/analytics/interface-adapters/gateways/ai-text-generator.with-claude-cli.gateway.ts` |
| Filesystem | Team settings (excluded statuses), workspace settings (language) | `backend/src/modules/analytics/interface-adapters/gateways/team-settings.in-file.gateway.ts`, `workspace-settings.in-file.gateway.ts` |
| Prisma (`TeamWorkflowConfig`) | Persist and retrieve auto-detected or manually-set workflow configs per team | `backend/src/modules/analytics/interface-adapters/gateways/workflow-config.in-prisma.gateway.ts` |
| Prisma (distinct transition statuses) | Read the set of status names observed in historical state transitions for a team | `backend/src/modules/analytics/interface-adapters/gateways/available-statuses.in-prisma.gateway.ts` |
| **Prisma (Cycle / Issue / Label / StateTransition)** | Locate the active cycle for a team and fetch its candidate issues for theme detection (title, labels resolved via `Label.externalId → name`, status, points, assignee, per-issue cycle time computed from `started` + `completed` transitions — same dual-lookup-by-status-type as the assignees widget, minus the status-name fallback). Returns `linearUrl: null` for now. | `backend/src/modules/analytics/interface-adapters/gateways/cycle-theme-set-data.in-prisma.gateway.ts` |
| **In-memory (process-local)** | Per-cycle `CycleThemeSet` cache — plain `Map<cycleId, CycleThemeSet>` inside a singleton NestJS provider. Lost on process restart; not shared across instances. | `backend/src/modules/analytics/interface-adapters/gateways/cycle-theme-set-cache.in-memory.gateway.ts` |

### Frontend

| System | Interaction | Gateway |
|--------|-------------|---------|
| Backend HTTP API (`/dashboard`, `/analytics/...`, etc.) | All business data exchanges with the NestJS app | `frontend/src/modules/analytics/interface-adapters/gateways/*.in-http.gateway.ts` |
| **Browser localStorage** | Per-workspace persistence of the selected team — keyed by `shiplens.selectedTeamId:${workspaceId}` | `frontend/src/modules/analytics/interface-adapters/gateways/team-selection.in-localstorage.gateway.ts` |

---

## Relations with Other Bounded Contexts

| Related BC | Pattern (Vaughn Vernon) | Direction | Detail |
|------------|-------------------------|-----------|--------|
| Synchronization (backend) | **Published Language (via DB)** | Synchronization (Upstream) → Analytics (Downstream) | Analytics reads synchronized issues, cycles, transitions via its own Prisma gateways. No Synchronization code import. |
| Audit (backend) | **Customer-Supplier** | Audit (Supplier) → Analytics (Customer) | `GenerateSprintReportUsecase` directly imports `AuditRuleGateway`, `AuditRule`, `CycleMetrics`, `ChecklistItemGateway` from the Audit module. `AnalyticsModule` imports `AuditModule`. |
| Notification (backend) | **Customer-Supplier** | Analytics (Supplier) → Notification (Customer) | Analytics exports `SprintReportGateway`. Notification imports it via `AnalyticsModule` to access reports for Slack delivery. |
| Identity (backend) | **Customer-Supplier** | Identity (Supplier) → Analytics (Customer) | `GetWorkspaceDashboardUsecase` injects `LinearWorkspaceConnectionGateway` from Identity to expose the `workspaceId` in the dashboard payload. `AnalyticsModule` imports `IdentityModule`. |
| Synchronization (frontend) | **Customer-Supplier** | Synchronization (Supplier) → Analytics (Customer) | `use-sync-orchestrator`, `ListAvailableTeams`, `DiscoverSyncTeams`, etc. are exposed by the Sync BC via `frontend/src/main/dependencies.ts` and consumed directly by Analytics hooks (dashboard auto-sync, settings team selector). |
| Analytics front ↔ Analytics back | **Customer-Supplier via Published Language (HTTP)** | Backend (Supplier) → Frontend (Customer) | Every frontend HTTP gateway parses a Zod response schema mirroring the backend DTO. The contract is the DTO schema (e.g. `WorkflowConfigDto` ↔ `workflowConfigResponseSchema`). |

---

## Ubiquitous Language (BC-scoped)

| Term | Definition in this BC | Notes |
|------|----------------------|-------|
| Velocity | Ratio between completed points and planned points | shared |
| Throughput | Total number of issues completed in the cycle | shared |
| Cycle time | Duration between moving to in-progress (`startedAt`) and completion (`completedAt`) | shared |
| Lead time | Duration between creation and completion of an issue | shared |
| Scope creep | Issues added after cycle start | shared |
| Blocked issue | Issue staying in a status beyond the configured threshold | shared |
| Bottleneck | Status where issues spend the most time by median | shared |
| Accuracy score | Measure of the gap between estimation and reality via points/days ratio | shared |
| Prediction | Calculated estimate of probable duration based on history | shared |
| Confidence interval | Trio of P25/P50/P75 values framing the predicted duration | shared |
| Workflow configuration | Per-team mapping defining which status names correspond to "started" and "completed" | shared |
| Started status | Status name marking the beginning of active work on an issue | shared |
| Completed status | Status name marking the end of work on an issue | shared |
| Hybrid resolution | Three-tier strategy: manual override > pattern matching > hardcoded fallback | shared |
| Health signal | One of 5 per-member metrics tracked over cycles with trend direction and severity color | shared |
| Drifting issue | In-progress issue exceeding its expected business-hours budget | shared |
| **Team selection** | Per-workspace state identifying which team's data is currently focused on the dashboard | new — frontend-only concept |
| **Workspace-scoped persistence** | Local-storage entry keyed by workspace identifier so switching workspaces yields a clean slate | new — frontend-only concept |
| **Known statuses** | Distinct status names observed in a team's state-transition history; the settings UI tags each one `started`, `completed`, or `not tracked` | new — backend + frontend |
| **Workflow status tag** | UI tag applied to a known status: `started`, `completed`, or `not tracked` | new — frontend-only |
| **Source badge** | UI badge on the workflow section showing whether the current config is `auto-detected` or `manual` | new — frontend-only |
| **Top cycle assignees** | Ranking of the top 5 assignees of the selected team's active cycle by chosen metric (count / points / cycle time) — second widget of the dashboard right-side column | new — backend + frontend |
| **Completed work** | The subset of cycle issues whose current status is listed in the team's `completedStatuses` — the universe used for the assignee ranking (unlike `top cycle projects` which ranks all cycle issues) | new — backend + frontend |
| **Unassigned issues** | Cycle issues whose `assigneeName` is `null` — excluded from the assignee ranking (no "No assignee" bucket) | new — backend-only policy |
| **Cycle theme** | AI-inferred semantic cluster of issues of the active cycle, grouped by similarity of title and labels. 1 to 5 themes per cycle, short name (1-3 words), each backed by a non-empty list of `issueExternalIds`. | new — backend (frontend UI pending) |
| **Theme cache** | Per-cycle in-memory memo of the AI-generated `CycleThemeSet`, valid for 24 hours from `generatedAt`. Avoids calling the AI provider on every dashboard view of the themes widget. | new — backend-only |
| **Manual refresh** | User-triggered bypass of the theme cache via `?refresh=true` on the themes endpoint. Deletes the cached entry before re-running the AI, guaranteeing a fresh generation even within TTL. | new — backend + future frontend button |
| **Candidate issue (themes)** | Cycle issue passed to the AI prompt: `{ externalId, title, labels, points, statusName, assigneeName, totalCycleTimeInHours, linearUrl }`. All cycle issues are candidates — NO completed-status filter (unlike the assignees widget). | new — backend-only |
| **Theme aggregate** | Runtime computation combining the AI's `theme → issueExternalIds[]` mapping with the LIVE candidate-issue snapshot to produce `{ name, issueCount, totalPoints, totalCycleTimeInHours, issueExternalIds }` per theme. `issueCount` uses the cached count; `totalPoints` / `totalCycleTimeInHours` use the live snapshot. | new — backend-only |
| **AI provider unavailable (themes)** | Discriminated status returned by `DetectCycleThemes` when `AiTextGeneratorGateway.generate` throws `AiProviderUnavailableError`. The cache is NOT touched, so the next call retries the provider. | new — backend-only |
| **Below threshold (themes)** | Discriminated status returned by `DetectCycleThemes` when the active cycle has fewer than 10 candidate issues. AI is never invoked; the count is surfaced to the client so the UI can explain the refusal. | new — backend-only |

---

## Hot Spots (Pink)

| Problem | Severity | Detail |
|---------|----------|--------|
| Direct coupling Analytics → Audit (relative import) | high | `GenerateSprintReportUsecase` directly imports internal files from the Audit module via a relative path (`../../audit/entities/...`). Violates BC boundary even though `AnalyticsModule` declares `AuditModule`. An Anti-Corruption Layer or a port in Analytics would be cleaner. |
| TeamSettings persisted in filesystem | medium | `team-settings.in-file.gateway.ts` uses the filesystem while almost everything else uses Prisma. Inconsistency that breaks multi-instance deployments. |
| Fragile JSON parsing of AI response | medium | `GenerateSprintReportUsecase` parses the AI response JSON with a regex `\{[\s\S]*\}` — breaks if the AI response contains multiple JSON objects or an unexpected format. |
| Very large module (backend) | high | 25+ usecases, 16 presenters, 12+ entities, 20+ gateways on the backend. The BC does the work of 5-7 sub-domains (Metrics, Reporting, Alerting, Estimation, Dashboard, MemberHealth, WorkflowConfig). Splitting would improve cohesion. |
| `useDashboard` carries two selection states | medium | `selectionOverride` (in-memory click) + `persistedTeamId` (loaded asynchronously) are merged at render via `selectionOverride ?? persistedTeamId`. Works today but becomes brittle as soon as a second widget needs to react to selection changes. A small reducer or a dedicated hook will be wanted when downstream widgets land. |
| No Context / pub-sub for selected team | medium | Downstream dashboard widgets (`show-top-cycle-projects`, `-epics`, `-assignees`, `detect-cycle-themes-with-ai`) will need the current `selectedTeamId` as input. Today `DashboardView` would have to prop-drill it. YAGNI until the second consumer ships — flagged to revisit before shipping the third. |
| Backend dashboard payload carries `workspaceId` sourced from Identity | low | `GetWorkspaceDashboardUsecase` now depends on `LinearWorkspaceConnectionGateway` purely to expose `workspaceId` to the frontend. Pragmatic shortcut for per-workspace client storage; clean but worth revisiting if a second feature needs the workspace id. |
| Fire-and-forget persistence hides storage errors | low | Intentional UX choice (UX responsiveness > toast on quota exceeded), but users on restricted browsers will never learn their selection is not persisted. Acceptable for now. |
| Frontend has no end-to-end browser test for team selection | medium | Only unit tests cover the presenter + hook + gateways. A Playwright scenario would catch regressions around localStorage isolation between workspaces (key already broken once during refactor). |
| Shared `CycleInsightDrawerIssueRowView` is growing optional props | medium | Already accepts optional `cycleTimeLabel` (assignees need it, projects do not) and optional `assigneeLabel` (projects need it, assignees do not). Two more upcoming widgets (top epics, cycle themes) will push more optional fields. Flag to monitor — when a 4th optional prop appears, split into two row components or introduce a slot-based API. |
| Frontend presenter re-sorts a backend-sorted list | low | The backend `TopCycleAssigneesPresenter` sorts by `issueCount` desc and slices to top 5. The frontend then re-sorts the same list by the user's active metric (`count`/`points`/`time`). This is correct for `points`/`time` but redundant for `count`. Could become stale if the backend's top-5 cut excludes an assignee that would rank higher on `points` or `time`. Today the cut is 5 so the impact is bounded; worth revisiting if the cut grows or if metrics diverge further. |
| `useTopCycleAssignees` duplicates hook shape of `useTopCycleProjects` | low | Both hooks follow the same structure: two React Query queries, three `useCallback` handlers, AsyncState derivation, drawer input discriminated union. With a 3rd (epics) and 4th (themes) widget coming, consider extracting a `useInsightWidget<TRanking, TDrawer>` helper. YAGNI until the 3rd widget lands. |
| **In-memory theme cache does not survive restart** | medium | `CycleThemeSetCacheInMemoryGateway` holds themes in a process-local `Map`. A NestJS restart wipes every team's themes — next dashboard view pays the full AI latency. Not multi-instance safe either (each replica has its own map). Move to Prisma / Redis before horizontal scale, or before SSR/edge runtime. |
| **AiProviderUnavailableError is a `BusinessRuleViolation`** | medium | `AiProviderUnavailableError extends BusinessRuleViolation` (from `sprint-report.errors.ts`) — so infrastructure unavailability is modeled as a domain invariant. The themes usecase catches it to return `ai_unavailable`, but any caller forgetting to catch it will surface a 422 to the user instead of a 503. Hierarchy mis-classification worth revisiting across the AI-powered features. |
| **`InsufficientIssuesForThemeDetectionError` is dead code** | low | Declared in `cycle-theme-set.errors.ts` but nobody throws it — the usecase returns a `below_threshold` status instead. Either delete the class or adopt a consistent error-vs-status pattern for soft business refusals. |
| **Fragile JSON parsing (themes)** | medium | Same `\{[\s\S]*\}` regex as `GenerateSprintReport`. Breaks if the AI wraps its output in prose with multiple braces or emits nested JSON. The failure is a plain `Error` (not `BusinessRuleViolation` / `GatewayError`), so it reaches the user as an HTTP 500 via the global filter. |
| **Theme name is the drill-down key** | medium | `GET /analytics/cycle-themes/:teamId/themes/:themeName/issues` uses the theme name verbatim as the URL segment. Non-ASCII names (FR themes: "Sécurité & OAuth") need URL-encoding discipline on the future frontend. Any theme rename (manual edit, AI re-gen producing a different label) orphans an in-flight drawer query with `theme_not_found`. A stable theme id would be safer. |
| **Theme cache coupled to `cycleId` only** | low | Cache key is `cycleId` — team and language are stored in the cached `CycleThemeSet` but not part of the key. Today OK (a cycle belongs to exactly one team and one language), but a workspace-language flip mid-cycle persists in the cached language until TTL. Low-impact; flagged. |
| **No frontend projection yet** | low | Backend ships the full vertical (entity + 2 usecases + 2 presenters + controller + 2 endpoints). The React side is not implemented — no `in-http` gateway, no hook, no view. This BC's session will revisit when the widget lands under the dashboard right-side column (following the walking skeleton set by top-projects / top-assignees). |

---

## Frontend Projections (Client-side)

| Feature / Route | Hook | Presenter | View(s) | Consumes (usecases / entities) | Source files |
|-----------------|------|-----------|---------|--------------------------------|--------------|
| `/` (Dashboard) | `useDashboardPage` → `useDashboard` + `useSyncOrchestrator` | `DashboardPresenter` | `DashboardView`, `DashboardLoadingStateView`, `DashboardErrorStateView`, `DashboardEmptyStateView`, `DashboardEmptyTeamsView`, `TeamCardView`, `TeamCardIdleView`, `TeamSelectionCheckmarkView`, `CompletionRingView`, `SyncStatusBarView` | `getWorkspaceDashboard`, `getPersistedTeamSelection`, `persistTeamSelection`, sync usecases | `frontend/src/modules/analytics/interface-adapters/hooks/use-dashboard.ts`, `use-dashboard-page.ts`, `interface-adapters/presenters/dashboard.presenter.ts`, `interface-adapters/views/dashboard.view.tsx`, `views/team-card/*.view.tsx` |
| `/cycle-report?teamId=...&cycleId=...` | `useCycleReportPage` + `useCycleReportShell` + `useCycleReportUrlState` | `CycleReportShellPresenter` + per-section presenters | `CycleReportView` (+ per-section views under `views/cycle-report/`, `views/cycle-metrics/`, `views/bottleneck-analysis/`, `views/blocked-issues/`, `views/estimation-accuracy/`, `views/drifting-issues/`, `views/ai-report/`) | `listTeamCycles`, `getCycleMetrics`, `getBottleneckAnalysis`, `listBlockedIssues`, `getEstimationAccuracy`, `listDriftingIssues`, `listSprintReports`, `getSprintReportDetail`, `generateSprintReport` | `frontend/src/modules/analytics/interface-adapters/hooks/use-cycle-report-*.ts`, corresponding presenters and views |
| `/settings` | `useSettings` | `SettingsPresenter` | `SettingsView` → `SettingsReadyView`, `SettingsLanguageSectionView`, `SettingsTeamSelectorView`, `SettingsTimezoneSectionView`, `SettingsExcludedStatusesSectionView`, `SettingsDriftGridSectionView`, `SettingsStatusToggleView`, `SettingsToastView` (+ workflow section rendered from ViewModel) | `getWorkspaceLanguage`, `setWorkspaceLanguage`, `listAvailableTeams`, `getTeamTimezone`, `setTeamTimezone`, `getTeamStatusSettings`, `setTeamExcludedStatuses`, `getDriftGridEntries`, `getTeamWorkflowConfig`, `setTeamWorkflowConfig` | `frontend/src/modules/analytics/interface-adapters/hooks/use-settings.ts`, `interface-adapters/presenters/settings.presenter.ts`, `views/settings/*.view.tsx` |
| Member health trends | `useMemberHealthTrends` | `MemberHealthTrendsPresenter` | `views/member-health-trends/*.view.tsx` | `getMemberHealth` | `frontend/src/modules/analytics/interface-adapters/hooks/use-member-health-trends.ts` |
| Member digest | `useMemberDigest` | `MemberDigestPresenter` + `MemberFilterPresenter` | `views/member-digest/*.view.tsx`, `views/member-filter/*.view.tsx` | `generateMemberDigest` | `frontend/src/modules/analytics/interface-adapters/hooks/use-member-digest.ts` |
| Dashboard widget: Top cycle assignees (right-side column, below top projects) | `useTopCycleAssignees` | `TopCycleAssigneesPresenter (frontend)` + `CycleAssigneeIssuesDrawerPresenter` | `TopCycleAssigneesSectionView`, `TopCycleAssigneesReadyView`, `TopCycleAssigneesLoadingView`, `TopCycleAssigneesErrorView`, `TopCycleAssigneesDrawerView` + shared shells (`CycleInsightCardView`, `CycleInsightMetricToggleView`, `CycleInsightRankingRowView`, `CycleInsightEmptyStateView`, `CycleInsightDrawerView`, `CycleInsightDrawerIssueRowView`) | `getTopCycleAssignees`, `listCycleAssigneeIssues` | `frontend/src/modules/analytics/interface-adapters/hooks/use-top-cycle-assignees.ts`, `interface-adapters/presenters/top-cycle-assignees.presenter.ts`, `presenters/cycle-assignee-issues-drawer.presenter.ts`, `views/top-cycle-assignees/*.view.tsx` |

---

## Frontend HTTP Dependencies

| Frontend gateway | Calls backend endpoint | Produces / expects |
|------------------|------------------------|--------------------|
| `workspace-dashboard.in-http.gateway.ts` | `GET /dashboard/data` | `WorkspaceDashboardDataResponse \| { status, message }` |
| `team-cycles.in-http.gateway.ts` | `GET /analytics/teams/:teamId/cycles` | `TeamCyclesResponse` |
| `cycle-metrics.in-http.gateway.ts` | `GET /analytics/cycles/:cycleId/metrics` | `CycleMetricsResponse` |
| `bottleneck-analysis.in-http.gateway.ts` | `GET /analytics/cycles/:cycleId/bottlenecks` | `BottleneckAnalysisResponse` |
| `blocked-issues.in-http.gateway.ts` | `GET /analytics/teams/:teamId/blocked-issues` | `BlockedIssuesResponse` |
| `estimation-accuracy.in-http.gateway.ts` | `GET /analytics/cycles/:cycleId/estimation-accuracy` | `EstimationAccuracyResponse` |
| `drifting-issues.in-http.gateway.ts` | `GET /analytics/teams/:teamId/drifting-issues` | `DriftingIssuesResponse` |
| `sprint-report.in-http.gateway.ts` | `GET/POST /analytics/reports[...]` | `SprintReportResponse` |
| `member-digest.in-http.gateway.ts` | `POST /analytics/teams/:teamId/member-digest` | `MemberDigestResponse` |
| `member-health.in-http.gateway.ts` | `GET /analytics/teams/:teamId/member-health` | `MemberHealthResponse` |
| `workspace-language.in-http.gateway.ts` | `GET/PUT /analytics/workspace-language` | `WorkspaceLanguageResponse` |
| `team-settings.in-http.gateway.ts` | `GET/PUT /analytics/teams/:teamId/timezone`, `GET/PUT /analytics/teams/:teamId/excluded-statuses` | `TeamSettingsResponse` |
| `drift-grid.in-http.gateway.ts` | `GET /analytics/drift-grid` | `DriftGridResponse` |
| **`workflow-config.in-http.gateway.ts`** | `GET/PUT /analytics/teams/:teamId/workflow-config` | `WorkflowConfigResponse` (includes `knownStatuses`) |
| **`top-cycle-assignees.in-http.gateway.ts`** | `GET /analytics/top-cycle-assignees/:teamId`, `GET /analytics/top-cycle-assignees/:teamId/assignees/:assigneeName/issues` | `TopCycleAssigneesResponse` (ranking), `CycleAssigneeIssuesResponse` (drawer) — both discriminated unions (`no_active_cycle` \| `ready`). Parsed via `topCycleAssigneesResponseGuard` / `cycleAssigneeIssuesResponseGuard` (Zod `createGuard`). |
| **`team-selection.in-localstorage.gateway.ts`** | _none (browser localStorage)_ | `string | null` keyed by `shiplens.selectedTeamId:${workspaceId}` |

---

## Selection Flow — Narrative (select-team-on-dashboard)

```
[Browser]  /           (Dashboard route)
    ↓
[useDashboardPage]
    ↓ calls
[useDashboard]
    ├── useQuery(['analytics','workspace-dashboard']) ─→ getWorkspaceDashboard
    │       ↓
    │   HTTP GET /dashboard/data ─→ [Backend.WorkspaceDashboardController]
    │       ↓
    │   GetWorkspaceDashboardUsecase
    │       ├── WorkspaceDashboardDataGateway (Prisma)
    │       └── LinearWorkspaceConnectionGateway (Identity BC)
    │       ↓
    │   WorkspaceDashboardPresenter → { workspaceId, teams, synchronization }
    │
    ├── effect(workspaceId changed)
    │   └─→ getPersistedTeamSelection({ workspaceId })
    │         └─→ TeamSelectionInLocalStorageGateway.read(workspaceId)
    │               └─→ window.localStorage.getItem('shiplens.selectedTeamId:' + workspaceId)
    │   ──→ setPersistedTeamId(value)
    │
    └── DashboardPresenter.present(data, { persistedTeamId })
            ↓
        resolveSelectedTeamId:
          - if teams empty → null, showEmptyTeamsMessage = true
          - else if persistedTeamId in teams → persistedTeamId
          - else → alphabetical first
            ↓
        ViewModel { teams: [...with isSelected], selectedTeamId, showEmptyTeamsMessage }
            ↓
        DashboardView → TeamCardView / TeamCardIdleView (role="button")

[User clicks a card]
    ↓
onSelectTeam(teamId)
    ├── setSelectionOverride(teamId)   [synchronous in-memory update → instant visual feedback]
    └── persistTeamSelection({ workspaceId, teamId })   [fire-and-forget, catch ignored]
          └─→ TeamSelectionInLocalStorageGateway.write(workspaceId, teamId)
                └─→ window.localStorage.setItem(...)
```

---

## Session history (BC-level)

| Date | Contributor | Delta |
|------|-------------|-------|
| 2026-04-16 | Event Storming agent | Initial BC document — metrics, reporting, alerting, estimation, dashboard, member health, workflow config auto-detection |
| 2026-04-17 | Event Storming agent | Added frontend projections (dashboard, settings, cycle report, member health); added `TeamSelectionStorage` entity + client usecases + `WorkspaceScopedPersistence` / `TeamSelectionAlphabeticalDefault` / `TeamSelectionRestoreIfStillExists` / `TeamSelectionStaleFallback` rules; added `TeamSelected` / `TeamSelectionRestored` events; extended `WorkspaceDashboardPresenter` with `workspaceId`; added workflow-config UI section (`knownStatuses`, `WorkflowStatusTag`, source badge); documented HTTP contracts; added Identity dependency for dashboard workspaceId |
| 2026-04-18 | Event Storming agent | Added `show-top-cycle-projects` widget — backend `TopCycleProjects` entity + `GetTopCycleProjects` / `GetCycleIssuesForProject` usecases + presenters; frontend hook + ranking/drawer presenters + 5 views under `views/top-cycle-projects/`; shared cycle-insight shells (card, metric toggle, ranking row, empty state, drawer, drawer-issue-row) + `use-dismissable-overlay` hook; `Issue.projectExternalId` cross-BC edge from Synchronization via DB Published Language; client-side events `TopCycleProjectsRequested` / `CycleProjectIssuesDrawerOpened` / `CycleProjectIssuesDrawerDismissed`. |
| 2026-04-18 | Event Storming agent | Added `show-top-cycle-assignees` widget — backend `TopCycleAssignees` entity (`top-cycle-assignees.schema.ts`, `top-cycle-assignees-data.gateway.ts`) + `GetTopCycleAssignees` / `GetCycleIssuesForAssignee` usecases + `TopCycleAssigneesController` (two endpoints) + backend presenters (`TopCycleAssigneesPresenter`, `CycleAssigneeIssuesPresenter`) + Prisma gateway; frontend entity (gateway port, response schema, guard), `GetTopCycleAssigneesUsecase` + `ListCycleAssigneeIssuesUsecase`, `TopCycleAssigneesInHttpGateway`, `useTopCycleAssignees` hook, `TopCycleAssigneesPresenter` (ranking ViewModel with metric-dependent sorting) + `CycleAssigneeIssuesDrawerPresenter` (drawer ViewModel), 5 views under `views/top-cycle-assignees/` wired in `DashboardView` aside column under top projects; shared `cycle-insight-drawer-issue-row.view.tsx` extended with optional `cycleTimeLabel` + optional `assigneeLabel`; registry wiring in `frontend/src/main/dependencies.ts` (gateway, both usecases, `resetUsecases` parity). New client-side events `TopCycleAssigneesRequested` / `CycleAssigneeIssuesDrawerOpened` / `CycleAssigneeIssuesDrawerDismissed`. No new cross-BC edge. |
| 2026-04-18 | Event Storming agent | Added `detect-cycle-themes-with-ai` backend vertical — `CycleThemeSet` entity with `isCachedWithin` TTL rule + Zod schema (1-5 themes, name 1-60 chars) + guard + `InsufficientIssuesForThemeDetectionError` (dead code); `DetectCycleThemesUsecase` orchestrates active-cycle lookup → cache check (24h TTL) → AI prompt build (language from `WorkspaceSettingsGateway`) → `CycleThemeSet.create` → cache save → aggregate recomputation against live snapshot; `GetCycleIssuesForThemeUsecase` for drill-down; `CycleThemesPresenter` + `CycleThemeIssuesPresenter` (discriminated unions, no slicing); `CycleThemesController` with two endpoints (`GET /analytics/cycle-themes/:teamId`, `GET .../themes/:themeName/issues`); `CycleThemeSetDataInPrismaGateway` (Prisma reads: Cycle, Issue, Label, StateTransition) + `CycleThemeSetCacheInMemoryGateway` (process-local `Map`). Six new domain events (`CycleThemesRequested`, `CycleThemesServedFromCache`, `CycleThemesRefreshed`, `CycleThemeDetectionBelowThreshold`, `AiProviderUnavailableForThemes`, `CycleThemeDrillDownOpened`). No new cross-BC edge — reuses existing `AiTextGeneratorGateway` + `WorkspaceSettingsGateway`. Frontend projection pending. |
