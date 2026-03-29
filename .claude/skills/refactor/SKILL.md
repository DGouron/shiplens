---
name: refactor
description: >
  Refactoring structure avec patterns Mikado, Strangler Fig et Parallel Change.
  Decompose un refactoring bloque en arbre de prerequis, produit un plan de branches
  independantes, et execute en TDD. Prend en entree des P3 du debug-workflow ou une
  demande directe de restructuration.
triggers:
  - "refactor"
  - "mikado"
  - "strangler"
  - "restructure"
  - "dette.*technique"
  - "tech.*debt"
  - "extraire.*gateway"
  - "extract.*"
  - "migrer.*"
  - "migrate.*"
---

# Refactoring Structuré

## Philosophie

Un refactoring n'est pas un nettoyage cosmétique. C'est une transformation structurelle qui modifie le design sans changer le comportement observable. Chaque étape doit laisser le système dans un état fonctionnel — tests verts, application qui tourne.

> "Make the change easy, then make the easy change." — Kent Beck

> "Refactoring is a disciplined technique for restructuring an existing body of code, altering its internal structure without changing its external behavior." — Martin Fowler

## Activation

Ce skill s'active quand :
- Le `/debug-workflow` produit des P3 (code smell, tech debt)
- L'utilisateur demande une restructuration ("extraire ce gateway", "migrer vers...")
- L'architecture viole la Dependency Rule
- Un module est devenu trop gros ou trop couplé

---

## Étape 1 : DIAGNOSTIC

Avant tout refactoring, répondre à ces questions :

1. **Quel est le problème concret ?** Pas "le code est sale" mais "l'entity Shipment contient de la logique de pricing qui devrait être dans son propre use case"
2. **Quel est le comportement actuel ?** Lister les tests existants qui couvrent le code cible
3. **Quel est le comportement cible ?** Même comportement observable, structure différente
4. **Quels fichiers sont impactés ?** Lister tous les fichiers qui devront changer
5. **Y a-t-il des tests ?** Si non, en écrire AVANT de refactorer (golden master tests)

**Présenter le diagnostic à l'utilisateur et attendre validation.**

---

## Étape 2 : CHOISIR LE PATTERN

### Mikado Method

**Quand** : Le refactoring est bloqué — changer A nécessite de changer B, qui nécessite C. Les dépendances forment un arbre.

**Comment** :
1. Tenter le changement cible
2. Observer ce qui casse
3. Annuler le changement (`git checkout .`)
4. Traiter les prérequis en remontant l'arbre (feuilles d'abord)
5. Chaque prérequis est un commit indépendant, tests verts
6. Quand tous les prérequis sont traités, le changement cible passe naturellement

**Arbre Mikado** :

```
[Changement cible : Extraire PricingUsecase de ShipmentEntity]
├── [Prérequis : Créer PricingGateway abstract class]
│   └── [Prérequis : Définir PricingData interface]
├── [Prérequis : Déplacer calculatePrice() vers PricingUsecase]
│   └── [Prérequis : Tests de calculatePrice() indépendants]
└── [Prérequis : Modifier ShipmentEntity pour déléguer à PricingUsecase]
```

**Règle** : chaque feuille de l'arbre = 1 commit, tests verts, comportement inchangé.

### Strangler Fig

**Quand** : Remplacer progressivement un composant sans casser l'existant. L'ancien et le nouveau coexistent pendant la migration.

**Comment** :
1. Créer le nouveau composant à côté de l'ancien
2. Rediriger un premier consommateur vers le nouveau
3. Vérifier (tests verts)
4. Rediriger les consommateurs suivants un par un
5. Quand l'ancien n'a plus de consommateurs, le supprimer

**Cas typiques en Clean Architecture** :
- Migrer un gateway InMemory vers InPrisma
- Remplacer un use case monolithique par plusieurs use cases ciblés
- Migrer un module legacy vers un nouveau bounded context

**Règle** : l'ancien composant n'est supprimé QUE quand zéro import le référence.

### Parallel Change (Expand-Contract)

