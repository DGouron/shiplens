# View member health trends

## Status: ready

## Context
Project management tools show what is done, not how things are going. A developer who systematically underestimates, whose PRs linger in review, or whose cycle time drifts cycle after cycle sends invisible signals on Linear. The tech lead needs these signals to intervene before problems take hold.

## Rules
- A member's health dashboard displays 5 signals computed over the last N completed cycles
- Signal 1 — Estimation score evolution: rising/falling/stable trend of the accuracy score
- Signal 2 — Underestimation ratio: percentage of underestimated issues per cycle, with trend
- Signal 3 — Average cycle time: evolution of average processing time per cycle, with trend
- Signal 4 — Drifting tickets per cycle: number of tickets that exceeded expected duration, with trend
- Signal 5 — Median review time: evolution of time spent in review per cycle, with trend
- Each signal displays the last cycle value, the trend over N cycles (rising/falling/stable) and a visual health indicator (green/orange/red)
- Trend is computed from a minimum of 3 completed cycles
- If fewer than 3 cycles are available, the signal displays the raw value without trend with the note "Not enough history"
- A signal is green if the trend is favorable (estimation score rising, underestimation falling, cycle time falling, drifts falling, review time falling)
- A signal is red if the trend has been unfavorable for 2 or more consecutive cycles
- A signal is orange in other cases (mixed trend or first deviation)
- The health dashboard is accessible from the member's cycle profile (spec view-member-cycle-profile)

## Scenarios
- nominal health: {Alice, 4 completed cycles, estimation score 60% -> 65% -> 70% -> 75%} -> estimation signal green + rising trend + value "75%"
- chronic underestimation: {Bob, 3 cycles, underestimation ratio 40% -> 45% -> 50%} -> underestimation signal red + rising trend + value "50%"
- drifting cycle time: {Alice, 3 cycles, average cycle time 1.2d -> 1.5d -> 2.1d} -> cycle time signal red + rising trend + value "2.1d"
- lingering review: {Charlie, 3 cycles, median review time 8h -> 12h -> 24h} -> review signal red + rising trend + value "24h"
- drift improvement: {Alice, 3 cycles, drifting tickets 4 -> 2 -> 1} -> drift signal green + falling trend + value "1"
- mixed trend: {Bob, 4 cycles, cycle time 1.5d -> 2d -> 1.2d -> 1.8d} -> cycle time signal orange + mixed trend
- insufficient history: {new member, 1 completed cycle} -> 5 signals displayed with raw value + "Not enough history"
- no completed cycles: {member without history} -> dashboard displays "No data available for this member"
- member without estimated issues: {Charlie, 3 cycles, no issues with points} -> estimation and underestimation signals display "Not applicable" + other signals computed normally

## Out of scope
- Multi-curve temporal chart (visual exploration)
- Comparison between members
- Automatic recommendations based on signals
- Alerts or notifications on health degradation
- Team-level signals (individual member only)

## Glossary
| Term | Definition |
|------|------------|
| Health signal | Indicator computed over N cycles revealing a positive or negative trend in a member's work |
| Trend | Direction of a signal's evolution over recent cycles: rising, falling or stable |
| Health indicator | Color code (green/orange/red) summarizing whether the trend is favorable, mixed or unfavorable |
| Drift | Ticket whose actual processing time exceeds the expected duration based on its estimate (cf. spec detect-drifting-issues) |
