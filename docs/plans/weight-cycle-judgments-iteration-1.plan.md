# Iteration 1 — CyclePhase shared kernel + CycleSnapshot extension

Spec: `docs/specs/analytics/weight-cycle-judgments-by-elapsed-time.md`

## Bounded context

Shared Kernel + Analytics (cross-BC). First entry into `backend/src/shared/domain/`.

## Validated decisions

| Decision | Choice | Reason |
|---|---|---|
| Value Object vs Entity | VO | No identity, immutable, pure computation |
| `now` source | Injected at `from()` | Verdict belongs to consultation moment, not snapshot |
| `not-started` consequence | Returns verdict `'not-applicable'` | Avoids try/catch cascade in presenters |
| `endsAt <= startsAt` | Throws `InvalidCyclePhaseRangeError` (`BusinessRuleViolation`) | Domain invariant |
| Location | `backend/src/shared/domain/cycle-phase/` | Iterations 2/3 will consume from `notification` too |
| Guard file | Not created (YAGNI) | Inputs already typed `Date`, no boundary |
| `plannedPoints === 0` in `getVelocityVerdict` | Returns `'not-applicable'` | Honest absence-of-info, refuses false `on-track` or false `behind` |
| Acceptance test | None this iteration | Lands with iteration 2 (HTTP endpoint) |

## Files to CREATE

1. `backend/src/shared/domain/cycle-phase/cycle-phase.schema.ts` — Zod enums + constants (`TOLERANCE_PERCENTAGE_POINTS = 10`, `EARLY_PHASE_UPPER_BOUND = 0.25`, `MID_PHASE_UPPER_BOUND = 0.75`)
2. `backend/src/shared/domain/cycle-phase/cycle-phase.errors.ts` — `InvalidCyclePhaseRangeError extends BusinessRuleViolation`
3. `backend/src/shared/domain/cycle-phase/cycle-phase.ts` — VO with `from()`, `elapsedTimeRatio`, `label`, `isStarted`, `isComplete`, `expectedCompletionRate()`, `expectedDeliveredPoints()`, `verdict()`
4. `backend/tests/builders/cycle-phase.builder.ts` — fluent builder (`withCycleDurationDays`, `withDayOfCycle`, `withStartsAt`, `withEndsAt`, `withNow`)
5. `backend/tests/shared/domain/cycle-phase/cycle-phase.spec.ts` — ~25 tests, see test plan

## Files to MODIFY

6. `backend/src/modules/analytics/entities/cycle-snapshot/cycle-snapshot.ts` — append:
   ```ts
   getCyclePhase(now: Date): CyclePhase
   getCompletionVerdict(now: Date): Verdict
   getVelocityVerdict(now: Date): Verdict
   ```
   No schema change. ISO strings converted with `new Date()` inside.

7. `backend/tests/modules/analytics/entities/cycle-snapshot/cycle-snapshot.spec.ts` — append `describe('cycle phase awareness', …)`. Append-only.

## Public surface — CyclePhase

```ts
class CyclePhase {
  private constructor(...)
  static from(input: { startsAt: Date; endsAt: Date; now: Date }): CyclePhase
  get elapsedTimeRatio(): number              // [0, 1], clamped
  get label(): PhaseLabel                      // 'not-started' | 'early' | 'mid' | 'late' | 'complete'
  get isStarted(): boolean
  get isComplete(): boolean
  expectedCompletionRate(): number             // 100 * elapsedTimeRatio
  expectedDeliveredPoints(committedPoints: number): number
  verdict(actualPercentage: number, expectedPercentage: number): Verdict
}
```

`verdict(actual, expected)`:
- `label === 'not-started'` → `'not-applicable'`
- `actual − expected > 10` → `'ahead'`
- `actual − expected < −10` → `'behind'`
- otherwise → `'on-track'`

Boundaries (inclusive lower):
- `[0, 0.25)` → `early`
- `[0.25, 0.75)` → `mid`
- `[0.75, 1.0)` → `late`
- `1.0` → `complete`
- `now < startsAt` → `not-started`

## Test plan — `cycle-phase.spec.ts`

