# View cycle report page

## Status: implemented

## Context
The tech lead wants to dive into the details of a specific cycle to understand what happened, share results with stakeholders and identify areas for improvement. Today, this information is scattered across Linear, spreadsheets and manual notes. Shiplens centralizes everything on a dedicated page per cycle.

## Rules
- The user can select any past or active team cycle via a selector
- The AI-generated report is displayed first, at the top of the page
- Detailed metrics are displayed below the report: velocity, cycle time, scope creep, completion rate
- The full list of cycle issues is displayed with the final status of each issue
- A progress chart shows advancement over time during the cycle
- The user can export the report as Markdown or copy it to the clipboard
- The cycle selector displays cycles from most recent to oldest

## Scenarios
- nominal page: {selected team, past cycle with generated report, 40 issues} -> AI report displayed + metrics (velocity, cycle time, scope creep, completion rate) + list of 40 issues with statuses + progress chart
- cycle change: {page displayed, another cycle selected} -> content updated with the newly selected cycle's data
- cycle without report: {selected cycle, no report generated} -> empty report section with note "Aucun rapport généré pour ce cycle" + metrics and issues displayed normally
- markdown export: {report displayed, Markdown export clicked} -> Markdown file downloaded containing the report
- clipboard copy: {report displayed, copy clicked} -> report content copied to clipboard + confirmation "Rapport copié"
- active cycle in progress: {active cycle selected, partial data} -> metrics displayed with note "Cycle en cours" + partial progress chart
- cycle without issues: {selected cycle, 0 issues} -> metrics at zero + empty list with note "Aucune issue dans ce cycle"
- data not synchronized: {selected cycle, data not synchronized} -> reject "Les données de ce cycle ne sont pas encore synchronisées. Veuillez lancer la synchronisation."
- export without report: {no report generated, export clicked} -> reject "Aucun rapport à exporter. Veuillez d'abord générer un rapport pour ce cycle."
- high scope creep: {cycle with more than 30% of issues added after start} -> scope creep metric displayed as alert

## Out of scope
- Side-by-side comparison of two cycles
- Editing the AI-generated report
- Export to PDF or formats other than Markdown
- Adding or removing issues from this page
- Report generation from this page (covered by the report generation spec)
- Automatic report sending by email or notification

## Glossary
| Term | Definition |
|------|------------|
| Cycle | Defined work period for a team (equivalent to sprint in Linear) |
| AI report | Automatically generated structured document summarizing the cycle's activity |
| Velocity | Volume of work accomplished during the cycle |
| Cycle time | Average duration between start and completion of work on an issue |
| Scope creep | Percentage of issues added to the cycle after its start |
| Completion rate | Percentage of completed issues out of the total cycle issues |
| Progress chart | Visualization of cycle advancement over time |
| Final status | State of an issue at cycle closure (completed, in progress, blocked, cancelled) |
