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

## Logical branch coverage per slice

When assigning acceptance scenarios to slices, cross-reference the `.todo` list against the **logical branches of the decision engine**, not just the signal-to-PR mapping.

Example: a health signal has three possible indicators (`green`, `orange`, `red`). If all activated scenarios only exercise `green` and `red`, the `orange` path has zero acceptance coverage — even if it's unit-tested. Always verify that each branch of the decision model is covered at acceptance level by at least one activated scenario across the slices delivered so far.

**Concrete lesson**: in `view-member-health-trends`, the `mixed trend` scenario (Bob 1.5d→2d→1.2d→1.8d → orange) was left as `.todo` across PRs 1-3. The orchestrator caught this during PR 4 review and activated it alongside the `drifting cycle time` scenario, because both exercise Signal 3 (cycle time). Without that catch, orange indicator coverage would have been deferred indefinitely or forgotten.

**Rule**: after splitting, map each scenario to its target indicator branch and verify no branch is left uncovered beyond the current PR.

## Git workflow for stacked PRs

**Never set a child PR's base to a parent feature branch.** When GitHub merges a PR with `base = feature-branch-X`, commits land in X — not in `master`. If you stack N PRs this way, only PR 1 (based on master) reaches master. PRs 2-N accumulate in dead-end feature branches.

Two safe patterns:

1. **Rebase-on-land**: every PR targets `master`. After PR N lands, rebase PR N+1 onto the updated master and force-push. Clean, linear history. Best for small teams.
2. **Consolidation PR**: stack freely during development (base = parent branch for easy review), then create a final "propagation PR" from the chain tip to master. Simpler workflow, but produces an extra merge commit.

**Concrete lesson**: in `view-member-health-trends`, PRs 2-4 were stacked with `base = parent feature branch`. All showed as "merged" on GitHub, but master only received PR 1. A consolidation PR (#44) was required to propagate the accumulated work. This cost an extra round-trip and confused the status reporting.
