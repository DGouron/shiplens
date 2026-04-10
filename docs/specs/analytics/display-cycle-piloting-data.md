# Display piloting data in the cycle report

## Status: implemented

## Implementation

- **Bounded Context**: Analytics
- **Artifacts**: cycle-report-page.html.ts (modified HTML template)
- **Added sections**: Bottlenecks, Blocked issues, Estimation accuracy
- **Removed section**: Cycle issues (raw table)
- **Consumed APIs**: GET bottlenecks, GET blocked-issues, POST blocked-issues/detect, GET estimation-accuracy
- **Decisions**: Independent loading per section (partial error tolerated), alerts sorted by severity on the client side

## Context
The cycle report page displays 6 basic metrics and an issues table, but critical piloting data — bottlenecks, blocked issues, estimation accuracy — remains invisible. The APIs exist and are implemented, but no visual exploits them. The tech lead cannot steer their cycle without this data.

## Rules
- The bottlenecks section displays the median time per status and identifies the bottleneck status
- The bottlenecks section displays the comparison with the previous cycle if available
- The bottlenecks section displays the breakdown per assignee with the median time per status per developer
- The blocked issues section displays active alerts sorted by severity (critical first, then warning)
- Each alert displays the issue title, current status, severity, and blocking duration
- A button allows manually re-triggering blocked issue detection
- The estimation section displays the team's accuracy score and the breakdown per developer
- The breakdown per developer shows the score, the number of over-estimates and under-estimates
- All three sections load automatically when a cycle is selected
- Each section is independent — one API failure does not prevent the others from displaying
- The raw issues table (list of title/status/points/assignee) is removed from the page — the piloting sections replace it

## Scenarios
- nominal bottlenecks: {cycle with 10 completed issues, previous cycle available} -> median time per status + bottleneck status identified + evolution vs previous cycle in percentage
- bottlenecks per assignee: {3 developers on the cycle} -> breakdown with median time per status for each assignee
- visible blocked issues: {3 active alerts: 1 critical "In Review" 100h, 2 warnings "In Progress" 50h} -> list sorted critical first + severity + duration displayed
- manual detection: {click on "Re-run detection"} -> detection executed + list refreshed
- nominal estimation: {cycle with estimated and completed issues} -> team score + breakdown per developer with score, over-estimates, under-estimates
- no completed issues: {ongoing cycle, 0 Done} -> bottlenecks section displays "No bottleneck data available"
- no blocked issues: {0 active alerts} -> blocked section displays "No blocked issues detected"
- estimation without data: {no estimated or completed issues} -> estimation section displays "Not enough data to calculate accuracy"
- cycle without comparison: {only one cycle available} -> bottlenecks displayed without evolution column + mention "Not enough cycles to compare"
- partial API error: {bottlenecks API in error, others OK} -> bottlenecks section displays error + blocked and estimation sections load normally

## Out of scope
- Configuring blocking thresholds from the UI
- Past alerts history (history endpoint)
- Duration prediction per issue in the table
- Cross-cycle estimation trend (chart)
- History of generated reports
- Slack send from this page
- Filtered view per member (separate member profile spec)
- Raw issues table (removed — no added value vs piloting sections)

## Glossary
| Term | Definition |
|------|------------|
| Bottleneck | Workflow status where issues spend the most time by median |
| Blocked issue | Issue that has remained in the same status beyond the configured threshold |
| Severity | Alert gravity level: warning (threshold exceeded) or critical (double the threshold) |
| Accuracy score | Measure of the gap between estimation and actual cycle time, after normalization |
| Breakdown | Detailed split of a metric along an axis (per assignee, per status) |
| Median time | Central value of time spent in a status — more robust than the average |
