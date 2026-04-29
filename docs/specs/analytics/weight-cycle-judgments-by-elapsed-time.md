# Weight cycle judgments by elapsed time

## Status: partial (iteration 1 implemented — iterations 2 & 3 pending)

## Context

AI reports, velocity opinions, and detection alerts currently judge a cycle on raw ratios (issues completed, points delivered, hours blocked) without weighting by how much of the cycle has elapsed. Concrete bug: on day 2 of a 14-day cycle, the AI summary reads "concerning health: 13.4% issues completed and 15.3% points delivered" — but at 14% elapsed time, 13.4% completion is on track, not concerning.

Every cycle judgment must be relativized to the cycle's phase (early / mid / late) and compared against an expected pro-rata baseline.

## Rules

- The expected completion rate at any moment is `total × elapsedTimeRatio` (linear pro-rata)
- The expected delivered points at any moment is `committedPoints × elapsedTimeRatio` (linear pro-rata)
- The cycle phase classifies elapsed time into `early` (0–25%), `mid` (25–75%), `late` (75–100%)
- A judgment compares actual progress to expected progress: `ahead` if actual > expected + tolerance, `on-track` if within tolerance, `behind` if actual < expected − tolerance
- Tolerance is +/- 10 percentage points around the expected value
- Cycle phase is undefined for cycles that have not started (now < startsAt) — judgments must be suppressed
- Cycle phase is `complete` for cycles already ended (now >= endsAt) — judgments use raw final ratios, no temporal weighting
- AI prompts must include cycle phase context (day X / Y, elapsed%, expected vs actual) so the model can phrase judgments in awareness of where the cycle stands
- Hardcoded alert thresholds (scope creep absolute count, drift business hours, blocked status duration) must be weighted by elapsed time — early-cycle alerts tolerate higher absolute values

## Scenarios

### Iteration 1 — CyclePhase shared kernel

- early cycle, on track: {cycle 14d, day 2, 13.4% issues completed} -> phase = `early`, expectedCompletionRate = 14%, verdict = `on-track`
- early cycle, ahead: {cycle 14d, day 2, 35% issues completed} -> phase = `early`, verdict = `ahead`
- mid cycle, behind: {cycle 14d, day 7, 20% issues completed} -> phase = `mid`, expectedCompletionRate = 50%, verdict = `behind`
- late cycle, on track: {cycle 14d, day 12, 80% issues completed} -> phase = `late`, expectedCompletionRate = 86%, verdict = `on-track`
- cycle not started: {cycle 14d, now < startsAt} -> reject "Cycle has not started — no judgment available"
- cycle ended: {cycle 14d, now > endsAt} -> phase = `complete`, elapsedRatio = 100%, judgments use raw ratios
- elapsed ratio is bounded: {cycle 14d, day 20 (overshoot)} -> elapsedRatio capped at 100%

### Iteration 2 — Sprint report AI + cycle metrics

- AI prompt receives phase: {generate sprint report, cycle on day 2/14} -> prompt contains "Day 2/14 (14% elapsed)" and "expected 14% issues completed, expected 14% points delivered"
- AI prompt for completed cycle: {generate sprint report, ended cycle} -> prompt contains "Cycle complete (100% elapsed)" — no early-stage caveat
- frontend cycle metrics: {day 2/14, 35 scope creep issues} -> presenter receives `cyclePhase = early` and `expectedCompletionRate = 14%`, alert threshold weighted accordingly
- cycle metrics endpoint exposes phase: {GET /cycles/:id/metrics} -> response includes `cyclePhase`, `elapsedTimeRatio`, `expectedCompletionRate`, `expectedDeliveredPoints`

### Iteration 3 — Drift + blocked detection weighting

- drift detection in early cycle: {cycle day 2, in-progress issue 5pts at 22 business hours} -> `on-track` because phase is `early` (raw threshold 20h would have flagged drifting)
- blocked detection in early cycle: {cycle day 2, In Progress 50h} -> severity downgraded from `warning` to `null` because phase is `early`
- drift detection in late cycle: {cycle day 12 of 14, in-progress issue 1pt at 5 business hours} -> `drifting` because phase is `late` (raw threshold 4h confirmed)

