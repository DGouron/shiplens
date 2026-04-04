# Define custom audit rules

## Status: implemented

## Context
The tech lead wants to formalize team practices as automatically verifiable rules. Without this, best practices remain oral, nobody knows if they are actually followed, and the same drifts come back every cycle.

## Rules
- A rule must have a unique identifier, a name, a severity, and a condition
- Possible severities are: info, warning, error
- A condition targets a metric threshold, a pattern on labels or statuses, or a ratio between two metrics
- A rule is immutable once created — to modify it, create a new one and archive the old one
- Rules are automatically evaluated at the end of each cycle
- An evaluation result is pass, warn, or fail, accompanied by an explanatory message
- Rules are stored in a configurable folder, defaulting to ./rules/
- A duplicate rule identifier is forbidden

## Scenarios
- nominal creation: {identifier "CT-MAX-5", name "Cycle time max 5 days", severity "warning", condition "cycle time > 5 days"} -> rule created + available for evaluation
- evaluation pass: {rule "cycle time > 5 days", completed cycle with average cycle time of 3 days} -> result "pass" + message "Cycle time moyen : 3 jours (seuil : 5 jours)"
- evaluation warn: {rule "ratio bugs/features > 0.5" with severity "warning", cycle with ratio 0.6} -> result "warn" + message "Ratio bugs/features : 0.6 (seuil : 0.5)"
- evaluation fail: {rule "cycle time > 5 days" with severity "error", cycle with average cycle time of 8 days} -> result "fail" + message "Cycle time moyen : 8 jours (seuil : 5 jours)"
- missing identifier: {name "My rule", severity "warning", condition present, identifier absent} -> reject "L'identifiant de la règle est obligatoire."
- invalid severity: {identifier present, severity "critical"} -> reject "La sévérité doit être info, warning ou error."
- invalid condition: {identifier present, condition "incomprehensible free text"} -> reject "La condition de la règle n'est pas reconnue. Formats acceptés : seuil sur métrique, pattern sur labels/statuts, ratio entre métriques."
- duplicate identifier: {identifier "CT-MAX-5" already existing} -> reject "Une règle avec l'identifiant CT-MAX-5 existe déjà."
- rules folder not found: {configured folder does not exist} -> reject "Le dossier de règles configuré est introuvable."

## Out of scope
- Editing an existing rule (archive and recreate)
- Real-time evaluation during an ongoing cycle
- Rules targeting individual developer metrics
- Graphical interface for rule creation (text file only)

## Implementation

### Bounded Context
`audit` — new module (`src/modules/audit/`)

### Artefacts
- **Entity** : `AuditRule` with `create()` + `evaluate()` — pure evaluation logic in the domain
- **Use Cases** : `CreateAuditRuleUsecase`, `EvaluateAuditRuleUsecase`
- **Gateway** : `AuditRuleInFilesystemGateway` — JSON file storage, one file per rule
- **Module** : `AuditModule` wired in `AppModule`

### Architectural decisions
- Condition modeled as discriminated union (threshold, ratio, pattern) parsed by `parseCondition()`
- File storage (not Prisma) — `<identifier>.json` in configurable folder via `AUDIT_RULES_DIRECTORY`
- `CycleMetrics` defined in the audit BC to avoid coupling with analytics
- `EvaluationResult` is a simple return type, not an entity
- `evaluate()` lives on the AuditRule entity — pure testable logic

## Glossary
| Term | Definition |
|------|------------|
| Audit rule | Automatic verification of a team practice, defined by an identifier, a name, a severity, and a condition |
| Severity | Importance level of the rule: info (informational), warning (attention required), error (critical violation) |
| Condition | Measurable criterion: threshold on a metric, pattern on labels/statuses, or ratio between two metrics |
| Evaluation | Verification of a rule against a completed cycle's data, producing pass, warn, or fail |
| Archiving | Removal of a rule from active evaluation without physical deletion |
