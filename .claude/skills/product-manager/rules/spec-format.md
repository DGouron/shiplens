# Spec Format

Each spec in `docs/specs/` follows this format:

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
