# Ubiquitous Language — Shiplens

Single source of truth for the project's business vocabulary. Enriched by `/product-manager` and `/event-storming`.

| Term | Bounded Context | Definition |
|------|-----------------|------------|
| Workspace | Shared | A Linear organization's workspace |
| Session | Identity | Active link between Shiplens and the user's Linear workspace |
| Disconnection | Identity | Complete link severance, with access removal on both sides |
| Team | Shared | Linear Team — organizational unit grouping members and projects |
| Project | Shared | Grouping of issues within a team, with a goal and a deadline |
| Active project | Identity | Non-archived and non-completed project in Linear |
| Issue | Shared | Work task or ticket in Linear |
| Cycle | Shared | Iterative work period (sprint) in Linear, with a start and end date |
| Active cycle | Dashboard | Currently running cycle for a given team |
| Milestone | Sync | Progress marker within a project |
| State transition | Shared | Timestamped status change of an issue, used as the basis for time-per-status calculation |
| Status | Shared | Workflow step of an issue in Linear (Backlog, Todo, In Progress, In Review, Done) |
| Final status | Dashboard | State of an issue at cycle closure (completed, in progress, blocked, cancelled) |
| Assignee | Shared | Person responsible for an issue in Linear |
| Initial synchronization | Sync | Full import of Linear data history for selected teams |
| Incremental sync | Sync | Continuous data update after the initial import |
| Event | Sync | Notification sent by Linear when data changes |
| Isolated event | Sync | Unprocessable event set aside for manual investigation |
| Velocity | Shared | Ratio between completed points and planned points at cycle start |
| Throughput | Analytics | Total number of issues completed in the cycle |
| Cycle time | Shared | Duration between moving to in-progress and completion of an issue |
| Lead time | Analytics | Duration between creation and completion of an issue |
| Scope creep | Shared | Issues added to the cycle after its start date |
| Completion rate | Shared | Percentage of completed issues relative to the initial cycle scope |
| Trend | Shared | Evolution of a metric compared to the last completed cycles |
| Estimation | Shared | Number of points assigned to an issue before its completion |
| Accuracy score | Analytics | Measure of the gap between estimation and actual cycle time, after normalization |
| Normalization | Analytics | Conversion of points and durations to a common scale for comparability |
| Over-estimation | Analytics | Issue whose cycle time is significantly lower than what the estimation predicted |
| Under-estimation | Analytics | Issue whose cycle time is significantly higher than what the estimation predicted |
| Prediction | Analytics | Calculated estimate of probable issue duration, based on history |
| Confidence interval | Analytics | Trio of values (optimistic, probable, pessimistic) framing the predicted duration |
| Similar issue | Analytics | Already completed issue sharing common criteria with the issue to predict |
| Blocked issue | Shared | Issue that has stayed in the same status beyond the configured threshold |
| Threshold | Shared | Maximum acceptable duration for an issue in a given status |
| Severity | Shared | Gravity level of an alert or rule |
| Alert | Analytics | Signal that an issue has exceeded the threshold in its current status |
| Bottleneck | Analytics | Workflow status where issues spend the most time by median |
| Time distribution | Analytics | Breakdown of time spent by issues in each status |
| Median time | Analytics | Central value of time spent in a status — more robust than the mean |
| Sprint report | Shared | Structured document summarizing a sprint's activity, health, and trends |
| Executive summary | Analytics | Short paragraph giving an overview of sprint health |
| Highlights | Analytics | Notable issues, achievements, or remarkable events from the sprint |
| Recommendations | Shared | Concrete improvement suggestions for upcoming sprints |
| AI provider | Analytics | External service used for text generation (OpenAI, Anthropic, Ollama) |
| Report history | Analytics | Chronological list of all reports generated for a team |
| Audit rule | Shared | Automated verification of a team practice, defined by an identifier, name, severity, and condition |
| Condition | Rules | Measurable criterion: threshold on a metric, pattern on labels/statuses, or ratio between two metrics |
| Evaluation | Rules | Rule verification against a completed cycle's data, producing pass, warn, or fail |
| Archival | Rules | Removal of a rule from active evaluation without physical deletion |
| Adherence score | Rules | Percentage of rules with pass status out of total evaluated rules |
| Audit section | Rules | Part of the cycle report dedicated to rule evaluation results |
| Packmind | Rules | Collaborative tool for documenting team practices |
| Measurable practice | Rules | Packmind practice translatable into a verifiable condition on metrics |
| Qualitative practice | Rules | Descriptive Packmind practice, not translatable into an automated condition |
| Checklist | Shared | List of qualitative practices to verify manually |
| Cache | Rules | Last synchronized version of rules, used when Packmind is unavailable |
| Slack webhook | Notification | Destination URL for sending a message to a Slack channel |
| Slack channel | Shared | Discussion space in Slack where messages and alerts are published |
| Notification | Notification | Automated message sent on Slack at cycle closure |
| Throttling | Notification | Limitation to one alert per issue per day to avoid noise |
| Dashboard | Shared | Home page displaying a workspace overview |
| Team card | Dashboard | Visual block summarizing the state of a team's active cycle |
| Velocity trend | Dashboard | Evolution of the active cycle's velocity compared to previous cycles |
| Progress chart | Dashboard | Visualization of cycle progress over time |
| Synchronization status | Dashboard | Indicator showing when the last sync occurred and when the next one is scheduled |
| Empty state | Dashboard | Dashboard response when prerequisites are not met, containing a status and a guide message |
| OAuth2 scopes | Identity | Permissions granted by Linear during OAuth2 authorization (read, write, issues:create) |
| API Key connection | Identity | Alternative connection mode using a personal Linear key instead of the OAuth2 flow |
| Reference data | Sync | Reference data of a Linear team (statuses, labels, members) imported during initial sync |
| Cursor | Sync | Pagination position in the Linear API allowing resumption of an interrupted synchronization |
| Webhook deduplication | Sync | Idempotency mechanism based on deliveryId to ignore already processed webhooks |
| Soft delete | Sync | Marking an issue as deleted without physical removal, triggered by a remove webhook |
| Default threshold | Analytics | Predefined maximum durations per status before alert triggers — In Progress 48h, In Review 48h, Todo 72h |
| Excluded status | Analytics | Status voluntarily removed from blocked issue detection by team configuration |
| Similar issue | Analytics | Already completed issue sharing common criteria (team, points) with the issue to predict |
| Test message | Notification | Message automatically sent when configuring a Slack webhook to verify it works |
| Alert channel | Notification | Slack webhook dedicated to blocked issue alerts, distinct from the report webhook |
| Rule origin | Audit | Source of an audit rule — manual (created in Shiplens) or packmind (synchronized from Packmind) |
| Workspace language | Shared | Single language preference (EN or FR) applied workspace-wide to all UI pages |
| Translation dictionary | Shared | Structured collection of translated UI strings keyed by locale code |
| Locale | Shared | Language identifier (EN or FR) used to resolve the correct translation |
| Generation language | Analytics | Language in which the AI produced a sprint report — stored as historical record on the report entity |
| Display language | Shared | Workspace language used for UI labels — may differ from the generation language on older reports |
| Workflow configuration | Analytics | Per-team mapping defining which status names correspond to "started" (work begins) and "completed" (work finished) for cycle time computation |
| Started status | Analytics | Status name that marks the beginning of active work on an issue — used as the start point for cycle time |
| Completed status | Analytics | Status name that marks the end of work on an issue — used as the end point for cycle time |
| Hybrid resolution | Analytics | Three-tier strategy for determining workflow statuses: manual override > pattern matching > hardcoded fallback |
| Team selection | Dashboard | Per-workspace state identifying which team's data is currently focused on the dashboard |
| Epic | Analytics | An issue estimated at 8 or more story points that has at least one child sub-issue — larger than a feature, smaller than a project (which organizes work via milestones) |
| No project bucket | Analytics | Virtual aggregate for cycle issues whose `project` field is unset, participating in the top-5 ranking like a named project |
| No epic bucket | Analytics | Virtual aggregate for cycle issues that are not sub-issues of any epic — standalone issues or issues under a non-epic parent |
| Metric toggle | Analytics | Control on dashboard top-5 widgets switching the ranking metric between count, points, and time |
| Drill-down drawer | Analytics | Right-side panel (60% viewport) listing the issues behind a clicked ranking row on a dashboard top-5 widget |
| Cycle theme | Analytics | AI-inferred semantic cluster grouping issues of an active cycle by similarity of title and labels |
| Theme cache | Analytics | Per-cycle in-memory memo (`CycleThemeSetCacheInMemoryGateway`) of an AI-generated `CycleThemeSet` with a 24-hour TTL from `generatedAt` — process-local, lost on restart, not shared across instances |
| Health signal | Analytics | One of 5 per-member metrics (estimation score, underestimation ratio, average cycle time, drifting tickets, median review time) tracked over cycles with trend direction and severity color |
| Drifting issue | Analytics | In-progress issue that has exceeded its expected business-hours budget per story point — status can be on-track, drifting, or needs-splitting |
| Workspace-scoped persistence | Analytics | Browser localStorage entry keyed by workspace identifier so switching workspaces yields a clean slate for the team selection |
| Known statuses | Analytics | Distinct status names observed in a team's state-transition history — the source list shown in the workflow configuration UI |
| Workflow status tag | Analytics | UI tag applied to a known status: `started`, `completed`, or `not tracked` — maps to the team's `startedStatuses` / `completedStatuses` lists |
| Source badge | Analytics | UI badge on the workflow configuration section showing whether the current config is `auto-detected` or `manual` |
| Top cycle projects | Analytics | Ranking of projects by chosen metric (count, points, time) over the selected team's active cycle — first widget of the dashboard right-side column |
| Right-side column | Analytics | Dashboard area to the right of the team cards hosting per-team insight widgets (top projects, future: top epics, top assignees, cycle themes) |
| Show more affordance | Analytics | Inline expand control on a top-5 widget revealing rows 6 through 10; label flips between "Show more" and "Show less" — hidden when the cycle has fewer than 6 eligible rows |
| Manual refresh | Analytics | User-triggered bypass of the theme cache via `?refresh=true` on `GET /analytics/cycle-themes/:teamId` — deletes the cached `CycleThemeSet` before re-running the AI, guaranteeing a fresh generation even within the 24h TTL |
| Theme aggregate | Analytics | Runtime recomputation combining the AI's `theme → issueExternalIds` mapping with the live cycle-issues snapshot to produce `{ name, issueCount, totalPoints, totalCycleTimeInHours, issueExternalIds }` per theme — points / time stay current between cache refreshes while the clustering stays frozen |
| Candidate issue (themes) | Analytics | Cycle issue passed to the AI prompt for theme detection (externalId, title, labels, points, status, assignee, cycle time, linear URL) — ALL cycle issues are candidates, no completed-status filter |
| AI provider unavailable (themes) | Analytics | Discriminated status returned by `DetectCycleThemes` when the AI provider throws — the cache is untouched so the next call retries |
| Below threshold (themes) | Analytics | Discriminated status returned by `DetectCycleThemes` when the active cycle has fewer than 10 candidate issues — the AI is never invoked |
