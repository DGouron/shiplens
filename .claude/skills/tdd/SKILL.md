---
name: tdd
description: Interactive guide for TDD Detroit School. Use whenever the user asks to write or modify code - new feature, bug fix, debug, refactoring, modification. Activates a RED-GREEN-REFACTOR workflow with validation at each step.
---

# TDD Interactive Guide - Detroit School

## Detroit School Philosophy

**State-based testing**: We test the observable result, not internal interactions.

| Principle | Explanation |
|-----------|-------------|
| **Test the state** | Verify the final result, not how we got there |
| **Inside-Out** | Start from the domain, work outward |
| **Minimal mocks** | Only for external I/O (gateways, API, DB) |
| **Robust tests** | Resistant to internal refactoring |

**When to mock:**
- ✅ Gateways (API, database, files)
- ✅ External services (email, payment)
- ❌ Internal business logic
- ❌ Collaborations between domain objects

```typescript
// ✅ Detroit: we test the final state
it("should add item to cart", () => {
  const cart = new Cart()
  cart.add(product)

  expect(cart.items).toContain(product)
  expect(cart.total).toBe(10)
})

// ❌ London: we test interactions (avoid this)
it("should call inventory.reserve", () => {
  const inventory = mock<Inventory>()
  cart.add(product)
  expect(inventory.reserve).toHaveBeenCalled()
})
```

---

## TDD Manifesto

| Principle | Meaning |
|-----------|---------|
| **Baby steps** | Small steps for fast and regular feedback |
| **Continuous refactoring** | Improve now, not "later" |
| **Evolutionary design** | Develop what is necessary and sufficient |
| **Executable documentation** | Tests ARE the living documentation |
| **Minimalist code** | Simple and functional > over-engineered |

## Minimal Test Principle

> "The simplest thing that could possibly work." — Kent Beck

> "As the tests get more specific, the code gets more generic." — Robert C. Martin

**Rules:**
1. **One behavior per test**
2. **From naive to complete**: simple case first, edge cases after
3. **No anticipation**: one cycle at a time

---

## Transformation Priority Premise (Robert C. Martin)

The Transformation Priority Premise is an Uncle Bob principle that guides the transition from RED to GREEN. The idea: when writing the minimal code to make a test pass, we apply **transformations** to the code — and these transformations have a natural **priority order**.

**Always choose the highest transformation in the list (the simplest).** Skipping steps often leads to a suboptimal design.

### List of transformations (from simplest to most complex)

| Priority | Transformation | Description | Example |
|----------|---------------|-------------|---------|
| 1 | `{} → nil` | No code → return null/undefined | `return undefined` |
| 2 | `nil → constant` | Return a hardcoded value | `return []` |
| 3 | `constant → variable` | Replace the constant with a parameter | `return items` instead of `return []` |
| 4 | `unconditional → conditional` | Add a branch | `if (age < 18) return false` |
| 5 | `scalar → collection` | Move from a single value to an array | `string → string[]` |
| 6 | `statement → recursion/iteration` | Loop over the collection | `items.map(transform)` |
| 7 | `value → mutated value` | Transform the accumulated value | `items.reduce(accumulate)` |

### When to apply it

The Transformation Priority Premise is a **guide**, not an absolute rule. It is particularly useful when:

- The transition to GREEN seems to require "a lot of code at once" → sign that transformations are being skipped
- You hesitate between multiple implementations to make the test pass → choose the highest transformation
- You are working on **algorithmic logic** (parsers, calculations, data transformations, complex validations)

It is less relevant for simple orchestration code (calling a gateway and returning the result).

### Concrete example — a presenter that formats tags

```
// RED: test "should return empty list when no tags"
// GREEN via {} → constant:
return [];

// RED: test "should return formatted tag for single item"
// GREEN via constant → variable:
return [formatTag(tags[0])];

// RED: test "should return formatted tags for multiple items"
// GREEN via scalar → collection + iteration:
return tags.map(formatTag);
```

If we had jumped straight to `map()` on the first test, it works — but we would have **guessed** the design instead of **discovering** it through tests.

### Warning sign

