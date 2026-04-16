# Event Storming — Analytics

*Date: 2026-04-16*
*Scope: Sprint metrics calculation, bottleneck analysis, blocked issue detection, duration prediction, AI reports, member health trends, workflow config auto-detection*

## Domain Events (Orange)

| Event | Trigger | Source File |
|-------|---------|-------------|
| CycleMetricsCalculated | CalculateCycleMetrics | `src/modules/analytics/usecases/calculate-cycle-metrics.usecase.ts` |
| SprintReportGenerated | GenerateSprintReport | `src/modules/analytics/usecases/generate-sprint-report.usecase.ts` |
| BlockedIssuesDetected | DetectBlockedIssues (hourly scheduler) | `src/modules/analytics/usecases/detect-blocked-issues.usecase.ts` |
| BlockedIssueAlertCreated | DetectBlockedIssues (new alert) | `src/modules/analytics/usecases/detect-blocked-issues.usecase.ts` (l.90) |
| BlockedIssueAlertResolved | DetectBlockedIssues (issue unblocked) | `src/modules/analytics/usecases/detect-blocked-issues.usecase.ts` (l.99) |
| StatusThresholdUpdated | SetStatusThreshold | `src/modules/analytics/usecases/set-status-threshold.usecase.ts` |
| BottleneckAnalysisCompleted | AnalyzeBottlenecksByStatus | `src/modules/analytics/usecases/analyze-bottlenecks-by-status.usecase.ts` |
| EstimationAccuracyCalculated | CalculateEstimationAccuracy | `src/modules/analytics/usecases/calculate-estimation-accuracy.usecase.ts` |
| IssueDurationPredicted | PredictIssueDuration | `src/modules/analytics/usecases/predict-issue-duration.usecase.ts` |
| WorkspaceDashboardGenerated | GetWorkspaceDashboard | `src/modules/analytics/usecases/get-workspace-dashboard.usecase.ts` |
| MemberDigestGenerated | GenerateMemberDigest | `src/modules/analytics/usecases/generate-member-digest.usecase.ts` |
| TeamExcludedStatusesUpdated | SetTeamExcludedStatuses | `src/modules/analytics/usecases/set-team-excluded-statuses.usecase.ts` |
| WorkflowConfigAutoDetected | ResolveWorkflowConfig (no existing config) | `src/modules/analytics/usecases/resolve-workflow-config.usecase.ts` |
| WorkflowConfigSaved | SetWorkflowConfig (manual) or ResolveWorkflowConfig (auto-detect) | `src/modules/analytics/usecases/set-workflow-config.usecase.ts` |
| MemberHealthTrendsViewed | GetMemberHealth | `src/modules/analytics/usecases/get-member-health.usecase.ts` |

## Commands (Blue)

| Command | Actor | Produced Event | Source File |
|---------|-------|----------------|-------------|
| CalculateCycleMetrics | user | CycleMetricsCalculated | `src/modules/analytics/usecases/calculate-cycle-metrics.usecase.ts` |
| GenerateSprintReport | user | SprintReportGenerated | `src/modules/analytics/usecases/generate-sprint-report.usecase.ts` |
| DetectBlockedIssues | system (hourly cron) | BlockedIssuesDetected | `src/modules/analytics/usecases/detect-blocked-issues.usecase.ts` |
| GetBlockedIssues | user | — (read) | `src/modules/analytics/usecases/get-blocked-issues.usecase.ts` |
| GetAlertHistory | user | — (read) | `src/modules/analytics/usecases/get-alert-history.usecase.ts` |
| SetStatusThreshold | user | StatusThresholdUpdated | `src/modules/analytics/usecases/set-status-threshold.usecase.ts` |
| AnalyzeBottlenecksByStatus | user | BottleneckAnalysisCompleted | `src/modules/analytics/usecases/analyze-bottlenecks-by-status.usecase.ts` |
| CalculateEstimationAccuracy | user | EstimationAccuracyCalculated | `src/modules/analytics/usecases/calculate-estimation-accuracy.usecase.ts` |
| GetEstimationTrend | user | — (read) | `src/modules/analytics/usecases/get-estimation-trend.usecase.ts` |
| PredictIssueDuration | user | IssueDurationPredicted | `src/modules/analytics/usecases/predict-issue-duration.usecase.ts` |
| GetWorkspaceDashboard | user | WorkspaceDashboardGenerated | `src/modules/analytics/usecases/get-workspace-dashboard.usecase.ts` |
| ListTeamCycles | user | — (read) | `src/modules/analytics/usecases/list-team-cycles.usecase.ts` |
| GetCycleIssues | user | — (read) | `src/modules/analytics/usecases/get-cycle-issues.usecase.ts` |
| ListTeamReports | user | — (read) | `src/modules/analytics/usecases/list-team-reports.usecase.ts` |
| GetReport | user | — (read) | `src/modules/analytics/usecases/get-report.usecase.ts` |
| GenerateMemberDigest | user | MemberDigestGenerated | `src/modules/analytics/usecases/generate-member-digest.usecase.ts` |
| GetTeamExcludedStatuses | user | — (read) | `src/modules/analytics/usecases/get-team-excluded-statuses.usecase.ts` |
| SetTeamExcludedStatuses | user | TeamExcludedStatusesUpdated | `src/modules/analytics/usecases/set-team-excluded-statuses.usecase.ts` |
| GetWorkflowConfig | user | WorkflowConfigAutoDetected (if first access) | `src/modules/analytics/usecases/get-workflow-config.usecase.ts` |
| SetWorkflowConfig | user | WorkflowConfigSaved | `src/modules/analytics/usecases/set-workflow-config.usecase.ts` |
| ResolveWorkflowConfig | system (internal) | WorkflowConfigAutoDetected | `src/modules/analytics/usecases/resolve-workflow-config.usecase.ts` |
| GetMemberHealth | user | MemberHealthTrendsViewed | `src/modules/analytics/usecases/get-member-health.usecase.ts` |
| DetectDriftingIssues | user | — (read) | `src/modules/analytics/usecases/detect-drifting-issues.usecase.ts` |

