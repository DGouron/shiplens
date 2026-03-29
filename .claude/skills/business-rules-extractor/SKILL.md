---
name: business-rules-extractor
description: "Extrait les regles metier d'un module backend et produit deux tableaux : vue Product (concepts metier) et vue Dev (type + source). Sauvegarde dans docs/business-rules/."
triggers:
  - "business.*rules"
  - "règles.*métier"
  - "extraire.*règles"
  - "business rules"
---

# Business Rules Extractor

Extrait les regles metier d'un module backend et produit deux tableaux : vue Product (concepts metier) et vue Dev (type + source).

## Activation

- `/business-rules-extractor <module>`
- "extraire les regles metier de..."
- "quelles sont les regles de..."
- "business rules du module..."

## Workflow

### Etape 1 : Parser l'input

Extraire du message utilisateur :
- **Module** : nom du module (obligatoire)
- **Focus** : sous-domaine cible (optionnel)

### Etape 2 : Lancer l'agent

Spawner l'agent `business-rules-extractor` avec ce prompt :

```
Module : <module>
Focus : <focus ou "complet">

Extraire toutes les regles metier du module selon ta mission.
```

Utiliser `subagent_type: "business-rules-extractor"` et `model: "sonnet"`.

### Etape 3 : Sauvegarder

Sauvegarder le resultat dans `docs/business-rules/<module>.md`.

### Etape 4 : Restituer

Afficher le resultat de l'agent tel quel — ne pas resumer, ne pas reformater.

## Exemples d'invocation

```
/business-rules-extractor shipping
/business-rules-extractor tracking focus validation
/business-rules-extractor billing
```
