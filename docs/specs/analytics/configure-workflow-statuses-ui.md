# Configure workflow statuses UI

## Status: ready

Depends on: `auto-detect-team-workflow-statuses` (implemented 2026-04-16).

## Context

Analytics that rely on cycle time (estimation accuracy, underestimation ratio, average cycle time, drifting tickets, duration prediction, bottleneck analysis) need to know which status names mark work as "started" and "completed". Auto-detection handles most teams, but teams with custom workflow names still see "Not applicable" when pattern matching misses. The user needs a simple interface in the Settings page to review the detected configuration and manually tag statuses when auto-detection is wrong.

## Rules

- The settings page exposes a workflow configuration section for the currently selected team
- The section lists every distinct status name observed in the team's state transition history
- Each status row carries one of three tags: `started`, `completed`, or `not tracked`
- A status cannot be both `started` and `completed` at the same time
- Default tag values come from the persisted workflow configuration: statuses listed as started are tagged `started`, statuses listed as completed are tagged `completed`, all others are tagged `not tracked`
- A badge next to the section title shows the current configuration source: `auto-detected` or `manual`
- A save action persists the tagged configuration; after a successful save the source badge becomes `manual`
- The save action is disabled when there are no pending changes
- The save action is always enabled once any change is pending, including configurations where every status is `not tracked` (empty configuration is a valid state handled by analytics guidance messages)
- When the team has no state transitions yet, the section shows a guidance message instructing the user to sync team data first, and no save action is offered
- Configuration changes do not retroactively recompute past analytics — they apply on the next data access
- The workflow configuration section is distinct from the excluded statuses section (used for blocked-issue detection) and from the review status setting — each remains in its own section

## Scenarios

- auto-detected load standard: {team with "In Progress" and "Done" transitions, no manual config} → "In Progress" tagged started, "Done" tagged completed, all other statuses tagged not tracked, badge "auto-detected"
- auto-detected load custom: {team with "In Dev", "In Review", "Done" transitions, no manual config} → "In Dev" tagged started, "Done" tagged completed, "In Review" tagged not tracked, badge "auto-detected"
- manual load: {team with manual config started=["In Dev"], completed=["Shipped"]} → "In Dev" tagged started, "Shipped" tagged completed, badge "manual"
- tag started: {user sets "In Review" to started} → "In Review" row shows started tag, save enabled
- tag completed: {user sets "Phase3" to completed} → "Phase3" row shows completed tag, save enabled
- switch tag: {"In Dev" tagged started, user sets it to completed} → "In Dev" now tagged completed, not started
- untag: {user sets "In Dev" from started back to not tracked} → "In Dev" tagged not tracked, save enabled
- save success: {user saves valid configuration} → success toast "Workflow configuration saved", badge becomes "manual"
- save failure: {server returns error on save} → error toast "Could not save workflow configuration", tags unchanged
- reload after save: {page reloaded after manual save} → tags reflect the saved manual configuration, badge "manual"
- save empty configuration: {user untags every status and saves} → save accepted, subsequent analytics display guidance message "No workflow statuses detected"
- empty state: {team with zero state transitions} → section shows guidance "No workflow statuses detected. Sync your team data first.", no save action
- team switch: {user selects a different team in the team selector} → section reloads with the new team's configuration
- source badge after manual save: {team was auto-detected, user saves a change} → badge updates from "auto-detected" to "manual" without page reload

## Out of scope

- Drag and drop reordering of statuses
- Visual rendering of the full workflow sequence (Backlog → Todo → In Dev → In Review → Done)
- Merging the workflow configuration UI with the excluded statuses UI (blocked-issue detection)
- Auto-append or notification when a new status appears in Linear after initial sync
- Bottleneck chart reordering based on the saved workflow sequence
- Review status setting changes
- Retroactive recomputation of past analytics after a configuration change
- Bulk operations across multiple teams

## Glossary

All terms are already defined in `docs/ddd/ubiquitous-language.md`:

- Workflow configuration
- Started status
- Completed status
- Hybrid resolution

No new terms introduced by this spec.
