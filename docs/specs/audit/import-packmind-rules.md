# Import Packmind practices as audit rules

## Status: implemented

## Context
The tech lead who already uses Packmind to document their team's practices does not want to re-enter them in Shiplens. Synchronization allows leveraging existing work in Packmind and transforming it into automatically evaluable audit rules.

## Rules
- Connecting to Packmind requires a configurable authentication token
- Each measurable Packmind practice is converted into a Shiplens audit rule with identifier, name, severity and condition
- Qualitative (non-measurable) Packmind practices are included as checklist items in the report, without automatic evaluation
- Synchronization is triggered manually only
- If Packmind is unreachable, previously synchronized rules remain usable
- Rules imported from Packmind are identified by their origin to distinguish them from manual rules
- A resynchronization updates existing rules and adds new ones, without deleting those that have disappeared on the Packmind side

## Scenarios
- nominal synchronization: {valid token, 5 Packmind practices including 3 measurable and 2 qualitative} -> 3 audit rules created + 2 checklist items added + origin "Packmind" marked
- measurable practice converted: {Packmind practice "PR review under 24h", measurable} -> audit rule with condition "review delay > 24 hours"
- qualitative practice preserved: {Packmind practice "Write clear commit messages", non-measurable} -> checklist item in the report + no automatic evaluation
- resynchronization with new practices: {3 existing rules, 5 Packmind practices after addition} -> 2 new rules added + 3 existing ones updated
- Packmind unreachable: {valid token, Packmind unavailable, 3 cached rules} -> 3 cached rules used + warning "Packmind is unreachable. Cached rules are being used."
- invalid token: {expired or incorrect token} -> reject "The Packmind token is invalid. Please check your configuration."
- missing token: {no token configured} -> reject "No Packmind token configured. Please enter your authentication token."
- no practices available: {valid token, Packmind reachable, no practices defined} -> reject "No practices found in your Packmind workspace."
- first synchronization without cache and Packmind unreachable: {valid token, Packmind unavailable, no cached rules} -> reject "Packmind is unreachable and no rules have been previously synchronized."

## Out of scope
- Automatic or scheduled synchronization
- Writing to Packmind (read-only)
- Conflict management between a manual rule and a Packmind rule with the same identifier
- Advanced conversion mapping configuration

## Implementation

### Bounded Context
`audit` — existing module (`src/modules/audit/`)

### Artifacts
- **Modified entity**: `AuditRule` — added `origin` field (`'manual' | 'packmind'`, default `'manual'`)
- **New entity**: `ChecklistItem` — qualitative practices with `identifier`, `name`, `origin`
- **Type**: `PackmindPractice` — representation of Packmind practices (plain type, not an entity)
- **Use Case**: `SyncPackmindRulesUsecase` — orchestrates manual synchronization
- **Gateway port**: `PackmindGateway` (abstract class) — fetchPractices(token)
- **Gateway port**: `ChecklistItemGateway` (abstract class) — save, findAll
- **Gateway impl**: `PackmindInHttpGateway` — HTTP calls to the Packmind API
- **Gateway impl**: `ChecklistItemInFilesystemGateway` — JSON file storage
- **Modified gateway**: `AuditRuleInFilesystemGateway` — origin serialization + findAllByOrigin
- **Presenter**: `SyncPackmindRulesPresenter` — SyncResult to ViewModel
- **Controller**: `SyncPackmindRulesController` — `POST /audit/sync-packmind`

### Endpoint
| Method | Route | Use Case |
|--------|-------|----------|
| POST | `/audit/sync-packmind` | `SyncPackmindRulesUsecase` |

### Architectural decisions
- Origin added as optional field on AuditRule (backward compatible, default 'manual')
- ChecklistItem is a separate entity (not an AuditRule without a condition)
- PackmindPractice is a plain type (no business invariants to protect)
- Token passed in the request body (no env var)
- JSON file storage (not Prisma) — consistent with the existing audit module
- Cache = rules already persisted on the filesystem (no explicit cache)

## Glossary
| Term | Definition |
|------|------------|
| Packmind | Collaborative tool for documenting team practices |
| Measurable practice | Packmind practice that can be translated into a verifiable condition on metrics |
| Qualitative practice | Descriptive Packmind practice, not translatable into an automatic condition |
| Checklist | List of qualitative practices included in the report for manual verification |
| Cache | Latest version of synchronized rules, used when Packmind is unavailable |
| Synchronization | Import of Packmind practices and conversion into Shiplens audit rules |
