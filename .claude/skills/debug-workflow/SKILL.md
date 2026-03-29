---
name: debug-workflow
description: >
  Workflow structure de debugging progressif. Decouverte de bugs, classification par priorite,
  et plan de branches independantes sans regressions. Adapte au stack Shiplens (NestJS 11, Prisma, Vitest).
triggers:
  - "debug"
  - "bug.*hunt"
  - "bug.*fix"
  - "investigue"
  - "investigate"
  - "régression"
  - "regression"
  - "broken"
  - "fix.*issue"
---

# Debug Workflow

Systematic bug discovery -> classification -> independent branch plan, adapted to the Shiplens stack (NestJS 11, Prisma, SQLite, Vitest).

## Activation

Consult this skill whenever the user signals something is broken or needs a fix roadmap. Skip phases the user has already completed.

---

## Phase 1 — Progressive Analysis

Investigate in concentric rings. Stop expanding as soon as the root cause is explained.

**Ring 0 — Symptom location**: entity/usecase/controller where the bug manifests. Check: wrong conditions, missing validation, incorrect guard, entity invariant violation.

**Ring 1 — Direct dependencies**: callers and callees. Check: gateway contract mismatch, usecase parameter error, presenter transformation bug.

**Ring 2 — Data flow**: Prisma queries, gateway implementations, entity state management. Check: wrong query conditions, missing data mapping, stale entity state.

**Ring 3 — Infrastructure**: NestJS module wiring, Prisma schema, environment config. Only reach here if Rings 0-2 don't explain the bug.

**Side-list**: while investigating, note other bugs/smells you spot. Don't chase them now — feed them into Phase 2.

**Deliverable**: for each issue -> `file:line-range`, root cause, user impact.

---

## Phase 2 — Prioritized Classification

| Tier | Criteria |
|------|----------|
| P0 | App crashes, data loss, security hole, blocks core flow |
| P1 | Feature broken, workaround exists, significant degradation |
| P2 | Edge-case failures, minor issues, non-critical perf |
| P3 | Code smell, tech debt, zero user-facing impact |

Present a prioritized table grouped by tier. **Pause and ask the user to validate** before proceeding.

---

## Phase 3 — Branch Strategy

### Independence rules (check for every branch)

1. **No forward dependency**: branch X must compile and run without branch Y merged.
2. **No line-level conflicts**: two branches must not modify the same lines.
3. **Tests pass in isolation**: `pnpm test` must be green on the branch alone.

When true independence is impossible, extract a prerequisite base branch.

### Strategy selection

| Strategy | When |
|----------|------|
| **A — 1 bug = 1 branch** | Bugs touch different files, no shared refactor |
| **B — grouped branch** | Shared root cause or preparatory refactor needed |
| **C — hybrid** | Mix; explain each group's rationale |

Present all three options, recommend one, let the user decide.

### Recommended merge order

Order by: P0 first -> biggest user impact -> conflict minimization -> low-risk quick wins last.

**Deliverable**: branch list with name, bugs addressed, files touched, flagged conflicts.

---

## Phase 4 — Regression Safeguards

For each branch, before handing off to `/tdd`, provide:

- **Target behavior**: one-sentence description of what the fix should guarantee.
- **Boundary conditions**: edge cases around the changed code that tests must cover.
- **`pnpm test` gate**: confirm the branch passes all tests before merge.

---

## Quick-reference: key project paths

| Area | Location |
|------|----------|
| Modules | `src/modules/<bounded-context>/` |
| Entities | `src/modules/<bc>/entities/` |
| Use Cases | `src/modules/<bc>/usecases/` |
| Controllers | `src/modules/<bc>/interface-adapters/controllers/` |
| Gateways | `src/modules/<bc>/interface-adapters/gateways/` |
| Presenters | `src/modules/<bc>/interface-adapters/presenters/` |
| Shared foundation | `src/shared/foundation/` |
| Shared domain | `src/shared/domain/` |
| Prisma | `prisma/schema.prisma` |
| Tests | `tests/` (mirror structure) |
| Test command | `pnpm test` |
