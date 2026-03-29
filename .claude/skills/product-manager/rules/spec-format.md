# Format de Spec

Chaque spec dans `docs/specs/` suit ce format :

```markdown
# [Titre — verbe d'action + objet]

## Contexte

[Pourquoi cette feature existe — le probleme utilisateur, 2-3 phrases max]

## Rules

- [invariant metier 1]
- [invariant metier 2]
- ...

## Scenarios

- [nominal]: {inputs} → outputs
- [edge case 1]: {inputs} → reject "message"
- [edge case 2]: {inputs} → outputs
- ...

## Hors scope

- [ce qu'on ne fait PAS]

## Glossaire

| Terme | Definition |
|-------|------------|
| [mot metier] | [sens precis dans ce contexte] |
```

## Regles

- **Titre** : verbe d'action + objet (ex: "Creer un envoi", "Filtrer les colis")
- **Contexte** : max 3 phrases, centrees sur le probleme utilisateur
- **Rules** : invariants metier en langage naturel, pas de technique
- **Scenarios** : minimum 1 nominal + 1 edge case, format DSL compact (voir `rules/spec-dsl.md`)
- **Hors scope** : obligatoire — cadre ce qu'on ne fait PAS
- **Glossaire** : obligatoire si termes metier specifiques
- **Pas de code** dans la spec — jamais de noms de classes, fichiers, ou patterns techniques
