# Spec Format

## Location

Specs are organized by bounded context under `docs/specs/<bc>/`:

- `analytics/` — cycle metrics, reports, dashboards, bottlenecks, estimation, member health, drifting issues
- `audit/` — custom audit rules, Packmind imports
- `identity/` — Linear workspace connection, authentication
- `notification/` — Slack alerts, real-time notifications
- `synchronization/` — Linear data sync, team selection, webhooks
- `_platform/` — cross-cutting concerns (frontend migration, design system, infrastructure setup)

Bounded contexts match `src/modules/` folder names 1:1. If a feature spans multiple BCs or is purely infrastructure, use `_platform/`.

Each spec follows this format:

```markdown
# [Title — action verb + object]

## Context

[Why this feature exists — the user problem, 2-3 sentences max]

## Rules

- [business invariant 1]
- [business invariant 2]
- ...

## Scenarios

- [nominal]: {inputs} → outputs
- [edge case 1]: {inputs} → reject "message"
- [edge case 2]: {inputs} → outputs
- ...

## Out of scope

- [what we are NOT doing]

## Glossary

| Term | Definition |
|------|------------|
| [domain term] | [precise meaning in this context] |
```

## Rules

- **Title**: action verb + object (e.g., "Create a shipment", "Filter parcels")
- **Context**: max 3 sentences, focused on the user problem
- **Rules**: business invariants in natural language, no technical details
- **Scenarios**: minimum 1 nominal + 1 edge case, compact DSL format (see `rules/spec-dsl.md`)
- **Out of scope**: mandatory — frames what we are NOT doing
- **Glossary**: mandatory if domain-specific terms exist
- **No code** in the spec — never class names, file names, or technical patterns
