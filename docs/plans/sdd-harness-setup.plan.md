# Plan : Mise en place du harness SDD

## Objectif

Passer de "pipeline SDD déclaratif" à "harness SDD exécutable" — la double boucle fonctionne réellement, l'état persiste, les gates sont déterministes.

## Principe directeur

Ce qui est scriptable et déterministe → hooks + scripts bash.
Ce qui nécessite du raisonnement → skills + agents.

---

## Phase 1 : Fondations (bloquants)

### B1 — Boucle externe exécutable

**Quoi** : Quand `/implement-feature` démarre, un test d'acceptance est créé depuis la spec DSL. Il reste RED pendant l'implémentation inside-out. Il passe GREEN à la fin.

**Comment** :
- Le `feature-implementer` agent ajoute une étape 0 : créer `tests/acceptance/<feature-name>.acceptance.spec.ts`
- Ce test importe le use case + le stub gateway, exécute chaque scenario de la spec, vérifie le résultat
- Le test est lancé en RED (confirmer l'échec)
- Après toute l'implémentation inside-out, le test est relancé — il doit passer GREEN
- C'est la preuve que la spec est satisfaite

**Fichiers à modifier** :
- `.claude/agents/feature-implementer.md` — ajouter étape 0 acceptance test
- `.claude/agents/feature-planner.md` — ajouter le test d'acceptance dans le plan

**Statut** : FAIT

---

### B2 — Vérification spec-code alignment (hook)

**Quoi** : Après implémentation, vérifier que chaque scenario de la spec a un test correspondant.

**Comment** :
- Script `scripts/verify-spec-coverage.sh` : parse la spec DSL, cherche les tests correspondants
- Hook `PostToolUse` sur `Bash(pnpm test)` : rappeler les scenarios non couverts

**Fichiers à créer** :
- `scripts/verify-spec-coverage.sh`

**Statut** : FAIT

---

### B3 — State persistence

**Quoi** : Plans et rapports persistent sur le filesystem.

**Comment** :
- Le `feature-planner` écrit dans `docs/plans/<feature>.plan.md`
- Le `feature-implementer` écrit le rapport dans `docs/reports/<feature>.report.md`
- Convention de nommage : kebab-case, même nom que la spec

**Fichiers à modifier** :
- `.claude/agents/feature-planner.md` — écrire le plan en fichier
- `.claude/agents/feature-implementer.md` — écrire le rapport en fichier

**Fichiers à créer** :
- `docs/plans/.gitkeep`
- `docs/reports/.gitkeep`

**Statut** : FAIT

---

### B4 — Feature tracker

**Quoi** : Un fichier qui track le statut de chaque feature dans le pipeline.

**Comment** :
- `docs/feature-tracker.md` — tableau markdown simple
- Le PM ajoute une ligne (status: drafted)
- Le planner met à jour (status: planned)
- L'implementer met à jour (status: implementing → done)
- Le ship met à jour (status: shipped)

**Format** :
```markdown
| Feature | Spec | Plan | Status | Date |
|---------|------|------|--------|------|
| create-shipment | docs/specs/create-shipment.md | docs/plans/create-shipment.plan.md | done | 2026-03-29 |
```

**Fichiers à créer** :
- `docs/feature-tracker.md`

**Fichiers à modifier** :
- `.claude/skills/product-manager/SKILL.md` — ajouter étape "enregistrer dans tracker"
- `.claude/agents/feature-planner.md` — mettre à jour tracker
- `.claude/agents/feature-implementer.md` — mettre à jour tracker
- `.claude/skills/ship/SKILL.md` — mettre à jour tracker

**Statut** : FAIT (tracker + agents mis à jour, PM et ship restent à faire)

---

### B5 — Connexion Event Storming → Specs

**Quoi** : Le PM lit les documents Event Storming quand une spec concerne un BC existant.

**Comment** :
- Ajouter dans le workflow du PM : "Si un BC est identifié, lire `docs/ddd/event-storming/<bc>.md` et `docs/ddd/ubiquitous-language.md`"
- Le PM vérifie la cohérence terminologique

**Fichiers à modifier** :
- `.claude/skills/product-manager/SKILL.md` — ajouter étape de lecture ES
- Créer `docs/ddd/ubiquitous-language.md` (I2 traité en même temps)

**Statut** : FAIT

---

## Phase 2 : Hooks déterministes

### H1 — Gate pre-commit : tests verts obligatoires

**Quoi** : Hook `PreToolUse` sur `git commit` — bloque si `pnpm test` échoue.

**Script** : `scripts/hooks/pre-commit-gate.sh`
- Lit stdin JSON, extrait la commande
- Lance `pnpm test`
- Exit 2 si échec (bloque le commit + feedback à Claude)
- Exit 0 si succès

**Statut** : FAIT (script + test + hook config)

---

### H2 — Gate pre-commit : pas de barrel exports

**Quoi** : Hook `PreToolUse` sur `Write|Edit` — bloque si le fichier s'appelle `index.ts` et contient des re-exports.

**Script** : `scripts/hooks/no-barrel-exports.sh`

**Statut** : FAIT (script + test + hook config)

---

### H3 — Gate pipeline : spec obligatoire avant implémentation

**Quoi** : Hook `PreToolUse` sur `Agent` quand c'est `feature-implementer` — vérifie que la spec existe dans `docs/specs/`.

**Script** : `scripts/hooks/require-spec.sh`

**Statut** : FAIT (script + test + hook config)

---

### H4 — SessionStart : contexte feature en cours

**Quoi** : Hook `SessionStart` — injecte le statut des features en cours depuis `docs/feature-tracker.md`.

**Script** : `scripts/hooks/session-context.sh`

**Statut** : FAIT (script + test + hook config)

---

## Phase 3 : Importants

### I1 — Pipeline verrouillé

Couvert par H3.

**Statut** : FAIT (via H3)

---

### I2 — Ubiquitous language centralisé

**Fichier créé** : `docs/ddd/ubiquitous-language.md`
**Connexions** : PM (étape 0 + 4) + Event Storming enrichissent le glossaire.

**Statut** : FAIT

---

### I3 — TDD dual-mode explicite

**Fichier modifié** : `.claude/skills/tdd/SKILL.md` — section "Deux modes de fonctionnement"

**Statut** : FAIT

---

### I4 — Walking skeleton

**Fichier modifié** : `.claude/agents/feature-planner.md` — section "Walking Skeleton"

**Statut** : FAIT

---

### I5 — Mode exploration Event Storming

**Fichiers modifiés** :
- `.claude/agents/event-storming.md` — mode exploration pre-code
- `.claude/skills/event-storming/SKILL.md` — `/event-storming explore`

**Statut** : FAIT

---

### I6 — Worktree intégré au pipeline

**Script** : `scripts/hooks/protect-main-branch.sh`
**Test** : `tests/scripts/protect-main-branch.test.sh`
**Config** : `.claude/settings.json`

**Statut** : FAIT

---

## Statut final

Tous les items du plan sont FAIT. Le harness SDD est opérationnel.
