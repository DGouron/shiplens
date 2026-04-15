---
name: naming-audit
description: Audit naming quality (files, functions, types, variables, folders) without reading the code. Takes names as input and reports what Claude understands from each name alone. Judges three axes: Screaming Architecture (does the name reveal the domain?), Clean Code (full words, intention-revealing, no abbreviations), and Ubiquitous Language (vocabulary consistency across the codebase). Useful to validate that names self-document.
triggers:
  - "naming.*audit"
  - "audit.*naming"
  - "check.*names"
  - "review.*naming"
---

# Naming Audit

Audit naming quality by forcing Claude to interpret names **without** reading their content. The gap between "what the name suggests" and "what it actually does" reveals naming failures.

## The Fundamental Principle

> "A good name tells you *what* it does. A great name tells you *why* it exists." — Uncle Bob, *Clean Code*

If Claude can accurately describe a function's purpose from its name alone — without opening the file — the naming is doing its job. If Claude must guess, the name has failed.

**The audit is a blind test.** Never read the file content during this skill. Never use `Read` on the target files. Only operate on the names — file paths, exported symbols, type names. The value of the audit dies the moment you peek at the implementation.

## Activation

Three input modes:

### Mode 1: Inline list
```
/naming-audit "getWorkspaceDashboard, useDashboardPresenter, TeamHealthTier, DashboardInHttpGateway"
```
A comma-separated (or newline-separated) list of names. Each is audited standalone.

### Mode 2: Scope scan
```
/naming-audit backend/src/modules/analytics/
/naming-audit frontend/src/modules/analytics/interface-adapters/
```
Use `Glob` to collect all file paths in the scope, then extract exported symbol names via `Grep` (for `^export` lines) **without reading the rest of the file**. Audit file names + exported symbols.

### Mode 3: Bounded Context (fullstack)
```
/naming-audit analytics
```
Audit both `backend/src/modules/analytics/` AND `frontend/src/modules/analytics/` in one report. Highlight cross-side vocabulary divergences (a shared BC must share its language).

## Workflow

### Step 1: Collect names
- Mode 1: parse the inline list
- Mode 2: `Glob` the scope for `*.ts`, `*.tsx` files; `Grep` `^export (class|interface|function|const|type|abstract)` to collect symbol names; DO NOT read file bodies
- Mode 3: same as Mode 2 applied to both workspaces

### Step 2: Audit each name on three axes

For each name, write **two** things:

1. **Interpretation**: what this name *suggests* to you, based purely on its letters. One sentence. Be honest — if ambiguous, say so.
2. **Verdict** per axis (Pass / Weak / Fail):
   - **Screaming Architecture**: does the name scream the domain (business intent) or the framework (technical)?
   - **Clean Code**: full words, no abbreviations, no single letters, intention-revealing, self-documenting?
   - **Ubiquitous Language**: is it from the business vocabulary? Consistent with sibling names in the module?

