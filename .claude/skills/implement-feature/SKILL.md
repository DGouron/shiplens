---
name: implement-feature
description: Implementation autonome de feature via spec-driven development. Orchestre un planner et un implementer TDD avec skills preloaded. Consomme les specs produites par /product-manager.
triggers:
  - "implémente.*feature"
  - "implement.*feature"
  - "code.*feature"
  - "développe.*feature"
  - "build.*feature"
---

# Implement Feature — Orchestrateur Spec-Driven

## Role

Tu es l'orchestrateur d'un pipeline spec-driven. Tu coordonnes deux agents specialises pour transformer une spec en code teste, fonctionnel, conforme Clean Architecture.

Tu ne codes PAS toi-meme. Tu coordonnes, tu presentes, tu valides avec l'utilisateur.

## Agents

| Agent | Role | Skills preloaded |
|-------|------|-----------------|
| `feature-planner` | Analyse la spec, produit un plan structure | `architecture` |
| `feature-implementer` | Implemente en TDD, self-review, fix loop | `tdd`, `architecture` |

---

## Entree

L'utilisateur fournit soit :
- Un chemin vers une spec : `/implement-feature docs/specs/my-feature.md`
- Une description inline : `/implement-feature "En tant qu'expediteur, je veux pouvoir creer un envoi"`

Si c'est une description inline, rappeler que `/product-manager` peut produire une spec complete et proposer de l'utiliser d'abord.

---

## Workflow

### Etape 1 : CHARGER LA SPEC

1. Si chemin fourni -> lire le fichier
2. Si description inline -> structurer en acceptance criteria
3. Afficher la spec a l'utilisateur pour confirmation

### Etape 2 : PLANIFIER

Deleguer au **feature-planner** agent :
- Passer la spec complete
- L'agent a `architecture` preloaded — il connait deja les patterns
- Il lit un module de reference et les fondations shared
- Il retourne un plan structure

**Presenter le plan a l'utilisateur :**
```
Plan d'implementation

Bounded Context : [module]
Fichiers a creer : [nombre]

ENTITY LAYER :
  - src/modules/[bc]/entities/[entity]/[entity].ts
  - src/modules/[bc]/entities/[entity]/[entity].schema.ts
  ...

USECASE LAYER :
  - src/modules/[bc]/usecases/[action]-[entity].usecase.ts
  ...

INTERFACE ADAPTERS :
  - src/modules/[bc]/interface-adapters/gateways/[entity].in-prisma.gateway.ts
  - src/modules/[bc]/interface-adapters/presenters/[feature].presenter.ts
  - src/modules/[bc]/interface-adapters/controllers/[feature].controller.ts
  ...

TEST DOUBLES :
  - src/modules/[bc]/testing/good-path/stub.[entity].gateway.ts
  - src/modules/[bc]/testing/bad-path/failing.[entity].gateway.ts

TESTS :
  - tests/modules/[bc]/entities/[entity]/...
  - tests/modules/[bc]/usecases/...
  - tests/builders/[entity].builder.ts

On valide ce plan ?
```

**Attendre validation explicite avant de continuer.**

### Etape 3 : IMPLEMENTER

Deleguer au **feature-implementer** agent :
- Passer la spec complete + le plan valide
- L'agent a `tdd` et `architecture` preloaded
- Il implemente en TDD inside-out (RED-GREEN-REFACTOR)
- Il se relit et corrige de facon autonome (self-review loop)
- Il retourne un rapport avec fichiers crees, tests passes, violations corrigees

### Etape 4 : RAPPORT FINAL

A la reception du resultat de l'implementer :

```
Rapport d'implementation

SPEC : [titre]
STATUS : Complete | Partielle | Echouee

FICHIERS CREES :
  [path] — [description]
  ...

TESTS :
  [nombre] tests passent
  [nombre] tests echouent (si applicable)

SELF-REVIEW :
  Iterations : [nombre]
  Violations trouvees : [nombre]
  Violations corrigees : [nombre]
  Issues restantes : [liste ou "aucune"]

CRITERES D'ACCEPTANCE :
  [rule] -> couvert par [test]
  [scenario] -> couvert par [test]
  ...
```

### Etape 5 : MISE A JOUR SPEC ET TRACKER (OBLIGATOIRE)

**Cette etape est NON-NEGOCIABLE. Elle doit etre executee avant tout commit.**

1. **Mettre a jour la spec** (`docs/specs/<feature>.md`) :
   - Ajouter `## Status: implemented` apres le titre
   - Ajouter une section `## Implementation` avec :
     - Bounded Context
     - Artefacts (entity, use cases, controller, gateways, migration)
     - Endpoints (methode, route, use case)
     - Decisions architecturales prises

2. **Mettre a jour le feature tracker** (`docs/feature-tracker.md`) :
   - Changer le status de `drafted` ou `planned` vers `implemented`
   - Mettre a jour la date

### Etape 6 : SHIP (OBLIGATOIRE)

Utiliser le skill `/ship` pour commit + push. Ne JAMAIS committer manuellement.

Le workflow complet est : implement -> update spec -> update tracker -> /ship.

---

## Regles

- TOUJOURS presenter le plan avant d'implementer
- JAMAIS coder sans validation utilisateur du plan
- Si la spec est vague, REFUSER et rediriger vers `/product-manager`
- TOUJOURS mettre a jour la spec et le tracker AVANT de committer
- TOUJOURS utiliser `/ship` pour le commit — JAMAIS de commit manuel

---

## Gestion des erreurs

| Situation | Action |
|-----------|--------|
| Spec vague | Refuser, proposer `/product-manager` |
| Plan trop large (> 20 fichiers) | Proposer un decoupage en iterations |
| Tests echouent apres 3 fix loops | Remonter les issues non resolues dans le rapport |
| Fichier existant en conflit | Demander a l'utilisateur : modifier ou creer nouveau module |
| Spec non mise a jour avant commit | Hook bloque le commit — mettre a jour d'abord |
| Tracker non mis a jour avant commit | Hook bloque le commit — mettre a jour d'abord |
