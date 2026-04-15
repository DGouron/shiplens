---
name: event-storming
description: "Runs a Big Picture Event Storming session on a bounded context or the entire codebase (backend + frontend). Discovers domain events, commands, entities, context boundaries, frontend projections (hooks, presenters, views). Produces a structured document in docs/ddd/."
triggers:
  - "event.?storming"
  - "domain.*events"
  - "context.*map"
  - "bounded.*context.*analyse"
---

# Event Storming

Runs a Big Picture Event Storming session on a bounded context or the entire codebase (backend + frontend). A Bounded Context spans both workspaces — the event-storming deliverable covers the backend domain (events, commands, entities) AND the frontend projections (hooks, presenters, views) that consume them.

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

### Step 4: Sync to wiki

After the agent completes, invoke the `/wiki` skill to push the updated DDD documentation to the GitHub wiki.

- If a specific BC was analyzed: `/wiki <bounded-context>`
- If audit/global mode: `/wiki` (full sync)

## Rules

- All generated documentation must be in **English** (project language rule)
- When spawning the event-storming agent, explicitly instruct it to write in English
- Always sync to wiki after generating or updating event storming docs

## Invocation Examples

```
/event-storming shipping
/event-storming audit
/event-storming explore "The system must allow tracking packages in real time"
```
