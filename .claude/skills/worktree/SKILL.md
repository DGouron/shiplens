---
name: worktree
description: Gestion des worktrees Git pour travailler sur plusieurs branches en parallele. Creer, lister, supprimer et synchroniser les worktrees. Isole les features en cours pour eviter les conflits.
triggers:
  - "worktree"
  - "parallel.*branch"
  - "branche.*parallèle"
  - "nouvelle.*session"
  - "git worktree"
---

# Commande /worktree - Gestion des worktrees Git

Gere les worktrees Git pour travailler sur plusieurs branches en parallele dans differentes sessions Claude Code.

## Regles de securite ABSOLUES

- JAMAIS de push direct sur `main`
- JAMAIS de commit direct sur `main`
- Seule action autorisee sur `main` : `git pull origin main`
- TOUJOURS creer une branche de travail

---

## Sous-commandes

### `/worktree` ou `/worktree list`
Liste tous les worktrees existants avec leur branche et statut.

### `/worktree add <nom> [--from <branche>]`
Cree un nouveau worktree.
- Par defaut, base sur `main`
- Chemin : `.worktrees/<nom>`

### `/worktree remove <nom>`
Supprime un worktree (demande confirmation si non propre).

### `/worktree sync [nom]`
Synchronise le worktree avec `main` (pull only).

### `/worktree connect <nom>`
Change le repertoire de travail vers le worktree specifie.

---

## Architecture des worktrees

```
shiplens/                        <- Worktree principal
├── src/
├── tests/
└── .worktrees/
    ├── feature-shipping/        <- Worktree feature
    │   ├── src/
    │   └── tests/
    └── bugfix-tracking/         <- Worktree bugfix
        ├── src/
        └── tests/
```

---

## Workflow dans un worktree

```bash
# 1. Creer le worktree
git worktree add .worktrees/feature-shipping -b feature/shipping main

# 2. Travailler dans le worktree
cd .worktrees/feature-shipping

# 3. Installer les dependances
pnpm install

# 4. Travailler, committer...
git add .
git commit -m "feat(shipping): add shipment entity"

# 5. Push la branche
git push origin feature/shipping

# 6. Une fois merge, nettoyer
cd ../..
git worktree remove .worktrees/feature-shipping
```

---

## Synchronisation

```bash
# Sync un worktree avec main
cd .worktrees/<nom>
git fetch origin
git rebase origin/main
```

---

## Template de sortie

### Liste des worktrees

```
WORKTREES

| Usage | Chemin | Branche |
|-------|--------|---------|
| principal | shiplens/ | main |
| feature | .worktrees/feature-shipping | feature/shipping |
```

### Creation de worktree

```
WORKTREE CREE

Nom     : <nom>
Chemin  : <chemin>
Branche : <branche> (basee sur main)

Installer les dependances :
   cd <chemin> && pnpm install

Lancer une session :
   cd <chemin> && claude
```

---

## Regles

- **JAMAIS** push direct sur `main`
- **JAMAIS** creer un worktree dans le repertoire source
- **TOUJOURS** utiliser `.worktrees/` comme repertoire parent
- **TOUJOURS** utiliser des chemins absolus dans les commandes affichees
- **TOUJOURS** rappeler de lancer `pnpm install` apres creation
- **VERIFIER** que la branche n'est pas deja checkout dans un autre worktree
- **Apres un context reset** : toujours verifier qu'on est dans le bon worktree avant d'editer
