# Show top cycle projects

## Status: ready

Depends on: `select-team-on-dashboard`. This spec also introduces the dashboard right-side column and the shared card / drawer shells reused by `show-top-cycle-epics`, `show-top-cycle-assignees`, and `detect-cycle-themes-with-ai` (walking skeleton).

## Context

Once a team is selected on the dashboard, the user wants to know "what did my team work on during the active cycle?" The first answer is a ranked list of projects touched in the cycle. The dashboard's right-side column hosts this widget and, in subsequent specs, three more widgets. Each widget shows the top 5 entries with a toggle switching the ranking metric between count, points, and time.

## Rules

- The dashboard has a right-side column positioned next to the team cards
- The column hosts a card titled "Top cycle projects" showing the 5 projects most worked on during the selected team's active cycle
- "The cycle" always refers to the active cycle of the currently selected team
- The card has a metric toggle with three values: count (default), points, time
- Each row shows the project name and the metric value for that project
- Rows are sorted descending by the active metric
- Project attribution uses the issue's direct `project` field — sub-issues without their own project are NOT inherited from the parent
- Issues whose `project` is unset are aggregated into a virtual "No project" bucket that participates in the ranking like any other project
- When the cycle has fewer than 5 projects with activity, only available rows are shown (no padding)
- When the selected team has no active cycle, the card displays "No active cycle for this team."
- When the active cycle has zero issues, the card displays "No activity in the current cycle."
- Clicking a row opens a drill-down drawer sliding from the right at 60% viewport width, overlaying the dashboard
- The drawer lists the issues of the clicked project active in the cycle with: title, assignee, points, current status, link to Linear
- The drawer closes on click-outside, Escape key, or an explicit close button
- Metric toggle state and drawer open/close state are ephemeral (not persisted across page reloads)
- All text is translated via the workspace language

## Scenarios

- nominal ranking by count: {cycle has 12 issues across projects A(5), B(3), C(2), D(1), E(1)} → A, B, C, D, E displayed with counts 5, 3, 2, 1, 1
- fewer than 5 projects: {cycle has 8 issues across projects A(5) and B(3)} → only A and B rendered, no padding
- "No project" bucket: {cycle has 10 issues, 7 in project A, 3 with project unset} → A (7), No project (3)
- sub-issue without project: {parent issue in project A, sub-issue with project unset} → sub-issue counted in "No project", not A
- sort by points: {user switches metric to points; A has count 5 / 8 points, B has count 3 / 15 points} → B (15), A (8)
- sort by time: {user switches metric to time} → rows reorder by summed cycle time
- click row opens drawer: {user clicks the A row} → drawer opens listing A's cycle issues with title, assignee, points, status, Linear link
- drawer close on click-outside: {drawer open, user clicks outside} → drawer closes, metric toggle retains its value
- drawer close on escape: {drawer open, user presses Escape} → drawer closes
- no active cycle: {selected team has no active cycle} → card shows "No active cycle for this team."
- empty cycle: {active cycle has zero issues} → card shows "No activity in the current cycle."
- team switch reloads: {user selects another team} → card reloads with new team's active cycle data
- language switch: {workspace language changes} → card title, metric labels, empty-state messages re-rendered

## Out of scope

- Filtering projects by label, assignee, or status
- Multi-cycle comparison (previous cycle trend)
- Persisting metric toggle state across sessions
- Editing issues from the drawer
- Pagination in the drawer (all project issues listed at once)
- Sorting options inside the drawer
- Exporting the ranking
- Historical cycle view (only active cycle supported)

## Glossary

| Term | Definition |
|------|------------|
| Right-side column | Dashboard area to the right of the team cards hosting per-team insight widgets |
| Top cycle projects | Ranking of projects by chosen metric over the selected team's active cycle |
| Metric toggle | Control allowing the user to switch the ranking metric between count, points, and time |
| No project bucket | Virtual aggregate for issues whose `project` field is unset, participating in the ranking like a named project |
| Drill-down drawer | Side panel sliding from the right at 60% viewport width showing the issues behind a clicked ranking row |
