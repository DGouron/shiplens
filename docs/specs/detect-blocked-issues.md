# Detect blocked issues

## Status: implemented

## Context
The tech lead needs to know when an issue stagnates too long in a status. Without this detection, blockages go unnoticed until the standup — or even until the end of the cycle.

## Rules
- Each status has a maximum time threshold beyond which an issue is considered blocked
- Default thresholds are provided out of the box; the user can customize them per status
- Exceeding the threshold produces a warning; exceeding double the threshold produces a critical
- Detection runs automatically every hour
- Each generated alert is kept in a timestamped history
- An issue that falls back under the threshold after being flagged remains in the history but no longer appears as blocked
- The direct link to the issue in Linear is always accessible from an alert

## Scenarios
- issue blocked at warning level: {issue in "In Review" for 50h, threshold "In Review" = 48h} -> severity "warning" + duration "50h" + link to the Linear issue
- issue blocked at critical level: {issue in "In Review" for 100h, threshold "In Review" = 48h} -> severity "critical" + duration "100h"
- issue on time: {issue in "In Review" for 24h, threshold "In Review" = 48h} -> no alert
- multiple blocked issues sorted by severity: {3 blocked issues: 1 critical, 2 warnings} -> list sorted critical first, then warning
- custom thresholds: {user sets threshold "In Progress" = 72h, issue in "In Progress" for 80h} -> severity "warning" + duration "80h"
- default thresholds: {no custom thresholds, issue in "In Review" for 50h} -> detection with the default threshold for "In Review" status
- issue back on track: {previously flagged issue, now moved to the next status} -> alert removed from active list + alert kept in history
- alert history: {5 alerts generated over the last 7 days} -> timestamped history viewable with severity, duration, and related issue
- no synchronized team: {no Linear data imported} -> reject "Veuillez d'abord synchroniser vos données Linear."
- invalid threshold: {user enters a negative threshold} -> reject "Le seuil doit être une durée positive."

## Out of scope
- Push or email notifications (alerts viewable in Shiplens only)
- Detection based on criteria other than time in a status (e.g., number of comments, PR size)
- Automatic blockage resolution suggestions
- Threshold configuration per team or project (global thresholds per status only)

## Glossary
| Term | Definition |
|------|------------|
| Blocked issue | Issue that has remained in the same status beyond the configured threshold |
| Threshold | Maximum acceptable duration for an issue in a given status |
| Severity | Alert severity level: warning (threshold exceeded) or critical (double the threshold exceeded) |
| Alert | Signal that an issue has exceeded the threshold in its current status |
| Alert history | Table of all generated alerts, kept even after resolution |
| Status | Step in an issue's workflow in Linear (e.g., Backlog, In Progress, In Review, Done) |

## Implementation

### Bounded Context
Analytics (existing)

### Artefacts
- **Entities** : `StatusThreshold`, `BlockedIssueAlert`
- **Use Cases** : `DetectBlockedIssuesUsecase`, `GetBlockedIssuesUsecase`, `GetAlertHistoryUsecase`, `SetStatusThresholdUsecase`
- **Controller** : `BlockedIssuesController`
- **Scheduler** : `BlockedIssueDetectionScheduler` (hourly cron via `@nestjs/schedule`)
- **Presenters** : `BlockedIssuesPresenter`, `AlertHistoryPresenter`
- **Gateways** : `StatusThresholdInPrismaGateway`, `BlockedIssueAlertInPrismaGateway`, `BlockedIssueDetectionDataInPrismaGateway`
- **Migration** : `add-blocked-issue-detection` (tables `StatusThreshold`, `BlockedIssueAlert`)

### Endpoints
| Method | Route | Use Case |
|--------|-------|----------|
| GET | `/analytics/blocked-issues` | `GetBlockedIssuesUsecase` |
| GET | `/analytics/blocked-issues/history` | `GetAlertHistoryUsecase` |
| POST | `/analytics/blocked-issues/thresholds` | `SetStatusThresholdUsecase` |
| POST | `/analytics/blocked-issues/detect` | `DetectBlockedIssuesUsecase` |

### Architectural decisions
- Default thresholds hardcoded in the `StatusThreshold` entity (In Progress: 48h, In Review: 48h, Todo: 72h)
- Linear URL built via UUID: `https://linear.app/issue/{uuid}`
- `@nestjs/schedule` added for the hourly cron
- Resolved alerts kept with `active: false` and `resolvedAt`