**Quand** : Changer l'interface d'un composant utilisé par plusieurs consommateurs. Ne pas tout casser d'un coup.

**Comment** :
1. **Expand** : ajouter la nouvelle interface à côté de l'ancienne (le composant supporte les deux)
2. **Migrate** : migrer les consommateurs un par un vers la nouvelle interface
3. **Contract** : supprimer l'ancienne interface quand plus personne ne l'utilise

**Cas typiques** :
- Changer la signature d'une méthode de gateway
- Modifier le schéma d'une entity (ajouter/renommer un champ)
- Refactorer un DTO de controller

**Règle** : jamais de big-bang migration. Un consommateur à la fois.

### Extract (Clean Architecture specific)

**Quand** : La Dependency Rule est violée ou un composant a trop de responsabilités.

**Patterns fréquents** :
- **Extract Gateway** : logique I/O dans un use case → créer un gateway port + implémentation
- **Extract Use Case** : controller fait de la logique métier → extraire dans un use case
- **Extract Entity** : un entity gère deux concepts → séparer en deux entities
- **Extract Bounded Context** : un module est devenu trop gros → le découper

---

## Étape 3 : PLANIFIER

Produire un plan de refactoring qui respecte :

1. **Chaque étape = tests verts** — jamais d'étape intermédiaire rouge
2. **Chaque étape = un commit** — rollback possible à chaque point
3. **Ordre feuilles-d'abord** (Mikado) — les prérequis avant la cible
4. **Branches indépendantes** si possible (même règles que debug-workflow Phase 3)

Format du plan :

```
REFACTORING PLAN:
  pattern: [Mikado | Strangler Fig | Parallel Change | Extract]
  target: [description du changement cible]
  reason: [pourquoi ce refactoring est nécessaire]

  STEPS:
    1. [description] — [fichiers impactés] — [type: prerequisite | migration | cleanup]
    2. ...

  RISKS:
    - [risque identifié] — [mitigation]

  GOLDEN MASTER TESTS:
    - [tests à écrire AVANT si couverture insuffisante]
```

**Présenter le plan à l'utilisateur et attendre validation.**

---

## Étape 4 : EXÉCUTER

Pour chaque étape du plan, appliquer `/tdd` :

1. Si test existant couvre le comportement → vérifier qu'il est vert
2. Si pas de test → écrire un test de non-régression AVANT la modification (RED → GREEN pour le golden master, puis refactor)
3. Appliquer la modification
4. Vérifier que TOUS les tests passent (`pnpm test`)
5. Committer

**Si une étape casse quelque chose d'inattendu** :
- STOP — ne pas cascader les corrections
- Revenir en arrière (`git checkout .`)
- Ajouter le nouveau prérequis découvert à l'arbre Mikado
- Reprendre depuis les feuilles

---

## Étape 5 : VALIDER

Après toutes les étapes :
1. Full test suite : `pnpm test`
2. Vérifier que le comportement observable n'a PAS changé
3. Vérifier que la structure cible est atteinte
4. Si un test d'acceptance existe pour la feature impactée, le relancer

---

## Anti-patterns

- Refactorer sans tests → on ne sait pas si on a cassé quelque chose
- Big-bang refactoring → tout changer d'un coup, prier que ça marche
- Refactorer ET ajouter une feature en même temps → un commit fait UNE chose
- Refactorer du code qui n'a pas de problème → YAGNI s'applique au refactoring aussi
- Créer une abstraction "au cas où" → refactorer VERS les patterns quand la douleur émerge, pas avant

---

## Intégration avec les autres skills

| Depuis | Vers `/refactor` | Contexte |
|--------|-------------------|----------|
| `/debug-workflow` | P3 items | Le debug identifie de la dette, `/refactor` la traite |
| `/architecture` | Violation Dependency Rule | L'architecture montre un couplage, `/refactor` le corrige |
| `/event-storming` | BC trop gros | L'ES révèle qu'un module devrait être découpé |
| `/implement-feature` | Code qui résiste | L'implémentation révèle qu'un refactoring préalable est nécessaire |
