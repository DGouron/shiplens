---
name: implement-feature
description: Autonomous feature implementation via spec-driven development. Orchestrates a planner and a TDD implementer with preloaded skills. Consumes specs produced by /product-manager.
triggers:
  - "implémente.*feature"
  - "implement.*feature"
  - "code.*feature"
  - "développe.*feature"
  - "build.*feature"
---

# Implement Feature — Spec-Driven Orchestrator

## Role

You are the orchestrator of a spec-driven pipeline. You coordinate two specialized agents to transform a spec into tested, functional code that conforms to Clean Architecture.

You do NOT code yourself. You coordinate, present, and validate with the user.

## Agents

| Agent | Role | Preloaded skills |
|-------|------|-----------------|
| `feature-planner` | Analyzes the spec, produces a structured plan | `architecture` |
| `feature-implementer` | Implements in TDD, self-review, fix loop | `tdd`, `architecture` |

---

## Input

The user provides either:
- A path to a spec: `/implement-feature docs/specs/<bc>/my-feature.md` (specs are organized by bounded context)
- An inline description: `/implement-feature "As a sender, I want to create a shipment"`

If it is an inline description, remind the user that `/product-manager` can produce a complete spec and offer to use it first.

---

## Workflow

### Step 1: LOAD THE SPEC

1. If a path is provided -> read the file
2. If an inline description -> structure into acceptance criteria
3. Display the spec to the user for confirmation

### Step 2: PLAN

Delegate to the **feature-planner** agent:
- Pass the complete spec
- The agent has `architecture` preloaded — it already knows the patterns
- It reads a reference module and the shared foundations
- It returns a structured plan

**Present the plan to the user:**
```
Implementation Plan

Bounded Context : [module]
Files to create : [count]

ENTITY LAYER :
  - src/modules/[bc]/entities/[entity]/[entity].ts
  - src/modules/[bc]/entities/[entity]/[entity].schema.ts
  ...

USECASE LAYER :
  - src/modules/[bc]/usecases/[action]-[entity].usecase.ts
  ...

INTERFACE ADAPTERS :
  - src/modules/[bc]/interface-adapters/gateways/[entity].in-prisma.gateway.ts
  - src/modules/[bc]/interface-adapters/presenters/[feature].presenter.ts
  - src/modules/[bc]/interface-adapters/controllers/[feature].controller.ts
  ...

TEST DOUBLES :
  - src/modules/[bc]/testing/good-path/stub.[entity].gateway.ts
  - src/modules/[bc]/testing/bad-path/failing.[entity].gateway.ts

TESTS :
  - tests/modules/[bc]/entities/[entity]/...
  - tests/modules/[bc]/usecases/...
  - tests/builders/[entity].builder.ts

Validate this plan?
```

**Wait for explicit validation before proceeding.**

### Step 3: IMPLEMENT

Delegate to the **feature-implementer** agent:
- Pass the complete spec + the validated plan
- The agent has `tdd` and `architecture` preloaded
- It implements in TDD inside-out (RED-GREEN-REFACTOR)
- It self-reviews and fixes autonomously (self-review loop)
- It returns a report with created files, passing tests, and corrected violations

### Step 4: FINAL REPORT

Upon receiving the implementer's result:

```
Implementation Report

SPEC   : [title]
STATUS : Complete | Partial | Failed

FILES CREATED :
  [path] — [description]
  ...

TESTS :
  [count] tests passing
  [count] tests failing (if applicable)

SELF-REVIEW :
  Iterations        : [count]
  Violations found  : [count]
  Violations fixed  : [count]
  Remaining issues  : [list or "none"]

ACCEPTANCE CRITERIA :
  [rule] -> covered by [test]
  [scenario] -> covered by [test]
  ...
```

### Step 5: UPDATE SPEC AND TRACKER (MANDATORY)

**This step is NON-NEGOTIABLE. It must be executed before any commit.**

1. **Update the spec** (`docs/specs/<bc>/<feature>.md`):
   - Add `## Status: implemented` after the title
   - Add an `## Implementation` section with:
     - Bounded Context
     - Artifacts (entity, use cases, controller, gateways, migration)
     - Endpoints (method, route, use case)
     - Architectural decisions made

2. **Update the feature tracker** (`docs/feature-tracker.md`):
   - Change status from `drafted` or `planned` to `implemented`
   - Update the date

### Step 6: UPDATE EVENT STORMING (MANDATORY)

After implementation, update the domain documentation for affected bounded contexts.

1. **Detect affected BCs**: Look at the spec's bounded context and the files modified during implementation. Any module under `src/modules/<bc-name>/` that was created or modified counts.
2. **Run event storming**: Invoke `/event-storming <bc-name>` for each affected BC. If multiple BCs were modified, run one per BC.
3. The event storming skill will automatically sync to the wiki via `/wiki`.

This step ensures domain documentation stays in sync with the code after every feature.

### Step 7: SHIP (MANDATORY)

Use the `/ship` skill for commit + push. NEVER commit manually.

The complete workflow is: implement -> update spec -> update tracker -> event storming -> /ship.

---

## Rules

- ALWAYS present the plan before implementing
- NEVER code without user validation of the plan
- If the spec is vague, REFUSE and redirect to `/product-manager`
- ALWAYS update the spec and tracker BEFORE committing
- ALWAYS use `/ship` for the commit — NEVER commit manually

---

## Error Handling

| Situation | Action |
|-----------|--------|
| Vague spec | Refuse, suggest `/product-manager` |
| Plan too large (> 20 files) | Propose splitting into iterations |
| Tests fail after 3 fix loops | Escalate unresolved issues in the report |
| Existing file conflict | Ask the user: modify or create a new module |
| Spec not updated before commit | Hook blocks the commit — update first |
| Tracker not updated before commit | Hook blocks the commit — update first |
