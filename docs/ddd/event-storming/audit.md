# Event Storming — Audit

*Date: 2026-04-04*
*Scope: Definition, synchronization, and evaluation of team audit rules (manual and Packmind)*

## Domain Events (Orange)

| Event | Trigger | Source File |
|-------|---------|-------------|
| AuditRuleCreated | CreateAuditRule | `src/modules/audit/usecases/create-audit-rule.usecase.ts` |
| AuditRuleEvaluated | EvaluateAuditRule | `src/modules/audit/usecases/evaluate-audit-rule.usecase.ts` |
| PackmindRulesSynchronized | SyncPackmindRules | `src/modules/audit/usecases/sync-packmind-rules.usecase.ts` |
| PackmindRuleSyncedFromCache | SyncPackmindRules (Packmind unreachable) | `src/modules/audit/usecases/sync-packmind-rules.usecase.ts` (l.62-79) |

## Commands (Blue)

| Command | Actor | Produced Event | Source File |
|---------|-------|----------------|-------------|
| CreateAuditRule | user | AuditRuleCreated | `src/modules/audit/usecases/create-audit-rule.usecase.ts` |
| EvaluateAuditRule | system (via Analytics) | AuditRuleEvaluated | `src/modules/audit/usecases/evaluate-audit-rule.usecase.ts` |
| SyncPackmindRules | user | PackmindRulesSynchronized | `src/modules/audit/usecases/sync-packmind-rules.usecase.ts` |

## Entities (Yellow)

| Entity | Responsibility | Files |
|--------|---------------|-------|
| AuditRule | Automatically verifiable audit rule — identifier, name, severity, condition (threshold/ratio/pattern), origin (manual/packmind). Evaluates cycle metrics and produces pass/warn/fail. | `src/modules/audit/entities/audit-rule/audit-rule.ts` |
| ChecklistItem | Non-automatable qualitative practice — added to the report as a manual verification list | `src/modules/audit/entities/checklist-item/checklist-item.ts` |
| PackmindPractice | Representation of a Packmind practice before transformation into a rule or checklist | `src/modules/audit/entities/packmind/packmind-practice.ts` |

## Policies and Business Rules (Purple)

| Rule | Description | Source File |
|------|-------------|-------------|
| UniqueIdentifier | Each audit rule has a unique identifier — cannot create two rules with the same identifier | `src/modules/audit/usecases/create-audit-rule.usecase.ts` (l.23-25) |
| MandatoryIdentifier | Identifier cannot be empty | `src/modules/audit/entities/audit-rule/audit-rule.ts` (l.69-71) |
| ValidSeverity | Severity must be `info`, `warning`, or `error` | `src/modules/audit/entities/audit-rule/audit-rule.ts` (l.73-76) |
| ConditionParsing | Condition expression is parsed as `threshold`, `ratio`, or `pattern` — otherwise error | `src/modules/audit/entities/audit-rule/parse-condition.ts` |
| SeverityToOutcomeMapping | `error` → fail, `warning` → warn, `info` → pass (even if condition is violated) | `src/modules/audit/entities/audit-rule/audit-rule.ts` (l.197-209) |
| PackmindCacheFallback | If Packmind is unreachable, cached rules are used. If no cache, error. | `src/modules/audit/usecases/sync-packmind-rules.usecase.ts` (l.61-79) |
| MeasurableVsQualitative | Measurable practices become AuditRules, qualitative ones become ChecklistItems | `src/modules/audit/usecases/sync-packmind-rules.usecase.ts` (l.89-119) |

## Presenters (Green)

| Presenter | Exposed Data | File |
|-----------|-------------|------|
| SyncPackmindRulesPresenter | Number of created/updated rules, checklist items, fromCache, warning | `src/modules/audit/interface-adapters/presenters/sync-packmind-rules.presenter.ts` |

## Gateways and External Systems (White)

| System | Interaction | Gateway |
|--------|------------|---------|
| Filesystem | Audit rules and checklist items file persistence | `audit-rule.in-filesystem.gateway.ts`, `checklist-item.in-filesystem.gateway.ts` |
| Packmind API (HTTP) | Team practices retrieval | `src/modules/audit/entities/packmind/packmind.gateway.ts` |

## Relationships with Other Bounded Contexts

| Related BC | Pattern (Vaughn Vernon) | Direction | Detail |
|-----------|------------------------|-----------|--------|
| Analytics | Customer-Supplier | Audit (Supplier) → Analytics (Customer) | Audit exports `AuditRuleGateway`, `ChecklistItemGateway`, `CreateAuditRuleUsecase`, `EvaluateAuditRuleUsecase`, `SyncPackmindRulesUsecase`. Analytics imports the NestJS Audit module to access and evaluate rules in the report generation context. |

## Ubiquitous Language

| Term | Definition in this BC | Equivalent term elsewhere |
|------|----------------------|---------------------------|
| Audit rule | Automated verification of a team practice on a threshold, pattern, or ratio | — |
| Condition | Rule expression — `threshold` (metric threshold), `ratio` (ratio between metrics), `pattern` (presence in distribution) | — |
| Evaluation | Rule verification against a cycle's metrics, producing pass, warn, or fail | — |
| Adherence score | Percentage of pass rules out of total evaluated | — |
| Checklist | List of qualitative practices to verify manually | — |
| Packmind | Collaborative tool for documenting team practices | — |
| Origin | Source of an audit rule — `manual` (created in Shiplens) or `packmind` (synchronized) | — |

## Hot Spots (Pink)

| Problem | Severity | Detail |
|---------|----------|--------|
| Filesystem persistence | medium | Audit rules and checklist items are persisted on the filesystem, unlike all other BCs that use Prisma. Risk of inconsistency and potential issues in multi-instance or containerized deployments. |
| No rule deletion | low | There is no usecase to delete or archive an audit rule. Packmind rules are created or updated, but never deleted if they disappear from Packmind. |
| CycleMetrics as implicitly shared type | medium | The `CycleMetrics` type (`src/modules/audit/entities/audit-rule/cycle-metrics.ts`) is defined in the Audit module but built and populated by Analytics (`generate-sprint-report.usecase.ts` l.180-265). This is an implicit Published Language — it should be in `shared/domain/`. |