## Out of scope

- Member health signals (already inter-cycle by design, not affected by intra-cycle phase)
- Cycle theme detection (clustering, no quantitative judgment)
- Estimation accuracy classification (operates on completed issues only)
- Velocity prediction / forecasting (separate feature)
- Custom tolerance configuration per team (uses 10pp default tolerance)

## Glossary

| Term | Definition |
|------|------------|
| Elapsed time ratio | `(now − startsAt) / (endsAt − startsAt)`, bounded to [0, 1] |
| Cycle phase | Discriminated label: `not-started` \| `early` \| `mid` \| `late` \| `complete` |
| Expected completion rate | `100 × elapsedTimeRatio` — the share of issues that "should" be done if work were perfectly linear |
| Expected delivered points | `committedPoints × elapsedTimeRatio` |
| Verdict | `ahead` \| `on-track` \| `behind` \| `not-applicable` (when phase is `not-started`) |
| Tolerance | +/- 10 percentage points around expected — within this band, verdict is `on-track` |
| Pro-rata weighting | Multiplying a static threshold by elapsedTimeRatio to scale it to the cycle phase |

## Implementation

### Iteration plan

| Iteration | Scope | Status |
|-----------|-------|--------|
| 1 | `CyclePhase` shared kernel + entity enrichment + tests | implemented (2026-04-29) |
| 2 | Sprint report AI prompt + cycle metrics endpoint exposes phase | pending |
| 3 | Drift + blocked detection weighted by phase | pending |

### Iteration 1 — implemented

- **Bounded Context** : Shared Kernel + Analytics
- **Value Object** : `CyclePhase` (`backend/src/shared/domain/cycle-phase/`) — first entry into the Shared Kernel
- **Entity extended** : `CycleSnapshot` (`backend/src/modules/analytics/entities/cycle-snapshot/`) — three append-only methods (`getCyclePhase`, `getCompletionVerdict`, `getVelocityVerdict`)
- **No HTTP endpoint, no use case, no gateway** — pure domain foundation
- **Tests** : 27 unit tests on `CyclePhase` + 7 extension tests on `CycleSnapshot` (zero regression)

### Decisions made

- `now` is injected via `from()`, never read from `Date.now()` internally — caller chooses the consultation moment
- Phase boundaries: `[0, 0.25)` early, `[0.25, 0.75)` mid, `[0.75, 1.0)` late, `1.0` complete, `now < startsAt` not-started
- Tolerance: `±10pp` inclusive (10pp exactly = `on-track`, beyond = `ahead`/`behind`)
- `not-started` phase returns verdict `'not-applicable'` (no exception)
- `endsAt <= startsAt` throws `InvalidCyclePhaseRangeError` (`BusinessRuleViolation`)
- `plannedPoints === 0` in `getVelocityVerdict` returns `'not-applicable'` — refuses to fabricate a verdict over zero
- No `cycle-phase.guard.ts` (YAGNI — inputs are typed `Date`, no boundary)
- `phaseLabelSchema` and `verdictSchema` exported but unused in production code — prepared for iteration 2's HTTP DTO

### Iteration 1 — files to create

- `backend/src/shared/domain/cycle-phase/cycle-phase.ts` — value object with elapsedTimeRatio, phase classification, verdict computation
- `backend/src/shared/domain/cycle-phase/cycle-phase.schema.ts` — Zod schema for serialization at boundaries
- `backend/src/shared/domain/cycle-phase/cycle-phase.errors.ts` — domain errors (e.g. invalid date range)
- `backend/tests/shared/domain/cycle-phase/cycle-phase.spec.ts` — unit tests covering all scenarios above
- `backend/tests/builders/cycle-phase.builder.ts` — test data builder

### Iteration 1 — files to modify

- `backend/src/modules/analytics/entities/cycle-snapshot/cycle-snapshot.ts` — expose `getCyclePhase(now: Date)` returning the new VO + derived getters (`expectedCompletionRate`, `expectedDeliveredPoints`, `completionVerdict`, `velocityVerdict`)
- `backend/tests/modules/analytics/entities/cycle-snapshot/cycle-snapshot.spec.ts` — extend with phase-aware assertions
