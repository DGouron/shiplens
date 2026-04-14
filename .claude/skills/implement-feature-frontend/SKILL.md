---
name: implement-feature-frontend
description: Autonomous frontend feature implementation via spec-driven development. Orchestrates a frontend-planner and a frontend-implementer with architecture-frontend preloaded. Applies Humble Object pattern to views, MVVM structure with Presenter classes + Zod ViewModels, singleton registry DI. Consumes specs produced by /product-manager. For backend features, use /implement-feature instead.
triggers:
  - "implémente.*feature.*front"
  - "implement.*feature.*frontend"
  - "code.*feature.*frontend"
  - "implement.*frontend.*slice"
---

# Implement Feature Frontend — Spec-Driven Orchestrator

## Role

You are the orchestrator of a spec-driven pipeline for the frontend. You coordinate two specialized agents to transform a spec into tested, functional React code that conforms to Clean Architecture + MVVM + Humble Object.

You do NOT code yourself. You coordinate, present, and validate with the user.

## Agents

| Agent | Role | Preloaded skills |
|-------|------|------------------|
| `frontend-planner` | Analyzes the spec, produces a structured plan | `architecture-frontend`, `product-manager` |
| `frontend-implementer` | Implements in TDD, self-reviews, fix loop | `tdd`, `architecture-frontend` |

---

## Input

The user provides either:
- A path to a spec: `/implement-feature-frontend docs/specs/<bc>/my-feature.md`
- An inline description: `/implement-feature-frontend "As a user, I want to see the dashboard with team health"`

If it is an inline description, remind the user that `/product-manager` can produce a complete spec and offer to use it first.

---

## Workflow

### Step 1: LOAD THE SPEC

1. If a path is provided → read the file
2. If an inline description → structure into acceptance criteria
3. Display the spec to the user for confirmation

### Step 2: PLAN

Delegate to the **frontend-planner** agent:
- Pass the complete spec
- The agent has `architecture-frontend` and `product-manager` preloaded — it knows the MVVM + Humble Object patterns
- It reads a reference module and the shared frontend foundation
- It returns a structured plan

**Present the plan to the user:**
```
Implementation Plan

Bounded Context : [module]
Files to create : [count]

ENTITY LAYER (optional):
  - frontend/src/modules/[bc]/entities/[entity]/[entity].ts
  ...

GATEWAY LAYER :
  - frontend/src/modules/[bc]/entities/[entity]/[entity].gateway.ts  (port = interface)
  - frontend/src/modules/[bc]/interface-adapters/gateways/[entity].in-http.gateway.ts  (HTTP impl)
  ...

USECASE LAYER :
  - frontend/src/modules/[bc]/usecases/[action]-[entity].usecase.ts
  ...

PRESENTER LAYER :
  - frontend/src/modules/[bc]/interface-adapters/presenters/[feature].view-model.schema.ts  (Zod)
  - frontend/src/modules/[bc]/interface-adapters/presenters/[feature].presenter.ts  (class)
  ...

HOOK LAYER :
  - frontend/src/modules/[bc]/interface-adapters/hooks/use-[feature].ts  (React bridge)
  ...

VIEW LAYER (humble — NOT tested) :
  - frontend/src/modules/[bc]/interface-adapters/views/[feature].view.tsx
  ...

ROUTE :
  - /[path] → [feature].view.tsx (mount in frontend/src/app.tsx)

TEST DOUBLES :
  - frontend/src/modules/[bc]/testing/good-path/stub.[entity].gateway.ts
  - frontend/src/modules/[bc]/testing/bad-path/failing.[entity].gateway.ts

REGISTRY WIRING :
  - frontend/src/main/dependencies.ts (add gateway + usecases)

TESTS :
  - frontend/src/modules/[bc]/.../[file].spec.ts (co-located unit tests)
  - frontend/tests/acceptance/[feature].acceptance.spec.ts (outer loop)
  - frontend/tests/builders/[entity].builder.ts (if entity)

Validate this plan?
```

**Wait for explicit validation before proceeding.**

### Step 3: IMPLEMENT

Delegate to the **frontend-implementer** agent:
- Pass the complete spec + the validated plan
- The agent has `tdd` and `architecture-frontend` preloaded
- It implements in TDD inside-out (RED-GREEN-REFACTOR), except for views (humble, not tested)
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
  Unit         : [count] passing
  Acceptance   : [count] passing (outer loop GREEN)
  Failing      : [count] (if applicable)

SELF-REVIEW :
  Iterations        : [count]
  Violations found  : [count]
  Violations fixed  : [count]
  Remaining issues  : [list or "none"]

ACCEPTANCE CRITERIA :
  [rule]     -> covered by [test]
  [scenario] -> covered by [test]
  ...

REGISTRY UPDATE :
  frontend/src/main/dependencies.ts — [list of added usecases and gateways]
```

### Step 5: UPDATE SPEC AND TRACKER (MANDATORY)

**This step is NON-NEGOTIABLE. It must be executed before any commit.**

1. **Update the spec** (`docs/specs/<bc>/<feature>.md`):
   - Add `## Status: implemented` after the title
   - Add an `## Implementation` section with:
     - Bounded Context
     - Artifacts (gateway, usecases, presenter, hook, view, route)
     - Architectural decisions made (AsyncState variants, entity presence or absence)

2. **Update the feature tracker** (`docs/feature-tracker.md`):
   - Change status from `drafted` or `planned` to `implemented`
   - Update the date

### Step 6: UPDATE EVENT STORMING (MANDATORY)

After implementation, update the domain documentation for affected bounded contexts.

1. **Detect affected BCs**: Look at the spec's bounded context and the files modified during implementation. Any module under `frontend/src/modules/<bc-name>/` or `backend/src/modules/<bc-name>/` that was created or modified counts.
2. **Run event storming**: Invoke `/event-storming <bc-name>` for each affected BC. If multiple BCs were modified, run one per BC. The event-storming agent scans both backend and frontend for that BC.
3. The event storming skill will automatically sync to the wiki via `/wiki`.

This step ensures domain documentation stays in sync with the code after every feature.

### Step 7: SHIP (MANDATORY)

Use the `/ship` skill for commit + push. NEVER commit manually.

The complete workflow is: implement → update spec → update tracker → event storming → /ship.

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
| Quality gate blocked (view with useState, etc.) | Move logic to hook, re-run Write |
