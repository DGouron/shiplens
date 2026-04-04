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
