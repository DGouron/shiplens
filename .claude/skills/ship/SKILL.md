---
name: ship
description: Ship - Commit and Push in one command. Chains staging, conventional commit, and push. Checks quality gates before any commit.
triggers:
  - "ship"
  - "/ship"
  - "commit.*push"
  - "push"
---

# Ship - Commit & Push

## Activation

This skill is activated with `/ship`. It chains verification, commit, and push.

## Optional arguments

```
/ship              # Commit + push
/ship no-push      # Commit only, no push
```

## Workflow

### Step 0: Quality Gates (BLOCKING)

**BEFORE any commit**, run:

```bash
pnpm test
```

**If tests fail**: display the errors and **STOP**. Do not commit until all tests pass.

---

### Step 1: Analysis

```bash
git status --short
git branch --show-current
git log --oneline -5
```

**Guards**:
- If branch = `main`: **STOP**, refuse to push directly
- If nothing to commit or push: inform and stop

### Step 2: Staging

- If files are not staged, list them and add them
- **NEVER** include `.env`, credentials, or secrets
- Use `git add <specific files>` (not `git add -A`)

### Step 3: Commit

Infer the message from the changes:

```
<type>(<scope>): <description>
```

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Refactoring |
| `test` | Tests only |
| `chore` | Maintenance |

**Rules**:
- Header max **72 characters**
- Description in lowercase, no trailing period
- **NEVER** mention Claude, Anthropic, Co-Authored-By

### Step 4: Push (unless `no-push`)

```bash
git push origin <branch>
```

### Step 5: Summary

```
SHIP

Branch  : <branch>
Commit  : <type>(<scope>): <description>
Push    : origin/<branch>
Tests   : all green
```

## Security

- **NEVER** use `--force` push
- **NEVER** push to `main`
- **NEVER** use `--no-verify`
- **NEVER** mention Claude/Anthropic in commits
