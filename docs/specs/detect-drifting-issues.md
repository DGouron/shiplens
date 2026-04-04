# Detect drifting issues

## Status: implemented

## Context
A ticket estimated at 1 point that drags on all day without being completed is a warning signal. Currently, blocked issue detection only catches tickets stagnating in a status. It does not detect tickets that are progressing but too slowly relative to their estimate. The tech lead needs this signal to intervene early in the cycle.

## Rules
- A ticket is drifting when its time in progress exceeds the expected duration based on its point estimate
- The points-to-duration mapping grid is fixed and based on the Fibonacci sequence:
  - 1 point = 4 business hours max
  - 2 points = 6 business hours max
  - 3 points = 8 business hours max (1 day)
  - 5 points = 20 business hours max (2-3 days)
- Tickets estimated at 8 points or more are immediately flagged as "needs splitting" as soon as they enter in-progress state
- Time is calculated in business hours (Monday-Friday, 9am-6pm) — evenings, nights, and weekends do not count
- Detection covers all non-terminal statuses (In Progress, In Review, etc.) — not just the first work status
- The time taken into account is the cumulative total since entering the first work status (started), not since the last status change
- Tickets without point estimates are excluded from detection
- The mapping grid is displayed read-only on the settings page

## Scenarios
- 1 point drift: {1-point ticket, entered "In Progress" at 9am, still in "In Review" at 5pm} -> drift alert + business duration "8h" + expected "4h"
- 5 point drift: {5-point ticket, in progress for 4 business days} -> drift alert + business duration "32h" + expected "20h"
- on track: {3-point ticket, in progress for 6 business hours} -> no alert
- ticket completed on time: {2-point ticket, completed in 5 business hours} -> no alert
- needs splitting: {8-point ticket, entered "In Progress"} -> immediate alert "Needs splitting"
- needs splitting 13: {13-point ticket, entered "In Progress"} -> immediate alert "Needs splitting"
- business hours weekend: {1-point ticket, entered "In Progress" Friday 4pm, Monday 10am} -> business duration counted = 3h (2h Friday + 1h Monday), not drifting
- business hours evening: {1-point ticket, entered "In Progress" at 5pm, next day 10am} -> business duration = 2h (1h evening + 1h morning), not drifting
- without estimate: {ticket without points, in progress for 5 days} -> excluded from detection
- grid visible: {settings page} -> grid displayed read-only with thresholds by point count

## Out of scope
- User modification of the grid (fixed grid)
- Automatic notification on drift (Slack, email)
- Splitting suggestions for 8+ point tickets
- Analysis of drift causes
- Public holiday support

## Glossary
| Term | Definition |
|------|------------|
| Drifting ticket | Issue whose time in progress exceeds the expected duration based on its estimate |
| Mapping grid | Fixed table associating a Fibonacci point count to a maximum expected duration in business hours |
| Business hours | Work hours counted Monday through Friday, 9am to 6pm |
| Needs splitting | Preventive signal for tickets estimated at 8 points or more, considered too large to deliver as a single unit |

## Implementation

### Bounded Context
Analytics

### Artifacts
- **Entity** : `DriftingIssue` — drift analysis calculated on the fly
- **Domain logic** : `business-hours.ts` (business hours calculation with timezone), `drift-grid.ts` (fixed Fibonacci grid)
- **Use case** : `DetectDriftingIssuesUsecase` — orchestrates issue fetching, business hours calculation, detection
- **Gateway port** : `DriftingIssueDetectionDataGateway` — in-progress issues with points and startedAt
- **Gateway impl** : `DriftingIssueDetectionDataInPrismaGateway`
- **Presenter** : `DriftingIssuesPresenter`
- **Controller** : `DriftingIssuesController` — GET /analytics/drifting-issues/:teamId + GET drift-grid/entries
- **Settings** : timezone configurable per team (default Europe/Paris), read-only grid

### Endpoints
| Method | Route | Use case |
|--------|-------|----------|
| GET | /analytics/drifting-issues/:teamId | DetectDriftingIssuesUsecase |
| GET | /analytics/drifting-issues/drift-grid/entries | Fixed grid (no use case) |
| GET | /settings/teams/:teamId/timezone | TeamSettingsGateway.getTimezone |
| PUT | /settings/teams/:teamId/timezone | TeamSettingsGateway.setTimezone |

### Architectural decisions
- Calculated on the fly, no persistence (no drift alert history)
- No scheduler (out of scope: no notifications)
- Business hours = pure function taking a timezone as parameter
- Fixed grid as a code constant, not in DB
- Timezone in existing TeamSettings (JSON file), default Europe/Paris