## Entities (Yellow)

| Entity | Responsibility | Files |
|--------|---------------|-------|
| CycleSnapshot | Snapshot of a completed cycle — issues, points, dates. Calculates velocity, throughput, completion rate, scope creep, cycle time, lead time. | `src/modules/analytics/entities/cycle-snapshot/cycle-snapshot.ts` |
| SprintReport | AI-generated sprint report — executive summary, trends, highlights, risks, recommendations, audit section | `src/modules/analytics/entities/sprint-report/sprint-report.ts` |
| BlockedIssueAlert | Alert on an issue stuck too long in a status — severity, duration, resolution | `src/modules/analytics/entities/blocked-issue-alert/blocked-issue-alert.ts` |
| StatusThreshold | Configurable threshold per status — beyond it, the issue is considered blocked (warning x1, critical x2) | `src/modules/analytics/entities/status-threshold/status-threshold.ts` |
| BottleneckAnalysis | Bottleneck analysis — median time distribution per status, per assignee, cross-cycle comparison | `src/modules/analytics/entities/bottleneck-analysis/bottleneck-analysis.ts` |
| EstimationAccuracy | Estimation accuracy — points/cycle time ratio per issue, developer, label, team | `src/modules/analytics/entities/estimation-accuracy/estimation-accuracy.ts` |
| DurationPrediction | Duration prediction based on similar issues — confidence interval (P25/P50/P75) | `src/modules/analytics/entities/duration-prediction/duration-prediction.ts` |
| WorkflowConfig | Team-level workflow status configuration — startedStatuses, completedStatuses, source (auto-detected or manual) | `src/modules/analytics/entities/workflow-config/workflow-config.ts` |
| MemberHealth | Per-member health across N cycles — 5 computed signals: estimation, underestimation, cycle time, drifting tickets, review time | `src/modules/analytics/entities/member-health/member-health.ts` |
| DriftingIssue | In-progress issue exceeding business-hours budget per story point. Status: on-track, drifting, needs-splitting | `src/modules/analytics/entities/drifting-issue/drifting-issue.ts` |

## Policies and Business Rules (Purple)