| Spec scenario | Test name |
|---|---|
| early on track (day 2/14, 13.4%) | `classifies day 2 of 14 as early phase` |
| early on track | `expects 14 percent completion at day 2 of 14` |
| early on track | `returns on-track verdict when actual 13.4% matches expected 14%` |
| early ahead (day 2/14, 35%) | `returns ahead verdict when actual 35% beats expected 14% by more than tolerance` |
| mid behind (day 7/14, 20%) | `classifies day 7 of 14 as mid phase` |
| mid behind | `returns behind verdict when actual 20% trails expected 50% by more than tolerance` |
| late on track (day 12/14, 80%) | `classifies day 12 of 14 as late phase` |
| late on track | `returns on-track verdict when actual 80% is within tolerance of expected 86%` |
| not started | `classifies a cycle whose now is before startsAt as not-started` |
| not started | `returns elapsedTimeRatio 0 for not-started phase` |
| not started | `returns not-applicable verdict for not-started phase regardless of actual` |
| not started | `returns 0 expected completion rate for not-started phase` |
| ended | `classifies a cycle whose now is past endsAt as complete` |
| ended | `returns elapsedTimeRatio 1 for complete phase` |
| overshoot | `caps elapsedTimeRatio at 1 when now overshoots endsAt` |
| tolerance edge | `treats actual exactly 10pp above expected as on-track` |
| tolerance edge | `treats actual exactly 10pp below expected as on-track` |
| tolerance edge | `treats actual more than 10pp above expected as ahead` |
| tolerance edge | `treats actual more than 10pp below expected as behind` |
| points | `expected delivered points scales committed points by elapsed ratio` |
| invalid range | `throws InvalidCyclePhaseRangeError when endsAt equals startsAt` |
| invalid range | `throws InvalidCyclePhaseRangeError when endsAt precedes startsAt` |
| boundary 0.25 | `treats elapsedTimeRatio 0.25 as mid phase` |
| boundary 0.7499 | `treats elapsedTimeRatio 0.7499 as mid phase` |
| boundary 0.75 | `treats elapsedTimeRatio 0.75 as late phase` |
| boundary 0.999 | `treats elapsedTimeRatio 0.999 as late phase` |
| boundary 1.0 | `treats elapsedTimeRatio exactly 1 as complete phase` |

## Test plan — `cycle-snapshot.spec.ts` (appended block)

| Test name |
|---|
| `returns a CyclePhase from getCyclePhase using snapshot start and end dates` |
| `returns on-track completion verdict when actual completion rate matches phase expectation` |
| `returns behind completion verdict when actual completion rate trails expected by more than tolerance` |
| `returns not-applicable completion verdict when consulted before cycle start` |
| `returns on-track velocity verdict when delivered points match elapsed ratio` |
| `returns behind velocity verdict when delivered points trail expected` |
| `returns not-applicable velocity verdict when planned points is zero` |

## TDD order

1. `cycle-phase.builder.ts`
2. `cycle-phase.schema.ts`
3. `cycle-phase.errors.ts`
4. `cycle-phase.spec.ts` — first RED test
5. `cycle-phase.ts` — GREEN, iterate test by test, REFACTOR
6. `cycle-snapshot.spec.ts` — append phase-aware describe, RED
7. `cycle-snapshot.ts` — GREEN
8. Quality gates: `cd backend && pnpm test && npx tsc --noEmit && pnpm lint:ci`

## Reference files

- `backend/src/modules/analytics/entities/cycle-snapshot/cycle-snapshot.ts` — entity to extend
- `backend/src/modules/analytics/entities/cycle-snapshot/cycle-snapshot.schema.ts` — Zod conventions
- `backend/src/modules/analytics/entities/cycle-snapshot/cycle-snapshot.errors.ts` — error class style
- `backend/src/shared/foundation/business-rule-violation.ts` — base error class
- `backend/src/shared/foundation/testing/entity-builder.ts` — builder base class
- `backend/tests/builders/cycle-snapshot.builder.ts` — fluent builder reference
- `backend/tests/modules/analytics/entities/cycle-snapshot/cycle-snapshot.spec.ts` — test style

## Risks

1. Float precision at phase boundaries → tests at 0.2499 / 0.25 / 0.7499 / 0.75 enforce intent
2. ISO string conversion in `getCyclePhase` is invisible — encoded by test name `using snapshot start and end dates`
3. No user-facing change in this iteration — bug only disappears at iteration 2 (AI prompt). PR description must say so.