### Step 3: Cross-name analysis
After auditing each name, look at the collection as a whole:
- **Vocabulary consistency**: same concept named differently in different files? (e.g., `shipment` vs `parcel` vs `package`)
- **Layer leakage**: technical layer names bleeding into domain names? (e.g., `UserPrismaModel` — Prisma is infrastructure, it shouldn't appear in a domain type)
- **Synonyms without reason**: `get` vs `fetch` vs `load` vs `retrieve` — pick one per module unless they mean different things

### Step 4: Produce the report

Save to `docs/naming-audit/<scope>.md` if Mode 2 or 3. Display inline for Mode 1.

## Output Format

```markdown
# Naming Audit — [Scope]

*Date: YYYY-MM-DD*
*Audited: [N] names*

---

## Per-name audit

| Name | Interpretation | Screaming Arch | Clean Code | Ubiquitous | Overall |
|------|---------------|----------------|------------|------------|---------|
| `getWorkspaceDashboard` | "Fetch the dashboard for a workspace" | Pass — domain verb+noun | Pass — full words | Pass — `workspace`, `dashboard` are business terms | ✅ |
| `TeamHealthTier` | "A tier level for a team's health" | Pass — pure domain | Pass — full words | Pass — aligns with health-tier UI concept | ✅ |
| `useDash` | Ambiguous — "use a dashboard"? "use dash (symbol)"? | Pass | **Fail — abbreviation** | Fail — `Dash` is not a business term | ❌ |
| `QMgr` | "Queue Manager"? "Query Manager"? No confident read | Weak | **Fail — abbreviation, single letter** | Fail — jargon | ❌ |
| `DashboardInHttpGateway` | "A gateway implementation using HTTP" | Pass — screams I/O boundary | Pass | Pass — matches naming convention `*.in-<source>.gateway.ts` | ✅ |

---

## Cross-name analysis

### Vocabulary consistency

| Concept | Variants found | Recommendation |
|---------|----------------|----------------|
| Team health | `TeamHealthTier`, `teamHealth`, `healthStatus` | Pick one — `TeamHealthTier` is most expressive |

### Layer leakage

| Name | Leak | Fix |
|------|------|-----|
| `UserPrismaModel` | `Prisma` is infrastructure leaking into a domain-looking type | Rename to `UserRecord` (persistence layer) or move to `interface-adapters/` |

### Synonyms without reason

| Synonyms | Files involved | Suggestion |
|----------|----------------|------------|
| `get*` vs `fetch*` | `getWorkspaceDashboard`, `fetchTeamMembers` | Standardize: `get` for local reads, `fetch` for network — or pick one |

---

## Summary

- Names audited: [N]
- Pass: [X] ([%])
- Weak: [Y] ([%])
- Fail: [Z] ([%])

### Top issues
1. [Name/pattern] — [why it fails, one sentence]
2. ...

### Top wins
1. [Name] — [why it works, one sentence]
2. ...
```

## The three axes in detail

### Screaming Architecture

From *Clean Architecture* (Bob Martin): "the architecture should scream the use cases of the system, not the framework."

| Pass | Fail |
|------|------|
| `CreateShipmentUsecase` | `ShipmentController` (controller is framework noise in the domain name) |
| `TeamHealthTier` | `NestJSHealthEnum` (framework in the name) |
| `workspaceDashboard` | `dashboardDto` (DTO is transport, not domain) |

### Clean Code (Naming Rules)

From *Clean Code* (Bob Martin):
- Intention-revealing names
- Avoid disinformation (don't name a list `accountList` if it's a `Set`)
- Use pronounceable names
- Use searchable names — avoid single letters except tightly-scoped loop variables
- Don't use encoding prefixes (`m_`, `Hungarian notation`)
- No abbreviations

| Pass | Fail |
|------|------|
| `existingWorkspaceConnection` | `existingWksConn` (abbreviations) |
| `synchronizationStatus` | `syncStat` (abbreviations) |
| `for (const team of teams)` | `for (const t of ts)` (single letters) |

### Ubiquitous Language

From *Domain-Driven Design* (Eric Evans): terms from the ubiquitous language of the Bounded Context must be used **consistently** in code, UI, tests, docs.

| Pass | Fail |
|------|------|
| `CycleReport` (product vocabulary) | `Rapport` (leftover French, inconsistent with English everywhere) |
| `blockedIssue` (matches product term) | `stuckTicket` (product says "blocked issue") |
| Same term across back + front: `TeamHealthTier` | `TeamHealthTier` (back) vs `MemberHealthLevel` (front) for same concept |

## Rules

- **Blind**: NEVER read the target file's content. `Read` is forbidden on files being audited. `Grep` is allowed only to extract symbol names (`^export` lines, no body).
- **Honest interpretation**: write what the name *actually* suggests to you. If a name is ambiguous, say so — that is already a finding.
- **Three axes, one report**: do not produce three separate audits. One unified report per scope.
- **No prescription without diagnosis**: only suggest a rename after explaining why the current name fails.
- **Respect exceptions**: loop indices `i`, `j` in tight scope are OK. HTTP verbs in controllers (`get`, `post`) are OK. Well-known acronyms (`URL`, `HTTP`, `ID`, `DTO`) are OK when universally understood.

## Invocation Examples

```
/naming-audit "TeamHealthTier, useDashboardPresenter, DashboardInHttpGateway"
/naming-audit backend/src/modules/analytics/
/naming-audit frontend/src/modules/synchronization/interface-adapters/
/naming-audit analytics              # fullstack BC audit
```

## When to use

- Before merging a new module (design review)
- After a big rename or refactor (regression check)
- During a code review when names feel off but you can't articulate why
- When onboarding — if Claude can read the module just from names, a human can too
- During ubiquitous language drift (product vocabulary has evolved but code lags)

## When NOT to use

- On test files (test names have their own conventions: `describe` = context, `it` = behavior)
- On config files (`*.config.ts`, `vite.config.ts`) — framework-imposed names
- On generated files (Prisma client, zod inferred types) — names are mechanical
- When you need deep behavior analysis — this skill audits *names only*, not implementation. Use `auto-review` for implementation quality.