| Rule | Description | Source File |
|------|-------------|-------------|
| CycleCompletionRequired | ~~Relaxed~~ — both completed and in-progress cycles can produce metrics | `src/modules/analytics/entities/cycle-snapshot/cycle-snapshot.ts` |
| NoCycleIssuesGuard | A cycle without issues cannot produce metrics | `src/modules/analytics/entities/cycle-snapshot/cycle-snapshot.ts` (l.30-32) |
| MinimumHistoryForTrend | Minimum 3 completed cycles to display a velocity trend | `src/modules/analytics/usecases/calculate-cycle-metrics.usecase.ts` (l.27) |
| ThresholdSeverityEscalation | warning if duration >= threshold, critical if duration >= 2x threshold | `src/modules/analytics/entities/status-threshold/status-threshold.ts` (l.51-58) |
| DefaultThresholds | In Progress 48h, In Review 48h, Todo 72h | `src/modules/analytics/entities/status-threshold/status-threshold.ts` (l.7-11) |
| PositiveThresholdOnly | Threshold must be a strictly positive duration | `src/modules/analytics/entities/status-threshold/status-threshold.ts` (l.22-24) |
| EstimationClassification | ratio > 2.0 = over-estimated, ratio < 0.5 = under-estimated, otherwise well estimated | `src/modules/analytics/entities/estimation-accuracy/estimation-accuracy.ts` (l.47-50) |
| MinimumCyclesForPrediction | Minimum 2 completed cycles to enable predictions | `src/modules/analytics/usecases/predict-issue-duration.usecase.ts` (l.24) |
| LowConfidenceThreshold | Fewer than 5 similar issues = low confidence | `src/modules/analytics/entities/duration-prediction/duration-prediction.ts` (l.7) |
| SupportedLanguages | Only FR and EN are supported for report generation | `src/modules/analytics/usecases/generate-sprint-report.usecase.ts` (l.43) |
| ExcludedStatusesAutoResolve | When a status is excluded from tracking, active alerts for that status are automatically resolved | `src/modules/analytics/usecases/set-team-excluded-statuses.usecase.ts` (l.21-40) |
| AlertSortOrder | Active alerts are sorted by severity (critical first) then by decreasing duration | `src/modules/analytics/usecases/get-blocked-issues.usecase.ts` (l.16-20) |
| WorkflowConfigAutoDetection | If no config exists, scan team's transition status names against known patterns (case-insensitive): started = ["progress", "dev", "doing", "started", "in development"], completed = ["done", "completed", "closed", "shipped", "released"] | `src/modules/analytics/entities/workflow-config/workflow-status-patterns.ts` |
| WorkflowConfigFallback | When pattern matching finds zero matches, fallback to ["In Progress", "Started"] / ["Done", "Completed"] | `src/modules/analytics/entities/workflow-config/workflow-status-patterns.ts` |
| WorkflowConfigParameterization | Gateway methods receive startedStatuses/completedStatuses as parameters, resolved by ResolveWorkflowConfigUsecase before any call | `src/modules/analytics/entities/sprint-report/sprint-report-data.gateway.ts` |
| MemberHealthMinimumHistory | Minimum 3 non-null values across cycles required to compute a trend indicator | `src/modules/analytics/entities/member-health/health-signal.ts` |
| MemberHealthIndicatorEscalation | 1 consecutive unfavorable change = orange, 2+ = red, stable/favorable = green | `src/modules/analytics/entities/member-health/health-signal.ts` |

## Presenters (Green)

| Presenter | Exposed Data | File |
|-----------|-------------|------|
| CycleMetricsPresenter | Velocity, throughput, completion, scope creep, cycle time, lead time, trend | `src/modules/analytics/interface-adapters/presenters/cycle-metrics.presenter.ts` |
| SprintReportPresenter | Executive summary, trends, highlights, risks, recommendations | `src/modules/analytics/interface-adapters/presenters/sprint-report.presenter.ts` |
| BlockedIssuesPresenter | Blocked issues with severity, duration, Linear URL | `src/modules/analytics/interface-adapters/presenters/blocked-issues.presenter.ts` |
| AlertHistoryPresenter | Alert history | `src/modules/analytics/interface-adapters/presenters/alert-history.presenter.ts` |
| BottleneckAnalysisPresenter | Time distribution per status, bottleneck, breakdown per assignee | `src/modules/analytics/interface-adapters/presenters/bottleneck-analysis.presenter.ts` |
| EstimationAccuracyPresenter | Ratio per issue, scores per dev/label/team, classification | `src/modules/analytics/interface-adapters/presenters/estimation-accuracy.presenter.ts` |
| DurationPredictionPresenter | Optimistic/probable/pessimistic prediction, confidence, similar issue count | `src/modules/analytics/interface-adapters/presenters/duration-prediction.presenter.ts` |
| WorkspaceDashboardPresenter | Overview of all teams, velocity trend, sync status | `src/modules/analytics/interface-adapters/presenters/workspace-dashboard.presenter.ts` |
| TeamCyclesPresenter | Team cycle list | `src/modules/analytics/interface-adapters/presenters/team-cycles.presenter.ts` |
| CycleIssuesPresenter | Cycle issues | `src/modules/analytics/interface-adapters/presenters/cycle-issues.presenter.ts` |
| ReportHistoryPresenter | Generated report history | `src/modules/analytics/interface-adapters/presenters/report-history.presenter.ts` |
| ReportDetailPresenter | Specific report detail | `src/modules/analytics/interface-adapters/presenters/report-detail.presenter.ts` |
| MemberHealthPresenter | 5 health signals per member with indicator color, trend direction, last value | `src/modules/analytics/interface-adapters/presenters/member-health.presenter.ts` |
| WorkflowConfigPresenter | startedStatuses, completedStatuses, source (auto-detected or manual) | `src/modules/analytics/interface-adapters/presenters/workflow-config.presenter.ts` |
| DriftingIssuesPresenter | Drifting issues with drift status, elapsed time, budget | `src/modules/analytics/interface-adapters/presenters/drifting-issues.presenter.ts` |

