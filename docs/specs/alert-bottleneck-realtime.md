# Alert on Slack when an issue is blocked

## Status: implemented

## Context
Blocked issue detection exists in Shiplens (see detect-blocked-issues), but the tech lead doesn't check the dashboard constantly. They want to receive a Slack alert as soon as a blockage is detected, to react without delay.

## Prerequisites
- detect-blocked-issues: provides detection and thresholds

## Rules
- A Slack alert is sent for each newly detected blocked issue
- A given issue triggers at most one alert per day
- The alert contains: issue title, current status, time spent in this status, assignee, and link to the issue in Linear
- The alert mentions the assignee to draw their attention
- The destination Slack channel is configurable per team
- If no Slack channel is configured, no alert is sent

## Scenarios
- nominal alert: {issue detected blocked in "In Review" for 50h, Slack channel configured} -> alert sent + title + status + duration "50h" + assignee mention + Linear link
- daily throttling: {issue already alerted today, still blocked} -> no additional alert
- new day after throttling: {issue alerted yesterday, still blocked} -> new alert sent
- issue without assignee: {blocked issue, no assignee} -> alert sent without mention + indication "Aucun responsable assigné"
- channel not configured: {blocked issue, no Slack channel configured for the team} -> no alert sent
- Slack unreachable: {blocked issue, channel configured, Slack unreachable} -> reject "L'envoi de l'alerte vers Slack a échoué. Veuillez vérifier la configuration du canal."
- issue resolved between checks: {issue blocked at previous check, status changed since} -> no alert
- channel configuration: {user sets channel "#alerts-sprint" for team "Backend"} -> channel saved

## Out of scope
- Blocked issue detection and threshold management — covered by detect-blocked-issues
- Alerts to anything other than Slack (email, Teams, Discord)
- Automatic blockage resolution
- Sent alert history — detection history is in detect-blocked-issues

## Glossary
| Term | Definition |
|------|------------|
| Throttling | Limitation to a single alert per issue per day to avoid noise |
| Slack channel | Discussion space in Slack where alerts are published |

## Implementation

### Bounded Context
Notification (existing)

### Artefacts
- **Entity** : `TeamAlertChannel` (id, teamId, webhookUrl)
- **Use Cases** : `ConfigureTeamAlertChannelUsecase`, `AlertBlockedIssuesOnSlackUsecase`
- **Controller** : `SlackNotificationController` (added endpoints)
- **Scheduler** : `BlockedIssueAlertScheduler` (hourly cron via `@nestjs/schedule`)
- **Gateways** : `TeamAlertChannelInPrismaGateway`, `BlockedIssueAlertDataInPrismaGateway`, `SlackAlertLogInPrismaGateway`
- **Migration** : `add-team-alert-channel-and-slack-alert-log` (tables `TeamAlertChannel`, `SlackAlertLog`)

### Endpoints
| Method | Route | Use Case |
|--------|-------|----------|
| POST | `/notifications/slack/alerts/configure` | `ConfigureTeamAlertChannelUsecase` |
| POST | `/notifications/slack/alerts/send` | `AlertBlockedIssuesOnSlackUsecase` |

### Architectural decisions
- Alert channel separate from the report webhook (two distinct webhooks per team)
- Throttling via `SlackAlertLog` table (issueExternalId + sentAt) — checks current date
- Enriched data (teamId, assigneeName) obtained by joining BlockedIssueAlert + Issue via `BlockedIssueAlertDataGateway`
- Linear URL built in the use case: `https://linear.app/issue/{uuid}`
- The scheduler runs every hour independently from the detection scheduler
