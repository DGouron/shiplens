# INVEST Criteria

Each spec must pass all 6 INVEST criteria before being considered ready.

| Criterion | Question | Threshold |
|-----------|----------|-----------|
| **I** — Independent | Can this spec be implemented without depending on another in progress? | Yes = OK |
| **N** — Negotiable | Is the "how" free? Only the "what" is fixed? | No imposed code = OK |
| **V** — Valuable | Does the end user gain a direct benefit? | Identifiable benefit = OK |
| **E** — Estimable | Can complexity be estimated without ambiguity? | No gray areas = OK |
| **S** — Small | Implementable in 1-3 TDD sessions? | Less than 15 files = OK |
| **T** — Testable | Does each rule have an associated scenario? | 100% covered = OK |

## How to Evaluate

For each criterion, respond with:
- **OK**: the criterion is satisfied
- **WARN**: the criterion is borderline, needs monitoring
- **KO**: the criterion is not satisfied — block and fix

## Expected Output

```
INVEST Evaluation:
  I — Independent : OK
  N — Negotiable  : OK
  V — Valuable    : OK
  E — Estimable   : WARN — the pricing scope is unclear
  S — Small       : OK
  T — Testable    : OK

Verdict: READY (or BLOCKED if any KO)
```

A single **KO** = the spec goes back to clarification.
