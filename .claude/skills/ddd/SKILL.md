---
name: ddd
description: Guide DDD stratégique pour ce projet. Utiliser pour découper le domaine en bounded contexts, définir l'ubiquitous language, créer un nouveau module métier, analyser les frontières entre contextes. Les patterns tactiques suivent Clean Architecture (voir skill architecture).
---

# Domain-Driven Design - Guide Stratégique

## Activation

Ce skill s'active pour les décisions de haut niveau sur le domaine :
- Découpage en Bounded Contexts
- Définition de l'Ubiquitous Language
- Création d'un nouveau module métier
- Analyse des relations entre contextes

## Clarification importante

> **Les définitions Clean Architecture priment sur les définitions DDD tactique.**

On utilise DDD uniquement au niveau **stratégique** (découpage domaine, langage). Les patterns tactiques (Entities, Use Cases, Gateways, Presenters) suivent **Clean Architecture**.

| Ce qu'on prend du DDD | Ce qu'on NE prend PAS |
|-----------------------|-----------------------|
| Bounded Contexts | Aggregates |
| Ubiquitous Language | Repositories (on a Gateways) |
| Context Mapping | Domain Events |
| Découpage modules | Value Objects complexes |

---

## Bounded Context

> "A Bounded Context delimits the applicability of a particular model." — Eric Evans

Un Bounded Context = un module NestJS dans `src/modules/<context-name>/`

Chaque BC est un **module autonome** avec ses propres providers, controllers, et gateways.

### Identifier un Bounded Context

**Signes qu'un nouveau BC est nécessaire :**
- Un même terme a des significations différentes selon le contexte
- Une équipe différente pourrait gérer cette partie
- Le modèle devient trop complexe
- Les règles métier divergent

---

## Communication entre Bounded Contexts

Les BC communiquent **via injection de dépendances NestJS** et exports de module.

### Règles de communication

| ✅ Autorisé | ❌ Interdit |
|-------------|-------------|
| Importer un module NestJS exporté | Importer directement un fichier interne d'un autre BC |
| Passer des données (DTO, primitifs) | Partager des entités mutables |
| Injecter un use case exporté | Accéder au gateway interne d'un autre BC |

---

## Ubiquitous Language

> "Use the model as the backbone of a language." — Eric Evans

Le vocabulaire métier doit être :
- **Cohérent** : même terme = même concept dans un contexte donné
- **Explicite** : pas d'ambiguïté
- **Partagé** : compris par devs ET métier

---

## Workflow : Créer un nouveau Bounded Context

### Étape 1 : Identifier le domaine

```
🎯 DDD - Identification

Nouveau domaine identifié : [nom]

Questions à valider :
1. Quel problème métier résout-il ?
2. Quels sont les termes spécifiques ?
3. Quelles entités principales ?
4. Quels BC existants vont l'utiliser ?
```

### Étape 2 : Définir le langage (glossaire)

### Étape 3 : Définir l'API publique (exports NestJS module)

### Étape 4 : Créer la structure

Après validation → **Basculer sur le skill Architecture** pour les détails tactiques.

---

## Anti-patterns à éviter

- ❌ Un seul gros module "domain" fourre-tout
- ❌ Mélanger les vocabulaires de plusieurs contextes
- ❌ Dépendances circulaires entre contextes
- ❌ Importer les fichiers internes d'un autre BC
- ❌ Nommer les modules par aspect technique ("services", "models")