## Gateways and External Systems (White)

| System | Interaction | Gateway |
|--------|------------|---------|
| Prisma (SQLite) | Read synchronized data, persist alerts, thresholds, reports | `cycle-metrics-data.in-prisma.gateway.ts`, `blocked-issue-alert.in-prisma.gateway.ts`, etc. |
| AI Provider (OpenAI/Anthropic/Ollama) | Text generation for sprint reports and digests | `src/modules/analytics/entities/sprint-report/ai-text-generator.gateway.ts` |
| Claude CLI (fallback) | Text generation via Claude CLI if no Anthropic API key | `src/modules/analytics/interface-adapters/gateways/ai-text-generator.with-claude-cli.gateway.ts` |
| Filesystem | Team settings persistence (excluded statuses) | `src/modules/analytics/interface-adapters/gateways/team-settings.in-file.gateway.ts` |
| Prisma (TeamWorkflowConfig) | Persist and retrieve auto-detected or manually-set workflow configs per team | `src/modules/analytics/interface-adapters/gateways/workflow-config.in-prisma.gateway.ts` |

## Relationships with Other Bounded Contexts

| Related BC | Pattern (Vaughn Vernon) | Direction | Detail |
|-----------|------------------------|-----------|--------|
| Synchronization | Published Language (via DB) | Synchronization (Upstream) → Analytics (Downstream) | Analytics reads synchronized issues, cycles, and transitions via its own Prisma gateways. No Synchronization code import. |
| Audit | Customer-Supplier | Audit (Supplier) → Analytics (Customer) | `GenerateSprintReportUsecase` directly imports `AuditRuleGateway`, `AuditRule`, `CycleMetrics`, `ChecklistItemGateway` from the Audit module. The NestJS Analytics module imports `AuditModule`. |
| Notification | Customer-Supplier | Analytics (Supplier) → Notification (Customer) | Analytics exports `SprintReportGateway`. Notification imports it via `AnalyticsModule` to access reports for Slack delivery. |

## Ubiquitous Language

| Term | Definition in this BC | Equivalent term elsewhere |
|------|----------------------|---------------------------|
| Velocity | Ratio between completed points and planned points | — |
| Throughput | Total number of issues completed in the cycle | — |
| Cycle time | Duration between moving to in-progress (startedAt) and completion (completedAt) | — |
| Lead time | Duration between creation and completion of an issue | — |
| Scope creep | Issues added after cycle start | — |
| Blocked issue | Issue that has stayed in a status beyond the configured threshold | — |
| Bottleneck | Status where issues spend the most time by median | — |
| Accuracy score | Measure of the gap between estimation and reality via points/days ratio | — |
| Prediction | Calculated estimate of probable duration based on history | — |
| Confidence interval | Trio of P25/P50/P75 values framing the predicted duration | — |
| Workflow configuration | Per-team mapping defining which status names correspond to "started" and "completed" for cycle time computation | — |
| Started status | Status name marking the beginning of active work on an issue | — |
| Completed status | Status name marking the end of work on an issue | — |
| Hybrid resolution | Three-tier strategy: manual override > pattern matching > hardcoded fallback | — |
| Health signal | One of 5 per-member metrics tracked over cycles with trend direction and severity color | — |
| Drifting issue | In-progress issue exceeding its expected business-hours budget | — |

## Hot Spots (Pink)

| Problem | Severity | Detail |
|---------|----------|--------|
| Direct coupling Analytics → Audit | high | `GenerateSprintReportUsecase` directly imports types and gateways from the Audit module via a relative path (`../../audit/entities/...`). This is not a `@modules/` import, it's an internal file import. Although the NestJS module declares the import, accessing internal files violates the BC boundary principle. An Anti-Corruption Layer or a port in Analytics would be cleaner. |
| TeamSettings persisted in filesystem | medium | `team-settings.in-file.gateway.ts` uses the filesystem while everything else uses Prisma. Inconsistency that could cause issues in multi-instance deployments. |
| Fragile JSON parsing of AI response | medium | `GenerateSprintReportUsecase` (l.119-124) parses the AI response JSON with a regex `\{[\s\S]*\}` — fragile if the AI response contains multiple JSON objects or an unexpected format. |
| Very large module | high | 23 usecases, 15 presenters, 10 entities, 18+ gateways. This BC could benefit from splitting: Metrics, Reporting, Alerting, Estimation, Dashboard, MemberHealth, WorkflowConfig. |
