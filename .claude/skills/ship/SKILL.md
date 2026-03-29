---
name: ship
description: Ship - Commit et Push en une commande. Enchaine staging, commit conventionnel et push. Verifie les quality gates avant tout commit.
triggers:
  - "ship"
  - "/ship"
  - "commit.*push"
  - "push"
---

# Ship - Commit & Push

## Activation

Ce skill s'active avec `/ship`. Il enchaine verification, commit et push.

## Arguments optionnels

```
/ship              # Commit + push
/ship no-push      # Commit uniquement, sans push
```

## Workflow

### Etape 0 : Quality Gates (BLOQUANT)

**AVANT tout commit**, executer :

```bash
pnpm test
```

**Si les tests echouent** : afficher les erreurs et **STOP**. Ne pas committer tant que les tests ne passent pas.

---

### Etape 1 : Analyse

```bash
git status --short
git branch --show-current
git log --oneline -5
```

**Gardes** :
- Si branche = `main` : **STOP**, refuser de push directement
- Si rien a committer ni pusher : informer et arreter

### Etape 2 : Staging

- Si des fichiers ne sont pas staged, les lister et les ajouter
- **JAMAIS** de fichiers `.env`, credentials, secrets
- Utiliser `git add <fichiers specifiques>` (pas `git add -A`)

### Etape 3 : Commit

Deduire le message depuis les changements :

```
<type>(<scope>): <description>
```

| Type | Usage |
|------|-------|
| `feat` | Nouvelle fonctionnalite |
| `fix` | Correction de bug |
| `refactor` | Refactoring |
| `test` | Tests uniquement |
| `chore` | Maintenance |

**Regles** :
- Header max **72 caracteres**
- Description en minuscules, sans point final
- **JAMAIS** de mention Claude, Anthropic, Co-Authored-By

### Etape 4 : Push (sauf si `no-push`)

```bash
git push origin <branch>
```

### Etape 5 : Resume

```
SHIP

Branche : <branch>
Commit  : <type>(<scope>): <description>
Push    : origin/<branch>
Tests   : tous verts
```

## Securite

- **JAMAIS** de `--force` push
- **JAMAIS** de push sur `main`
- **JAMAIS** de `--no-verify`
- **JAMAIS** de mention Claude/Anthropic dans les commits
