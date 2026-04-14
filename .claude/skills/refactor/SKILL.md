---
name: refactor
description: >
  Structured refactoring with Mikado, Strangler Fig, and Parallel Change patterns.
  Decomposes a blocked refactoring into a prerequisite tree, produces an independent branch plan,
  and executes in TDD. Takes P3 items from debug-workflow or a direct restructuring request as input.
triggers:
  - "refactor"
  - "mikado"
  - "strangler"
  - "restructure"
  - "dette.*technique"
  - "tech.*debt"
  - "extraire.*gateway"
  - "extract.*"
  - "migrer.*"
  - "migrate.*"
---

# Structured Refactoring

## Philosophy

A refactoring is not a cosmetic cleanup. It is a structural transformation that changes the design without altering observable behavior. Each step must leave the system in a working state — green tests, running application.

> "Make the change easy, then make the easy change." — Kent Beck

> "Refactoring is a disciplined technique for restructuring an existing body of code, altering its internal structure without changing its external behavior." — Martin Fowler

## Activation

This skill activates when:
- `/debug-workflow` produces P3 items (code smell, tech debt)
- The user requests a restructuring ("extract this gateway", "migrate to...")
- The architecture violates the Dependency Rule
- A module has become too large or too coupled

---

## Step 1: DIAGNOSTIC

Before any refactoring, answer these questions:

1. **What is the concrete problem?** Not "the code is dirty" but "the Shipment entity contains pricing logic that should be in its own use case"
2. **What is the current behavior?** List the existing tests that cover the target code
3. **What is the target behavior?** Same observable behavior, different structure
4. **Which files are impacted?** List all files that will need to change
5. **Are there tests?** If not, write them BEFORE refactoring (golden master tests)

**Present the diagnostic to the user and wait for validation.**

---

## Step 2: CHOOSE THE PATTERN

### Mikado Method

**When**: The refactoring is blocked — changing A requires changing B, which requires C. The dependencies form a tree.

**How**:
1. Attempt the target change
2. Observe what breaks
3. Revert the change (`git checkout .`)
4. Handle prerequisites by climbing the tree (leaves first)
5. Each prerequisite is an independent commit, green tests
6. When all prerequisites are handled, the target change passes naturally

**Mikado Tree**:

```
[Target change: Extract PricingUsecase from ShipmentEntity]
├── [Prerequisite: Create PricingGateway abstract class]
│   └── [Prerequisite: Define PricingData interface]
├── [Prerequisite: Move calculatePrice() to PricingUsecase]
│   └── [Prerequisite: Independent tests for calculatePrice()]
└── [Prerequisite: Modify ShipmentEntity to delegate to PricingUsecase]
```

**Rule**: each leaf of the tree = 1 commit, green tests, unchanged behavior.

### Strangler Fig

**When**: Progressively replace a component without breaking the existing one. The old and new coexist during the migration.

**How**:
1. Create the new component alongside the old one
2. Redirect a first consumer to the new one
3. Verify (green tests)
4. Redirect the remaining consumers one by one
5. When the old one has no more consumers, delete it

**Typical cases in Clean Architecture**:
- Migrate an InMemory gateway to InPrisma
- Replace a monolithic use case with several targeted use cases
- Migrate a legacy module to a new bounded context

**Rule**: the old component is deleted ONLY when zero imports reference it.

### Parallel Change (Expand-Contract)

**When**: Change the interface of a component used by multiple consumers. Don't break everything at once.

**How**:
1. **Expand**: add the new interface alongside the old one (the component supports both)
2. **Migrate**: migrate consumers one by one to the new interface
3. **Contract**: remove the old interface when no one uses it anymore

**Typical cases**:
- Change the signature of a gateway method
- Modify an entity schema (add/rename a field)
- Refactor a controller DTO

**Rule**: never a big-bang migration. One consumer at a time.

### Extract (Clean Architecture specific)

**When**: The Dependency Rule is violated or a component has too many responsibilities.

**Common patterns**:
- **Extract Gateway**: I/O logic in a use case → create a gateway port + implementation
- **Extract Use Case**: controller has business logic → extract into a use case
- **Extract Entity**: an entity manages two concepts → split into two entities
- **Extract Bounded Context**: a module has become too large → split it

---

## Step 3: PLAN

Produce a refactoring plan that follows:

1. **Each step = green tests** — never an intermediate red step
2. **Each step = one commit** — rollback possible at each point
3. **Leaves-first order** (Mikado) — prerequisites before the target
4. **Independent branches** if possible (same rules as debug-workflow Phase 3)

Plan format:

```
REFACTORING PLAN:
  pattern: [Mikado | Strangler Fig | Parallel Change | Extract]
  target: [description of the target change]
  reason: [why this refactoring is necessary]

  STEPS:
    1. [description] — [impacted files] — [type: prerequisite | migration | cleanup]
    2. ...

  RISKS:
    - [identified risk] — [mitigation]

  GOLDEN MASTER TESTS:
    - [tests to write BEFORE if coverage is insufficient]
```

**Present the plan to the user and wait for validation.**

---

## Step 4: EXECUTE

For each step of the plan, apply `/tdd`:

1. If an existing test covers the behavior → verify it is green
2. If no test exists → write a non-regression test BEFORE the modification (RED → GREEN for the golden master, then refactor)
3. Apply the modification
4. Verify that ALL tests pass (`pnpm test`)
5. Commit

**If a step breaks something unexpected**:
- STOP — do not cascade corrections
- Revert (`git checkout .`)
- Add the newly discovered prerequisite to the Mikado tree
- Resume from the leaves

---

## Step 5: VALIDATE

After all steps:
1. Full test suite: `pnpm test`
2. Verify that observable behavior has NOT changed
3. Verify that the target structure is achieved
4. If an acceptance test exists for the impacted feature, rerun it

---

## Anti-patterns

- Refactoring without tests → you don't know if you broke something
- Big-bang refactoring → change everything at once, pray it works
- Refactoring AND adding a feature at the same time → one commit does ONE thing
- Refactoring code that has no problem → YAGNI applies to refactoring too
- Creating an abstraction "just in case" → refactor TOWARD patterns when pain emerges, not before

---

## Integration with Other Skills

| From | To `/refactor` | Context |
|------|----------------|---------|
| `/debug-workflow` | P3 items | Debug identifies debt, `/refactor` addresses it |
| `/architecture-backend` or `/architecture-frontend` | Dependency Rule violation | Architecture shows coupling, `/refactor` fixes it |
| `/event-storming` | BC too large | ES reveals a module should be split |
| `/implement-feature` | Resistant code | Implementation reveals a prerequisite refactoring is needed |
