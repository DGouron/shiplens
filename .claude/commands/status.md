# /status — Full Project Health Diagnostic

**Read-only. No modifications.**

## 1. Technical Health

Run and report results:

```bash
pnpm lint:ci            # Biome linting
npx tsc --noEmit        # TypeScript validation
pnpm test               # Unit tests
```

## 2. Structure by Module

For each directory under `backend/src/modules/`:
- Number of files
- Number of corresponding tests (in `backend/tests/modules/`)

## 3. Technical Debt

- Files > 200 lines (list with line counts)
- `TODO` / `FIXME` / `HACK` / `WORKAROUND` grep (count + locations)

## 4. Git

- Current branch
- Last 10 commits (`git log --oneline -10`)
- Uncommitted files (`git status`)

## 5. Outdated Dependencies

```bash
pnpm outdated
```

## 6. .claude/ Consistency

- Structure files present (`rules/`, `agents/`, `skills/`, `commands/`)
- Each agent references a valid skill or role
- Skills listed in CLAUDE.md match folders in `skills/`

## 7. Summary

| Check | Status |
|-------|--------|
| Types | PASS / FAIL |
| Lint | PASS / FAIL |
| Tests | PASS / FAIL |

**Debt**: Files > 200 lines, TODO count, outdated deps

**List of problems** or "All clean"

## Rules

- Read-only -- do not modify anything
- If a command fails, note the error and continue
- Report facts, no interpretation
