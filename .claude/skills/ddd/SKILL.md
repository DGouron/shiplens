---
name: ddd
description: Strategic DDD guide for this project (fullstack — backend + frontend share the same bounded contexts). Use to slice the domain into bounded contexts, define ubiquitous language, create a new business module, analyze boundaries between contexts. Tactical patterns follow Clean Architecture (see architecture-backend and architecture-frontend skills).
---

# Domain-Driven Design - Strategic Guide

## Activation

This skill activates for high-level domain decisions:
- Slicing into Bounded Contexts
- Defining Ubiquitous Language
- Creating a new business module
- Analyzing relationships between contexts

## Important Clarification

> **Clean Architecture definitions take precedence over tactical DDD definitions.**

DDD is used only at the **strategic** level (domain slicing, language). Tactical patterns (Entities, Use Cases, Gateways, Presenters) follow **Clean Architecture**.

| What we take from DDD | What we DO NOT take |
|-----------------------|-----------------------|
| Bounded Contexts | Aggregates |
| Ubiquitous Language | Repositories (we have Gateways) |
| Context Mapping | Domain Events |
| Module slicing | Complex Value Objects |

---

## Bounded Context

> "A Bounded Context delimits the applicability of a particular model." — Eric Evans

One Bounded Context = one NestJS module in `backend/src/modules/<context-name>/`

Each BC is a **self-contained module** with its own providers, controllers, and gateways.

### Identifying a Bounded Context

**Signs that a new BC is needed:**
- The same term has different meanings depending on the context
- A different team could manage this part
- The model is becoming too complex
- Business rules diverge

---

## Communication Between Bounded Contexts

BCs communicate **via NestJS dependency injection** and module exports.

### Communication Rules

| Allowed | Forbidden |
|---------|-----------|
| Import an exported NestJS module | Directly import an internal file from another BC |
| Pass data (DTOs, primitives) | Share mutable entities |
| Inject an exported use case | Access another BC's internal gateway |

---

## Ubiquitous Language

> "Use the model as the backbone of a language." — Eric Evans

Business vocabulary must be:
- **Consistent**: same term = same concept within a given context
- **Explicit**: no ambiguity
- **Shared**: understood by both developers AND business stakeholders

---

## Workflow: Creating a New Bounded Context

### Step 1: Identify the Domain

```
DDD - Identification

New domain identified: [name]

Questions to validate:
1. What business problem does it solve?
2. What are the specific terms?
3. What are the main entities?
4. Which existing BCs will use it?
```

### Step 2: Define the Language (glossary)

### Step 3: Define the Public API (NestJS module exports)

### Step 4: Create the Structure

After validation -> **Switch to the Architecture skill** for tactical details.

---

## Anti-patterns to avoid

- No single catch-all "domain" module
- No mixing vocabularies from multiple contexts
- No circular dependencies between contexts
- No importing internal files from another BC
- No naming modules by technical aspect ("services", "models")
