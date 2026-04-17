# Show top cycle epics

## Status: ready

Depends on: `select-team-on-dashboard`, `show-top-cycle-projects` (reuses the right-side column and the shared card / drill-down drawer shells).

## Context

Below the "top cycle projects" card, a second card shows the epics that absorbed the most effort during the active cycle. An epic is a large parent issue (≥ 8 points with at least one sub-issue) — distinct from a project, which groups work via milestones. This widget answers "which big pieces of work are driving this cycle?"

## Rules

- A card titled "Top cycle epics" is displayed in the dashboard right-side column directly below "Top cycle projects"
- An issue is classified as an epic when it has at least 8 story points AND at least one child issue
- The ranking considers only epics whose sub-issues had activity during the selected team's active cycle
- Each row shows the epic title and the metric value aggregated over its sub-issues active in the cycle
- Metric toggle values: count (sub-issues active in the cycle), points (sum of their story points), time (sum of their cycle time)
- Rows are sorted descending by the active metric
- Issues that are not sub-issues of any epic (standalone issues and issues whose parent is not an epic) are aggregated into a "No epic" bucket that participates in the ranking like any other epic
- When fewer than 5 epics have activity, only available rows are shown
- When no active cycle exists, the card shows "No active cycle for this team."
- When the active cycle has zero issues, the card shows "No activity in the current cycle."
- Clicking an epic row opens the shared drill-down drawer listing the sub-issues of that epic active in the cycle with title, assignee, points, status, Linear link
- Clicking the "No epic" row opens the drawer listing the standalone or non-epic-parent issues active in the cycle
- The drawer closes on click-outside, Escape, or an explicit close button
- All text is translated via the workspace language

## Scenarios

- identify epic: {issue estimated 8 points with 4 sub-issues} → classified as epic
- exclude small parent: {issue estimated 5 points with 3 sub-issues} → NOT an epic
- exclude childless big issue: {issue estimated 13 points with no sub-issue} → NOT an epic
- rank by count: {cycle has activity on 3 sub-issues of epic A, 2 of epic B, 1 of epic C} → A (3), B (2), C (1)
- "No epic" bucket: {cycle has 10 issues, 6 under epics, 4 standalone or under a non-epic parent} → "No epic" (4) participates in the ranking
- sort by points: {user toggles to points; A has 3 sub-issues totaling 15 points, B has 2 sub-issues totaling 21 points} → B (21), A (15)
- sort by time: {user toggles to time} → rows reorder by summed cycle time of sub-issues
- click row opens drawer: {user clicks epic A} → drawer lists A's sub-issues active in the cycle
- click "No epic" opens drawer: {user clicks "No epic" row} → drawer lists standalone or non-epic-parent issues active in the cycle
- fewer than 5 epics: {only 2 epics have activity} → only 2 rows rendered
- no active cycle: {team has no active cycle} → card shows "No active cycle for this team."
- empty cycle: {active cycle has zero issues} → card shows "No activity in the current cycle."
- team switch reloads: {user selects another team} → card reloads for the new team's active cycle
- language switch: {workspace language changes} → labels re-rendered

## Out of scope

- Configuring the epic threshold (fixed at 8 points)
- Multi-level epic nesting (only direct parent-child considered)
- Epic completion progress bar
- Predicting epic completion date
- Exporting the ranking
- Historical cycle view

## Glossary

| Term | Definition |
|------|------------|
| Epic | An issue estimated at 8 or more story points that has at least one child sub-issue — larger than a typical feature, smaller than a project (which organizes work via milestones) |
| No epic bucket | Virtual aggregate for issues that are not sub-issues of any epic — standalone issues or issues under a non-epic parent |
