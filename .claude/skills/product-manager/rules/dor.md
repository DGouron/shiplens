# Definition of Ready (DoR)

A spec is "ready" when it satisfies ALL of the following criteria:

## Checklist

- [ ] **Clear context**: the user problem is explicit
- [ ] **Acceptance criteria**: at least 1 nominal scenario + 1 edge case (DSL format)
- [ ] **Out of scope defined**: what we are NOT doing is documented
- [ ] **INVEST validated**: all 6 criteria passed without KO
- [ ] **Glossary present**: if domain-specific terms exist
- [ ] **No blocking dependency**: implementable immediately
- [ ] **User validation**: the spec has been reviewed and approved

## Rules

- A non-ready spec must NOT be passed to `/implement-feature`
- If a criterion is missing, return to the challenge phase with the PM
- The DoR is a quality filter, not a formality
