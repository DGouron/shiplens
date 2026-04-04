---
name: event-storming
description: "Runs a Big Picture Event Storming session on a bounded context or the entire backend. Discovers domain events, commands, entities, context boundaries. Produces a structured document in docs/ddd/."
triggers:
  - "event.?storming"
  - "domain.*events"
  - "context.*map"
  - "bounded.*context.*analyse"
---

# Event Storming

Runs a Big Picture Event Storming session on a bounded context or the entire backend.

## Activation

- `/event-storming <bounded-context>` — analyze an existing BC in the code
- `/event-storming audit` — global analysis of all BCs
- `/event-storming explore <brief>` — pre-code exploration from a functional brief

## Workflow

### Step 1: Parse the input

Determine the mode:
- **Target mode**: BC name provided -> analyze this module in the code
- **Audit mode**: "audit" or "global" -> analyze all modules
- **Exploration mode**: "explore" + brief -> propose BCs, entities, events BEFORE writing code

### Step 2: Launch the agent

Spawn the `event-storming` agent with this prompt:

```
Mode: <target|audit|exploration>
Bounded Context: <name or "all">
Brief: <functional brief if exploration mode>

Execute the Big Picture Event Storming according to your mission.
```

Use `subagent_type: "event-storming"` and `model: "opus"`.

### Step 3: Present

Display the agent result as-is.
Documents are written by the agent in `docs/ddd/event-storming/`.
The agent enriches `docs/ddd/ubiquitous-language.md` with the discovered terms.

## Invocation Examples

```
/event-storming shipping
/event-storming audit
/event-storming explore "The system must allow tracking packages in real time"
```
