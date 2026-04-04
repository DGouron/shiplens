---
name: business-rules-extractor
description: "Extracts business rules from a backend module and produces two tables: Product view (business concepts) and Dev view (type + source). Saves to docs/business-rules/."
triggers:
  - "business.*rules"
  - "règles.*métier"
  - "extraire.*règles"
  - "business rules"
---

# Business Rules Extractor

Extracts business rules from a backend module and produces two tables: Product view (business concepts) and Dev view (type + source).

## Activation

- `/business-rules-extractor <module>`
- "extract the business rules from..."
- "what are the rules of..."
- "business rules of the module..."

## Workflow

### Step 1: Parse the input

Extract from the user message:
- **Module**: module name (required)
- **Focus**: target subdomain (optional)

### Step 2: Launch the agent

Spawn the `business-rules-extractor` agent with this prompt:

```
Module: <module>
Focus: <focus or "complete">

Extract all business rules from the module according to your mission.
```

Use `subagent_type: "business-rules-extractor"` and `model: "sonnet"`.

### Step 3: Save

Save the result in `docs/business-rules/<module>.md`.

### Step 4: Present

Display the agent result as-is — do not summarize, do not reformat.

## Invocation Examples

```
/business-rules-extractor shipping
/business-rules-extractor tracking focus validation
/business-rules-extractor billing
```
