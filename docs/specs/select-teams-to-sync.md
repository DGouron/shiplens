# Select teams to synchronize

## Status: implemented

## Context
Once connected to Linear, the user must choose which teams and projects they want to track in Shiplens. Without this selection, Shiplens does not know which data to import.

## Rules
- The user must have a connected Linear workspace to access the selection
- At least one team must be selected to start synchronization
- The selection can be modified at any time
- Only active projects are offered for selection
- The estimated number of issues to synchronize is displayed before confirmation

## Scenarios
- nominal selection: {workspace connected, 2 teams checked, 3 projects checked} -> selection saved + estimate "~150 issues to synchronize"
- no team selected: {workspace connected, no team checked, confirmation} -> reject "Please select at least one team."
- selection modification: {existing selection, one team removed, another added} -> selection updated + new estimate displayed
- workspace not connected: {no workspace connected, access to selection} -> reject "Please connect your Linear workspace first."
- workspace without teams: {workspace connected, no teams in Linear} -> reject "No teams found in your Linear workspace."
- all projects of a team archived: {workspace connected, team with all projects archived} -> team displayed without selectable project

## Out of scope
- Filtering individual issues
- Automatic synchronization launch after selection
- Selecting teams from multiple workspaces

## Glossary
| Term | Definition |
|------|------------|
| Team | Linear Team — organizational unit grouping members and projects |
| Project | Grouping of issues within a team, with a goal and a deadline |
| Active project | Non-archived and non-completed project in Linear |
| Estimate | Approximate number of issues that will be imported based on the current selection |
