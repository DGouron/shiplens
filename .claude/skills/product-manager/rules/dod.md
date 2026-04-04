# Definition of Done (DoD)

A feature is "done" when it satisfies ALL of the following criteria:

## Checklist

- [ ] **All spec scenarios covered** by passing tests
- [ ] **TDD followed**: each behavior has a test written BEFORE the code
- [ ] **Tests green**: `pnpm test` passes without errors
- [ ] **Zero architecture violations**: dependency rule respected
- [ ] **Zero `any`, `as`, `!`** in the code
- [ ] **Full names**: no abbreviations
- [ ] **Error messages in French** for the end user
- [ ] **Tests in English**
- [ ] **Prisma migration** if schema was modified (backup done first)
- [ ] **Code review**: self-review or pair-review completed

## Rules

- A non-done feature must NOT be shipped
- If a criterion fails, fix it before declaring "done"
- The DoD is a quality contract, not a suggestion
