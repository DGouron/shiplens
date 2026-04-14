# Shiplens Spec DSL

## Why a Custom DSL

- Better signal/token ratio than Gherkin (~40% more compact)
- No binding layer (Cucumber) needed
- Directly translatable into tests without ambiguity
- Human-readable AND agent-parsable

## Scenario Structure

```
- <label>: {<inputs>} → <outputs>
```

- **label**: short scenario name (e.g., `valid`, `no recipient`, `weight exceeds limit`)
- **inputs**: input data in object notation
- **outputs**: expected result (status, returned value, error)

## Conventions

- `→ reject "message"`: the system refuses with this error message (in English)
- `→ status "<value>"`: the resulting entity has this status
- `→ <property> "<value>"`: the resulting entity has this property
- `+` to combine multiple outputs: `→ status "pending" + tracking "SL-*"`
- `*` as wildcard in values

## Full Example

```markdown
# Create a shipment

## Context
The sender must be able to create a shipment with a recipient and a parcel.

## Rules
- shipment requires: sender address, recipient address, parcel weight
- new shipment status: "pending"
- tracking number format: "SL-XXXXXXXX"
- recipient is required
- max weight: 30kg

## Scenarios
- valid: {sender: "123 Rue A", recipient: "456 Rue B", weight: 2.5kg} → status "pending" + tracking "SL-*"
- no recipient: {sender: "123 Rue A"} → reject "Recipient is required"
- overweight: {sender: "123 Rue A", recipient: "456 Rue B", weight: 35kg} → reject "Weight cannot exceed 30kg"

## Out of scope
- Shipment price calculation
- Carrier selection
```

## Rules

- **Rules** = business invariants (what the business-rules-extractor will find in the code)
- **Scenarios** = concrete examples (what tests will verify)
- One scenario = one behavior. No mega-scenarios
- Minimum 1 nominal + 1 edge case
- Error messages always in English (project rule: English everywhere)
- No technical jargon in rules or scenarios
