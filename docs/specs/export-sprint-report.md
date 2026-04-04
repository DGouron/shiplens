# Export and view sprint reports

## Status: implemented

## Context
Once the sprint report is generated, the tech lead needs to share it easily with stakeholders via Slack, Notion or email. They must also be able to find past reports to track their team's evolution over time.

## Rules
- The report is viewable directly in the Shiplens web dashboard
- The report can be copied in Markdown or plain text with one click
- All generated reports are stored and viewable in a history
- The history displays reports from most recent to oldest
- A report belongs to a specific sprint and a specific team

## Scenarios
- display in dashboard: {report generated for sprint 12} -> report displayed in the dashboard with its full content
- copy as Markdown: {report displayed, click "Copy as Markdown"} -> Markdown content in the clipboard + confirmation "Report copied as Markdown"
- copy as plain text: {report displayed, click "Copy as plain text"} -> plain text content in the clipboard + confirmation "Report copied as plain text"
- view history: {3 reports generated for the team} -> list of 3 reports sorted from most recent to oldest
- no report in history: {team with no generated report} -> message "No report has been generated for this team yet."
- open a report from history: {click on a past report} -> report displayed with its full content
- clipboard unavailable: {browser blocks clipboard access} -> reject "Unable to copy to clipboard. Check your browser permissions."

## Out of scope
- PDF export
- Automatic sending by email or Slack
- Report deletion or archiving
- Side-by-side comparison of multiple reports
- Editing the report after generation

## Glossary
| Term | Definition |
|------|------------|
| Sprint report | Structured document summarizing the activity, health and trends of a sprint |
| Dashboard | Main Shiplens web interface where the user views their data |
| Report history | Chronological list of all reports generated for a team |
| Markdown | Rich text format used in tools like Notion, GitHub or Slack |
| Plain text | Version of the report without any formatting, usable in email or any tool |

## Implementation

### Bounded Context
Analytics (existing)

### Artifacts
- **Entity**: SprintReport (evolution — added id, generatedAt)
- **Gateway port**: SprintReportGateway (save, findByTeamId, findById)
- **Gateway impl**: SprintReportInPrismaGateway
- **Use cases**: ListTeamReportsUsecase, GetReportUsecase, GenerateSprintReportUsecase (evolution — added save)
- **Presenters**: ReportHistoryPresenter, ReportDetailPresenter
- **Controller**: ReportExportController
- **Migration**: add-sprint-report-model (Prisma SprintReport model)

### Endpoints
| Method | Route | Use Case |
|--------|-------|----------|
| GET | /analytics/teams/:teamId/reports | ListTeamReportsUsecase |
| GET | /analytics/reports/:reportId | GetReportUsecase |

### Architectural decisions
- Two distinct gateways: SprintReportDataGateway (data for generation) vs SprintReportGateway (persist/read)
- Markdown and plain text rendered in the presenter (ReportDetailPresenter), not in the domain
- Clipboard scenarios = frontend only — the backend provides both formats via the DTO
- Separate controller (ReportExportController) for GET endpoints, distinct from the existing SprintReportController
