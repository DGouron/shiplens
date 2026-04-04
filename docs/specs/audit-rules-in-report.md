# Display audit results in the sprint report

## Status: implemented

## Context
The tech lead wants to see at a glance which team practices are being followed and which are drifting. Without this visibility integrated into the cycle report, audit rules would be defined but nobody would see the results at the right time.

## Rules
- The cycle report contains a dedicated "Practice audit" section
- Each evaluated rule displays its status (pass, warn, fail), measured value, and expected threshold
- The overall adherence score is the percentage of rules with pass status
- The trend compares the adherence score over the last 3 completed cycles
- The trend requires at least 3 completed cycles to be displayed
- AI generates a recommendation for each failing rule
- Checklist items from qualitative practices are listed separately, without automatic status
- The audit section only appears if at least one rule is defined

## Scenarios
- nominal report: {completed cycle, 10 evaluated rules of which 8 pass, 1 warn, 1 fail} -> "Practice audit" section + adherence score "80%" + detail per rule with status, value, and threshold
- recommendation on failure: {rule "cycle time > 5 days" in fail, measured cycle time of 8 days} -> AI recommendation explaining probable causes and improvement paths
- trend displayed: {completed cycle, 3 previous cycles with scores 60%, 70%, 75%} -> trend displayed "60% -> 70% -> 75% -> 80%"
- insufficient trend: {completed cycle, fewer than 3 previous cycles} -> trend hidden + mention "Pas assez d'historique pour afficher la tendance."
- qualitative checklist: {2 qualitative practices imported from Packmind} -> 2 checklist items displayed without automatic status
- no rules defined: {completed cycle, no audit rules configured} -> "Practice audit" section absent from report
- all rules pass: {completed cycle, 5 evaluated rules all pass} -> adherence score "100%" + no recommendation
- all rules fail: {completed cycle, 5 evaluated rules all fail} -> adherence score "0%" + AI recommendation for each rule

## Out of scope
- Modifying rules from the report
- Notifications or alerts on failure
- Exporting the audit section separately from the report
- Comparing adherence between teams

## Glossary
| Term | Definition |
|------|------------|
| Audit section | Part of the cycle report dedicated to audit rule evaluation results |
| Adherence score | Percentage of rules with pass status out of total evaluated rules |
| Trend | Evolution of the adherence score over the last 3 completed cycles |
| Recommendation | AI-generated analysis to explain a failure and suggest improvement paths |
| Checklist | List of qualitative practices to verify manually, displayed without automatic status |

## Implementation

### Bounded Context
Analytics (primary), Audit (dependency)

### Artefacts
- **Entity** : SprintReport extended with nullable `auditSection` (Zod schema)
- **Use Case** : GenerateSprintReportUsecase extended (rule evaluation, adherence score, trend, AI recommendations)
- **Presenters** : SprintReportPresenter (DTO), ReportDetailPresenter (markdown with audit section)
- **Gateway** : SprintReportInPrismaGateway (JSON serialization of auditSection)
- **Migration** : `add-audit-section-to-sprint-report` (column `auditSection String?`)

### Endpoints
| Method | Route | Use Case |
|--------|-------|----------|
| POST | /analytics/cycles/:cycleId/report | GenerateSprintReportUsecase (extended) |

### Architectural decisions
- No new entity: auditSection is a nullable JSON field in SprintReport (projection, no own identity)
- Extension of existing use case rather than a new one (audit is part of the report)
- Single AI call for all recommendations (performance)
- Trend calculated from previous reports via findByTeamId (YAGNI)
- AnalyticsModule imports AuditModule to access audit gateways
