# Migrate cycle report page

## Status: planned (slice 4/6)

Slice 4 of the frontend migration. Depends on Slice 1 (setup-react-spa) and Slice 2 (extract-design-system).

## Context

The cycle report page is the most complex page in Shiplens. It lets the tech lead select a team and cycle, then displays detailed metrics (velocity, throughput, completion rate, scope creep, cycle time, lead time), bottleneck analysis, blocked issues, estimation accuracy, drifting issues, and an AI-generated sprint report. The current implementation is the largest HTML template (approximately 1500 lines). The inline JS orchestrates 8+ concurrent API calls, builds complex DOM structures including tables, progress bars, charts, expandable sections, and Markdown rendering. Multiple NestJS presenters already produce JSON DTOs consumed by the inline JS.

## Rules

- The cycle report page is a React route at `/cycle-report`
- The route reads `teamId` from the URL query parameter (`/cycle-report?teamId=xxx`)
- A team selector dropdown lists all synced teams (fetched via existing sync endpoints)
- A cycle selector dropdown lists cycles for the selected team, most recent first (via `GET /analytics/teams/:teamId/cycles`)
- Selecting a team or cycle updates the URL and reloads the relevant data
- Data fetching uses a `useCycleReportViewModel` hook that orchestrates parallel API calls
- The hook manages 6 data sections independently, each with its own loading/loaded/error state:
  - Metrics: `GET /analytics/cycles/:cycleId/metrics`
  - Bottlenecks: `GET /analytics/cycles/:cycleId/bottlenecks`
  - Blocked issues: `GET /analytics/blocked-issues?cycleId=xxx&teamId=xxx`
  - Estimation accuracy: `GET /api/analytics/teams/:teamId/cycles/:cycleId/estimation-accuracy`
  - Drifting issues: `GET /analytics/drifting-issues/:teamId?cycleId=xxx`
  - AI Report: `GET /analytics/teams/:teamId/reports` (latest for cycle)
- Each section renders independently: a section can show data while others are still loading
- The metrics section displays 6 KPI cards: velocity, throughput, completion rate, scope creep, average cycle time, average lead time
- Scope creep above 30% displays as an alert (matching current behavior)
- The bottleneck section displays a table of statuses with median time, sorted by duration
- The blocked issues section displays a list of blocked issues with status and duration
- The estimation accuracy section displays a pie/donut breakdown: well estimated, over-estimated, under-estimated
- The drifting issues section displays issues that exceeded expected duration
- The AI report section displays the generated report with Markdown rendering
- Report generation uses `POST /analytics/cycles/:cycleId/report` with the selected team ID
- Report export (Markdown download) and clipboard copy are preserved
- A member filter dropdown allows filtering issues by team member, with "Whole team" as default
- Clicking a member name in the issues list navigates to `/member-health-trends?teamId=xxx&memberName=xxx`
- Member digest generation uses `POST /analytics/cycles/:cycleId/member-digest`
- Loading state displays skeleton placeholders per section
- All user-facing text comes from the translation system (matching `CycleReportPageTranslationKeys`)
- The `CycleReportPageController` keeps only JSON endpoints; the `GET /cycle-report` HTML endpoint is removed in Slice 6
- Every component and hook has Vitest tests

## Scenarios

- nominal page: {team selected, past cycle with data} -> all 6 sections displayed with data
- cycle selection: {page displayed, user selects different cycle} -> all sections reload with new cycle data
- team selection: {page displayed, user selects different team} -> cycle selector refreshes + first cycle auto-selected + sections reload
- metrics displayed: {cycle with 40 issues} -> 6 KPI cards with formatted values
- high scope creep: {scope creep 35%} -> scope creep card highlighted as alert
- bottleneck table: {cycle with 5 statuses} -> table with 5 rows sorted by median time descending
- blocked issues list: {3 blocked issues} -> 3 issue rows with status and blocked duration
- estimation breakdown: {60% well, 25% under, 15% over} -> donut chart with 3 segments and labels
- drifting issues: {2 drifting issues} -> 2 issue rows with expected vs actual duration
- ai report present: {report generated for cycle} -> report content rendered as Markdown + export and copy buttons
- ai report absent: {no report for cycle} -> "No report generated" message + "Generate report" button
- generate report: {user clicks "Generate report"} -> POST request sent + loading state + report appears on success
- export markdown: {report present, user clicks "Export"} -> Markdown file downloaded
- copy to clipboard: {report present, user clicks "Copy"} -> content copied + toast "Report copied!"
- member filter: {user selects "Alice" from member dropdown} -> issues filtered to Alice's issues only
- member navigation: {user clicks member name "Bob"} -> navigates to `/member-health-trends?teamId=xxx&memberName=Bob`
- member digest generation: {user clicks "Generate digest" for a member} -> POST request + digest appears
- section independent loading: {metrics loaded, bottlenecks still loading} -> metrics displayed + bottleneck skeleton visible
- section error: {bottleneck API returns 500, others succeed} -> 5 sections with data + bottleneck section shows error
- loading state: {all data loading} -> skeleton placeholders per section
- no team selected: {page opened without teamId} -> team selector shown + prompt to select a team
- cycle without issues: {selected cycle, 0 issues} -> metrics at zero + empty list message
- locale french: {workspace language is FR} -> all labels in French
- locale english: {workspace language is EN} -> all labels in English

## Out of scope

- Modifying any backend presenter or use case
- Changing API response shapes
- Adding new metrics or sections not present in the current page
- Progress chart visualization (not present in current inline JS — listed in original spec but not implemented)
- Side-by-side cycle comparison
- PDF export

## Glossary

| Term | Definition |
|------|------------|
| Section-independent loading | Each data section within the page fetches and renders independently, so one slow or failed section does not block others |
| Member digest | An AI-generated summary of a specific member's contributions and patterns within a cycle |
| Bottleneck analysis | Identification of workflow statuses where issues spend disproportionate time |
