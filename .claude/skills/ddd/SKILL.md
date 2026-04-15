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

**One Bounded Context = one module on each side**:
- Backend: `backend/src/modules/<bc-name>/` — NestJS module with its own entities, usecases, controllers, gateways
- Frontend: `frontend/src/modules/<bc-name>/` — React module with its own entities (rare), usecases, presenters, hooks, views, gateways (HTTP)

Both sides share the **same BC name** and the **same ubiquitous language**. A Shipping BC on the backend exposes `CreateShipmentUsecase` and `ShipmentGateway`; on the frontend, it exposes `useShipmentCreator`, `ShipmentCreationPresenter`, `ShipmentInHttpGateway`. Same vocabulary, different layers.

Each side is a **self-contained module**: backend has its providers/controllers/prisma gateway; frontend has its presenters/hooks/http gateway registered in the singleton registry.

### Identifying a Bounded Context

**Signs that a new BC is needed:**
- The same term has different meanings depending on the context
- A different team could manage this part
- The model is becoming too complex
- Business rules diverge

---

## Communication Between Bounded Contexts

**Backend**: BCs communicate via NestJS dependency injection and module exports.
**Frontend**: BCs communicate via shared singleton registry (`frontend/src/main/dependencies.ts`) and shared domain types.

### Communication Rules (both sides)

| Allowed | Forbidden |
|---------|-----------|
| Import an exported NestJS module (back) or an exposed usecase from the registry (front) | Directly import an internal file from another BC (either side) |
| Pass data (DTOs, primitives) | Share mutable entities |
| Inject (back) or consume from registry (front) an exported usecase | Access another BC's internal gateway |
| Use types from `shared/domain/` (back) or `shared/domain/` (front, mirrored) | Re-define the same concept in two BCs with different shapes |

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

### Step 3: Define the Public API

- Backend: NestJS module exports (usecases, gateway ports if reused)
- Frontend: entries added to `frontend/src/main/dependencies.ts` (usecases, gateways)

### Step 4: Create the Structure

After validation, create BOTH modules:
- Backend first (domain owner): `backend/src/modules/<bc>/` — **Switch to `/architecture-backend`** for tactical details
- Frontend second (consumer/presenter): `frontend/src/modules/<bc>/` — **Switch to `/architecture-frontend`** for tactical details

If the BC has no frontend component (e.g., an internal sync job with no UI), only the backend module exists.

---

## Anti-patterns to avoid

- No single catch-all "domain" module
- No mixing vocabularies from multiple contexts
- No circular dependencies between contexts
- No importing internal files from another BC
- No naming modules by technical aspect ("services", "models")
