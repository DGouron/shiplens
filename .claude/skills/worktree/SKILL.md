---
name: worktree
description: Git worktree management for working on multiple branches in parallel. Create, list, remove, and synchronize worktrees. Isolates in-progress features to avoid conflicts.
triggers:
  - "worktree"
  - "parallel.*branch"
  - "branche.*parallèle"
  - "nouvelle.*session"
  - "git worktree"
---

# Command /worktree - Git Worktree Management

Manages Git worktrees for working on multiple branches in parallel across different Claude Code sessions.

## ABSOLUTE Security Rules

- NEVER push directly to `main`
- NEVER commit directly to `main`
- Only allowed action on `main`: `git pull origin main`
- ALWAYS create a working branch

---

## Subcommands

### `/worktree` or `/worktree list`
Lists all existing worktrees with their branch and status.

### `/worktree add <name> [--from <branch>]`
Creates a new worktree.
- By default, based on `main`
- Path: `.worktrees/<name>`

### `/worktree remove <name>`
Removes a worktree (asks for confirmation if not clean).

### `/worktree sync [name]`
Synchronizes the worktree with `main` (pull only).

### `/worktree connect <name>`
Changes the working directory to the specified worktree.

---

## Worktree Architecture

```
shiplens/                        <- Main worktree
├── src/
├── tests/
└── .worktrees/
    ├── feature-shipping/        <- Feature worktree
    │   ├── src/
    │   └── tests/
    └── bugfix-tracking/         <- Bugfix worktree
        ├── src/
        └── tests/
```

---

## Workflow Inside a Worktree

```bash
# 1. Create the worktree
git worktree add .worktrees/feature-shipping -b feature/shipping main

# 2. Work inside the worktree
cd .worktrees/feature-shipping

# 3. Install dependencies
pnpm install

# 4. Work, commit...
git add .
git commit -m "feat(shipping): add shipment entity"

# 5. Push the branch
git push origin feature/shipping

# 6. Once merged, clean up
cd ../..
git worktree remove .worktrees/feature-shipping
```

---

## Synchronization

```bash
# Sync a worktree with main
cd .worktrees/<name>
git fetch origin
git rebase origin/main
```

---

## Output Template

### Worktree List

```
WORKTREES

| Usage | Path | Branch |
|-------|------|--------|
| main | shiplens/ | main |
| feature | .worktrees/feature-shipping | feature/shipping |
```

### Worktree Creation

```
WORKTREE CREATED

Name    : <name>
Path    : <path>
Branch  : <branch> (based on main)

Install dependencies:
   cd <path> && pnpm install

Start a session:
   cd <path> && claude
```

---

## Rules

- **NEVER** push directly to `main`
- **NEVER** create a worktree inside the source directory
- **ALWAYS** use `.worktrees/` as the parent directory
- **ALWAYS** use absolute paths in displayed commands
- **ALWAYS** remind to run `pnpm install` after creation
- **CHECK** that the branch is not already checked out in another worktree
- **After a context reset**: always verify you are in the correct worktree before editing
