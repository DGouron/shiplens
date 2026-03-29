---
name: event-storming
description: "Lance une session Event Storming Big Picture sur un bounded context ou l'ensemble du backend. Decouvre les domain events, commands, entities, frontieres de contexte. Produit un document structure dans docs/ddd/."
triggers:
  - "event.?storming"
  - "domain.*events"
  - "context.*map"
  - "bounded.*context.*analyse"
---

# Event Storming

Lance une session Event Storming Big Picture sur un bounded context ou l'ensemble du backend.

## Activation

- `/event-storming <bounded-context>` — analyse un BC existant dans le code
- `/event-storming audit` — analyse globale de tous les BCs
- `/event-storming explore <brief>` — exploration pre-code depuis un brief fonctionnel

## Workflow

### Etape 1 : Parser l'input

Determiner le mode :
- **Mode cible** : nom du BC fourni -> analyse ce module dans le code
- **Mode audit** : "audit" ou "global" -> analyse tous les modules
- **Mode exploration** : "explore" + brief -> propose des BCs, entites, events AVANT le code

### Etape 2 : Lancer l'agent

Spawner l'agent `event-storming` avec ce prompt :

```
Mode : <cible|audit|exploration>
Bounded Context : <nom ou "tous">
Brief : <brief fonctionnel si mode exploration>

Executer l'Event Storming Big Picture selon ta mission.
```

Utiliser `subagent_type: "event-storming"` et `model: "opus"`.

### Etape 3 : Restituer

Afficher le resultat de l'agent tel quel.
Les documents sont ecrits par l'agent dans `docs/ddd/event-storming/`.
L'agent enrichit `docs/ddd/ubiquitous-language.md` avec les termes decouverts.

## Exemples d'invocation

```
/event-storming shipping
/event-storming audit
/event-storming explore "Le systeme doit permettre de suivre des colis en temps reel"
```
