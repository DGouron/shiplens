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

**Ring 0 — Symptom location**: entity/usecase/controller where the bug manifests.
- Wrong conditions in entity logic
- Missing validation in guard
- Entity invariant violation
- Incorrect `static create()` logic

**Ring 1 — Direct dependencies**: callers and callees.
- Gateway contract mismatch (abstract class vs implementation)
- Usecase parameter error
- Presenter transformation bug
- Controller routing or DTO parsing error

**Ring 2 — Data & Persistence**: Prisma queries, gateway implementations, entity state.
- Wrong Prisma query conditions (`where`, `include`, `select`)
- Missing or incorrect data mapping between Prisma model and domain entity
- N+1 queries (multiple `findMany` inside a loop)
- Transaction failures or partial writes
- Unique constraint violations at runtime
- Migration drift: `prisma/schema.prisma` differs from actual database state
- Diagnostic: `npx prisma db pull` to compare schema vs DB

**Ring 3 — NestJS Infrastructure**: module wiring, DI, lifecycle.
- Circular dependency injection (`forwardRef` needed or module restructuring)
- Module wiring incorrect (missing import, missing provider, missing export)
- Abstract class not properly provided as DI token (`{ provide: Abstract, useClass: Concrete }`)
- Guard/interceptor/pipe execution order (NestJS pipeline)
- Lifecycle hooks (`onModuleInit`, `onApplicationBootstrap`) not firing
- Diagnostic: `DEBUG=* pnpm start:dev` for verbose NestJS logs

**Ring 4 — Environment**: config, external dependencies. Only reach here if Rings 0-3 don't explain the bug.
- Environment variables missing or malformed
- SQLite file permissions or path issues
- Node.js version incompatibility

**Side-list**: while investigating, note other bugs/smells you spot. Don't chase them now — feed them into Phase 2.

**Spec check**: if the buggy file belongs to a BC with a spec in `docs/specs/`, read the spec to compare expected vs observed behavior.

**Deliverable**: for each issue -> `file:line-range`, root cause, user impact.

---

## Phase 2 — Prioritized Classification

| Tier | Criteria | Effort |
|------|----------|--------|
| P0 | App crashes, data loss, security hole, blocks core flow | S/M/L |
| P1 | Feature broken, workaround exists, significant degradation | S/M/L |
| P2 | Edge-case failures, minor issues, non-critical perf | S/M/L |
| P3 | Code smell, tech debt, zero user-facing impact | S/M/L |

Effort estimation:
- **S** : one-liner or single-file fix
- **M** : 2-5 files, contained change
- **L** : cross-layer change or redesign needed

Present a prioritized table grouped by tier. **Pause and ask the user to validate** before proceeding.

For P3 items, suggest `/refactor` skill if the fix involves structural changes (Mikado, Strangler Fig).

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
| **B — grouped branch** | Shared root cause or preparatory refactor needed (-> `/refactor`) |
| **C — hybrid** | Mix; explain each group's rationale |

Present all three options, recommend one, let the user decide.

### Recommended merge order

Order by: P0 first -> biggest user impact -> conflict minimization -> low-risk quick wins last.

**Deliverable**: branch list with name, bugs addressed, files touched, flagged conflicts.

---

## Phase 4 — Regression Safeguards

For each branch, provide a handoff to `/tdd` :

```
HANDOFF:
  target_behavior: [one-sentence what the fix guarantees]
  file: [main file to fix]
  boundary_conditions:
    - [edge case 1]
    - [edge case 2]
  repro_test: [sketch of a test that reproduces the bug — becomes the RED test]
```

Then apply `/tdd` with this context. The repro test is the RED test. The fix makes it GREEN.

Gate: `pnpm test` must pass on the branch before merge.

---

## Diagnostic commands reference

| Situation | Command |
|-----------|---------|
| Test failure details | `pnpm test -- --reporter=verbose` |
| Specific test file | `pnpm test -- tests/path/to/test.spec.ts` |
| Prisma schema vs DB | `npx prisma db pull --print` |
| Prisma data inspection | `npx prisma studio` |
| NestJS verbose logs | `DEBUG=* pnpm start:dev` |
| Migration status | `pnpm db:status` |
| Type checking | `npx tsc --noEmit` |

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
| Specs | `docs/specs/` |
| Test command | `pnpm test` |