If during the GREEN phase you find yourself writing more than 3-5 lines of code, you are probably skipping transformations. Options:
1. Go back and add a simpler intermediate test
2. Check which transformation you are applying in the list

---

## Activation

This skill activates whenever the user asks to touch code:
- New features: "Implement...", "Add...", "Create..."
- Bug fixes: "Fix...", "Repair..."
- Debug: "Why does...", "It doesn't work..."
- Modifications: "Modify...", "Change...", "Update..."
- Refactoring: "Refactor...", "Improve...", "Clean up..."

---

## Mandatory Workflow

At each cycle, follow these 3 phases with **stop and user validation** between each.

### 🔴 RED Phase

**Objective**: Write ONE failing test

**Actions**:
1. Announce: "RED: I will test [specific behavior]"
2. Identify the smallest possible test (baby step)
3. Propose the test WITHOUT writing it
4. Wait for validation
5. Write the test after validation
6. Run `pnpm test` to confirm failure
7. Ask: "The test fails as expected. Shall we move to GREEN?"

**Template:**
```
🔴 RED - Test Proposal

Behavior to test: [description]
File: [path]

Proposed test:
[test code - state-based, verifies the result]

This test verifies that [explanation of the expected state].
Shall we validate this test?
```

---

### 🟢 GREEN Phase

**Objective**: Make the test pass with MINIMAL code

**Actions**:
1. Announce: "GREEN: I will make the test pass with the minimum code"
2. Propose the minimal implementation WITHOUT writing it
3. Wait for validation
4. Write the code after validation
5. Run `pnpm test` to confirm success
6. Ask: "The test passes. Shall we refactor or move to next cycle?"

**Rules**:
- MINIMAL code that makes the test pass
- No premature optimization
- Hardcoded values are acceptable if sufficient

---

### 🔵 REFACTOR Phase

**Objective**: Simplify without changing behavior

**Principles**:
- **KISS**: The simplest solution
- **YAGNI**: Remove what is not necessary
- **DRY**: Factor out only if real duplication exists

**Actions**:
1. Announce: "REFACTOR: Analyzing simplification opportunities"
2. Look for: dead code, premature abstractions, accidental complexity
3. Propose refactorings one by one
4. Wait for validation for each
5. Run `pnpm test` after each refactoring
6. Ask: "Refactor complete. Next RED cycle?"

**Priority order**: Remove > Simplify > Reorganize

---

## Special Case: Debug / Bug Fix

1. **Understand**: Expected behavior vs actual
2. **RED**: Test that reproduces the bug (must fail)
3. **GREEN**: Fix so the test passes
4. **REFACTOR**: Clean up if necessary

---

## Mandatory Checkpoints

Never move to the next phase without:
- ✅ Explicit user validation
- ✅ Tests executed and result as expected

## Specs and tickets: no predetermined code

TDD relies on **progressive design discovery**. Specs/tickets must NOT contain:

| Forbidden | Why |
|-----------|-----|
| Test names | The test emerges from the need, not the other way around |
| File names | Architecture reveals itself through iteration |
| Method signatures | Design is born from the simplest code |

The RED-GREEN-REFACTOR cycle makes the design emerge. The ticket describes the WHAT (behavior), not the HOW (implementation).

---

## Two Operating Modes

TDD has two modes that coexist depending on context:

### Interactive mode (this skill)

When **you** code. Claude guides, proposes, and waits for your validation between each RED/GREEN/REFACTOR phase. You keep control over every decision.

Trigger: `/tdd` or when you ask to code directly.

### Autonomous mode (feature-implementer agent)

When **the agent** codes. It uses the same TDD principles but without human validation between each phase. The acceptance criteria from the spec serve as validation instead of the human. The agent loops alone, reviews itself, and produces a report.

Trigger: `/implement-feature` which launches the `feature-implementer` agent.

Both modes follow the same rules: baby steps, minimal code in GREEN, state-based tests (Detroit School), mocks only for I/O.

---

## Anti-patterns to Block

- ❌ Production code without a failing test
- ❌ Multiple tests at once
- ❌ Implementing more than necessary in GREEN
- ❌ Refactoring without green tests
- ❌ Skipping a phase without validation
- ❌ Mocking internal business logic
- ❌ Predetermining code in specs/tickets
