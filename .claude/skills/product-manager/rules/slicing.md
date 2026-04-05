# Slicing Rule — Always Split Into Narrow Slices

## Rule

**Always split a feature into narrow slices, even when it passes INVEST.**

INVEST's `S (Small)` criterion says "less than 15 files = OK". That is the **upper** bound, not the target. The target is the **narrowest slice that delivers observable value**.

## Why

Two reasons, one behavioral and one empirical:

1. **TDD autonomous agents perform better on narrow scopes.** Observed on shiplens: the `feature-implementer` agent produces cleaner code when the prompt covers 5-8 files than 15-20. On large scopes it loses track of cross-cutting concerns — DI wiring, import ordering, tracker updates. On narrow scopes it executes cleanly in one pass.
2. **Each slice is independently shippable, reviewable, and reversible.** A 20-file PR dies in review. A 6-file PR merges in an hour.

## When to split

A feature must be split when ANY of these apply:

- More than ~10 production files expected
- Touches more than 3 Clean Architecture layers simultaneously (entity + use case + gateway + presenter + controller)
- Contains multiple independent user-observable behaviors (e.g. 5 metrics in one dashboard, 3 export formats, 4 notification channels)
- The spec has more than ~6 rules OR more than ~8 scenarios
- Gut check: "would I write 2+ commits for this?" → YES means split

## How to split

Split along **user-observable boundaries**, not layer boundaries. Bad: "PR 1 = entities, PR 2 = use cases". Good: "PR 1 = signal A, PR 2 = signal B".

Preferred axes:
- **By signal / metric / indicator** (e.g. dashboard with 5 KPIs → 5 PRs)
- **By user intention** (e.g. "create X" vs "edit X" vs "delete X")
- **By workflow step** (e.g. "submit" vs "review" vs "publish")
- **By format / channel** (e.g. CSV export vs PDF export)

## Walking skeleton first

The **first slice** of a multi-slice feature should be a **walking skeleton**: full end-to-end plumbing (entity, use case, presenter, controller, gateway, module wiring, acceptance test) with only ONE behavior wired to real data. The remaining behaviors return `null`/`"Not applicable"` placeholder values, handled by the existing plumbing.

This keeps the API contract stable from PR 1 — subsequent slices only wire data, no contract changes.

## Tracking

When a feature is split into N slices, the spec's `## Status:` field carries the progress as `in-progress (X/N)`. Each slice's PR checks one box in the `## Implementation Progress` section. The last slice flips the status to `implemented` and removes the progress section.

## Real example

`view-member-health-trends` — a dashboard with 5 health signals. INVEST `S` was borderline (estimated 25 files). Split into 5 PRs:

- PR 1: walking skeleton + Signal 1 (estimation score) — 20 files
- PR 2: Signal 5 (review time) — 6 files
- PR 3: Signal 2 (underestimation ratio)
- PR 4: Signal 3 (cycle time)
- PR 5: Signal 4 (drifting tickets)

PR 1 took heavy post-agent corrections. PR 2 passed quality gates on the first try. The agent's error rate dropped proportionally with scope.
