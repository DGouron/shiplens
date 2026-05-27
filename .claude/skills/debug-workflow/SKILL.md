---
name: debug-workflow
description: "Pipeline complet de bug-fix gated, end-to-end : intake → investigation (anneaux + Chrome MCP) → red gate TDD → fix → proof-of-fix (screenshots avant/après) → plan de test QA. Délègue à debug-investigator (root cause + repro live) et qa-tester (test plan + manual checklist). Output dans documents/debug/<slug>/."
triggers:
  - "debug-workflow"
  - "debug.*workflow"
  - "fix.*end.*to.*end"
  - "pipeline.*debug"
  - "bug.*pipeline"
  - "fix.*avec.*preuve"
  - "fix.*with.*proof"
---

# Debug Workflow — Orchestrateur Bug-Fix End-to-End

## Positionnement vs autres skills

| Skill | Périmètre | Output |
|---|---|---|
| `/debug-workflow` | **Pipeline complet** : intake → investigation → fix → preuve → plan de test | Bug fixé + proof + test plan QA |
| `/tdd` | RED-GREEN-REFACTOR sur un comportement | Code testé |
| `/refactor` | Restructurer du code sans changer le comportement (Mikado / Strangler Fig) | Code refactoré |
| `/security` | Scan vulnérabilités / OWASP top 10 | Rapport sécurité |

**Quand utiliser `/debug-workflow`** :
- Bug confirmé, on veut **aller jusqu'au bout** : repro, fix, preuve, plan de test.
- L'utilisateur veut une **preuve visuelle** (screenshots avant/après Chrome MCP, payloads supertest avant/après).
- L'utilisateur veut un **plan de test passable à un humain** (manual QA checklist).

**Quand NE PAS utiliser** :
- Bug trivial évident (typo, import) → fix direct.
- Refactoring sans bug → utiliser `/refactor`.
- Plusieurs bugs en parallèle → faire 1 invocation par bug, branches séparées.

## Règle d'or

**No fix without confirmed reproduction. No proof without before/after evidence. No merge without QA test plan.**

Le workflow est **gated** : chaque phase produit un livrable obligatoire. Pas de raccourci.

## Rôle

Tu es l'orchestrateur. Tu **ne codes pas le fix toi-même** (sauf si trivial < 5 lignes ET investigateur a livré un fichier:ligne précis). Tu coordonnes :

| Agent | Rôle | Skills preloaded |
|---|---|---|
| `debug-investigator` | Anneaux 0-4 + reproduction Chrome MCP + root cause ranking | `architecture`, `anti-overengineering` |
| `qa-tester` | Test plan automated + manual checklist + edge cases | `tdd`, `react-best-practices` |

Pour le fix lui-même : déléguer à `feature-implementer` (TDD strict) si > 5 lignes ou cross-layer, sinon faire le fix toi-même.

## Pipeline (7 phases)

### Phase 0 — INTAKE (interactif, < 5 min)

Convertir une description vague en bug exploitable.

Questions obligatoires (skip celles déjà répondues) :

1. **Symptôme observable** : qu'est-ce que tu vois vs ce que tu attends ? Vague = blocker.
2. **Étapes de repro** : URL, clics, données saisies, viewport (mobile/desktop), rôle utilisateur ?
3. **Scope utilisateur** : tous, rôle spécifique, donnée spécifique ?
4. **Régression** : depuis quand ? Lié à un commit/déploiement ?
5. **Environnement** : local, staging, prod ? Reproductible localement ?
6. **Logs/erreurs vues** : console browser (si UI), terminal NestJS (`pnpm start:dev` output), logs serveur ?

**Classification** (détermine le type de test à la Phase 2) :
- UI / interaction / layout / navigation / responsive → **Playwright e2e**
- Logique métier / calcul / validation / transformation / data → **Vitest unit/integration**
- API route / contrat HTTP → **Vitest integration** (route handler) + Playwright si UX impactée

**Génère un slug** : `kebab-case-3-5-mots` (ex: `admin-members-list-mobile-error`, `member-search-debounce-focus-loss`).

**Scaffold** : `bash scripts/debug-workflow.sh init <slug>` crée `documents/debug/<slug>/00-intake.md` à remplir.

**Confirme le scope** avec l'utilisateur. **Pause obligatoire** avant Phase 1.

### Phase 1 — INVESTIGATE (déléguer à `debug-investigator`)

Délègue à l'agent `debug-investigator` :
- Passe le contenu de `00-intake.md` + paths suspects probables (peux les lister depuis ton contexte)
- L'agent suit `.claude/skills/debug-workflow/rules/investigation-rings.md` (Anneaux 0-4 stack solife)
- L'agent suit `.claude/skills/debug-workflow/rules/reproduction-protocol.md` (Chrome MCP)
- L'agent **écrit** : `documents/debug/<slug>/01-investigation.md`

L'agent retourne un statut :
- `ROOT_CAUSE_FOUND` (fichier:ligne précis + mécanisme expliqué) → Phase 2
- `NEEDS_MORE_INFO` (questions précises pour l'utilisateur) → boucle Phase 0
- `UNREPRODUCIBLE` (bug prod-only ou flaky) → escalade utilisateur, ne pas forcer la suite

**Présente le verdict à l'utilisateur** (file:line + mécanisme + 1-2 phrases d'explication). **Pause** avant Phase 1.5.

### Phase 1.5 — BLAST RADIUS ANALYSIS

**Avant tout fix, mesurer ce que le fix risque de casser.** L'agent `debug-investigator` produit cette analyse en seconde partie de son rapport (`01-investigation.md` section "Blast radius analysis") en suivant `.claude/skills/debug-workflow/rules/blast-radius-analysis.md`.

Méthodologie (résumé — détails dans la rule) :
1. Lister les **symboles à modifier** (file:symbol)
2. Cartographier les **dépendants** : Direct (HIGH par défaut), Indirect (MEDIUM), Sibling patterns (LOW à MEDIUM)
3. Vérifier les **contrats publics** impactés (types exportés, props, signatures hooks, payloads API, schema Prisma)
4. **Aggregate risk** : LOW | MEDIUM | HIGH
5. **Stratégie par zone** : backwards-compatible | coordinated update | deprecation+migration | test-only | manual smoke

**Présente le rapport blast radius à l'utilisateur** :

```
🎯 Blast radius : LOW | MEDIUM | HIGH

Direct dependents : N (dont X HIGH risk)
Indirect dependents : N
Sibling patterns : N
Public contracts changed : N

Stratégie recommandée : <backwards-compatible | coordinated | deprecation>
Tests à ajouter en Phase 2 : <liste paths>
Manual QA à ajouter Phase 5 : <liste paths>
Sibling patterns à follow-up : <liste>
```

**Pause obligatoire** avant Phase 2 :
- Si **HIGH** (≥ 3 paths HIGH OU ≥ 1 contrat public modifié) → décision utilisateur : continuer en coordinated update OU pivot vers `/refactor` (Mikado / Strangler Fig)
- Si **MEDIUM/LOW** → confirmer la stratégie et continuer

**Le blast radius dimensionne le scope du fix, des tests, et du test plan QA en aval.**

### Phase 2 — RED GATE (TDD bug-fix)

**Conditions de passage** (toutes obligatoires) :
1. `01-investigation.md` retourne `ROOT_CAUSE_FOUND`
2. fichier:ligne suspect précis (pas "quelque part dans tel module")
3. Mécanisme causal explicable en 2-3 phrases sans handwaving

Actions :
1. Écrire un **test failing** couvrant **au minimum** : le path principal + 1 path Direct dependent du blast radius (Phase 1.5)
   - Vitest : `backend/tests/modules/<bc>/<feature>.bug-<slug>.test.ts`
   - Playwright : `tests/e2e/<slug>.spec.ts`
2. **Lancer le test** (`pnpm test <path>` ou `pnpm playwright test <path>`)
3. **Vérifier qu'il fail pour la bonne raison** : message d'erreur observé doit matcher le symptôme de l'INTAKE. Pas un import cassé, pas un setup manquant, pas une assertion fantaisiste.
4. **Commit local** (jamais sur master) : `test(bug-<slug>): failing test for <symptom>`

Si fail pour autre raison → faux RED → retour Phase 1 (le diagnostic est mauvais).

### Phase 3 — FIX

**Le fix doit respecter la stratégie blast radius** définie en Phase 1.5 :
- **Backwards-compatible** → toucher uniquement le path principal, pas les dépendants
- **Coordinated update** → toucher path principal + tous les paths HIGH/MEDIUM dans le même commit
- **Deprecation+migration** → introduire la nouvelle API, marquer l'ancienne deprecated, ne pas migrer maintenant

Trois cas selon la taille :

**(a) Fix trivial (< 5 lignes, fichier unique, blast radius LOW)** :
- Modifier toi-même
- Re-lancer le test → doit être GREEN
- `pnpm verify` doit passer

**(b) Fix > 5 lignes OU cross-layer OU blast radius MEDIUM** :
- Déléguer à `feature-implementer` agent (TDD strict)
- Le test failing committé sert d'acceptance test
- L'agent fait RED → GREEN → REFACTOR
- Passer le blast radius report à l'agent pour qu'il respecte les paths à toucher / ne pas toucher

**(c) Blast radius HIGH ou refactoring préparatoire requis** :
- Pivot vers `/refactor` (Mikado / Strangler Fig) AVANT le fix
- Pas de big bang — split en commits indépendants

Output : `documents/debug/<slug>/02-fix.md` avec :
- Liste des fichiers touchés
- Diff résumé
- **Vérification blast radius** : tous les paths HIGH listés en Phase 1.5 sont-ils touchés (si coordinated) ou explicitement non-touchés (si backwards-compatible) ?

### Phase 4 — PROOF OF FIX

Critères obligatoires (`.claude/skills/debug-workflow/rules/proof-of-fix.md`) :

1. **Tests automated GREEN** : test failing de Phase 2 + suite complète touchée par le fix.
2. **`pnpm verify` GREEN** : lint + types + tests stagés.
3. **Reproduction live re-jouée via Chrome MCP** (si bug UI/interaction) :
   - Replay des étapes de repro de l'INTAKE
   - Screenshot **après** matchant le comportement attendu
   - Console **clean** (pas d'erreur résiduelle)
   - Network requests **clean** (pas de 4xx/5xx inattendus)
4. **Comparaison avant/après** : screenshots stockés dans `documents/debug/<slug>/proof/` (`before-*.png`, `after-*.png`).

Output : `documents/debug/<slug>/03-proof.md` (résumé + paths screenshots).

Si une condition échoue → retour Phase 3 (le fix est incomplet ou casse autre chose).

### Phase 5 — QA TEST PLAN (déléguer à `qa-tester`)

Délègue à l'agent `qa-tester` :
- Passe le contenu de `00-intake.md`, `01-investigation.md`, `02-fix.md`, `03-proof.md`
- L'agent suit `.claude/skills/debug-workflow/rules/test-plan-template.md`
- L'agent **écrit** : `documents/debug/<slug>/04-test-plan.md`

Le plan contient :
- **Tests automated** : liste des tests existants + nouveaux qui couvrent le bug + edge cases (3-5 minimum)
- **Manual QA checklist** : steps précis (URL, clics, viewports, rôles, browsers) — passable à un humain non-dev
- **Régressions à vérifier** : zones connexes du code touché (callers/callees, autres usages du composant/hook)
- **Edge cases du domaine** : cas tordus issus du bounded context (ubiquitous language)

### Phase 6 — RAPPORT FINAL

Présente à l'utilisateur :

```
🐛 Bug fixé : <slug>

INTAKE → documents/debug/<slug>/00-intake.md
INVESTIGATION → documents/debug/<slug>/01-investigation.md
FIX → documents/debug/<slug>/02-fix.md
PROOF → documents/debug/<slug>/03-proof.md
TEST PLAN → documents/debug/<slug>/04-test-plan.md
RAPPORT → documents/debug/<slug>/report.md

ROOT CAUSE :
  <file>:<line> — <mécanisme en 1 phrase>

FICHIERS MODIFIÉS : <n>
TESTS AJOUTÉS : <n> (Vitest: <n>, Playwright: <n>)
pnpm verify : ✅
Chrome MCP repro : ✅ (avant/après dans proof/)

PROCHAINES ÉTAPES :
  - [ ] Passer la manual QA checklist (04-test-plan.md)
  - [ ] /ship pour commit + push + PR
```

## Règles

- **TOUJOURS** présenter le verdict d'investigation avant le fix (jamais skip Phase 1)
- **JAMAIS** coder un fix sans test failing committé (Phase 2 obligatoire)
- **JAMAIS** déclarer le bug fixé sans Proof of Fix (Phase 4 obligatoire)
- **JAMAIS** commit sur master, toujours sur branche locale
- Si la spec d'un BC touché existe (`documents/specs/<bc>/`), la lire pour vérifier que le fix ne viole pas les Scenarios DSL
- Les screenshots Chrome MCP sont stockés en local dans `documents/debug/<slug>/proof/` (gitignored possible si trop lourds, mais le `03-proof.md` doit décrire ce qu'ils montrent)

## Anti-patterns (le skill refuse de)

- Coder un fix avant `01-investigation.md` produit un `ROOT_CAUSE_FOUND` avec fichier:ligne précis
- Skip la Phase 4 (Proof) parce que "les tests passent" — un test peut passer alors que le bug n'est pas vraiment fixé en runtime
- Skip la Phase 5 (Test Plan) parce que "c'est bon, c'est fixé" — le plan QA est ce qui protège contre les régressions
- Mélanger 2+ bugs dans un seul `<slug>` (un bug = un slug = un commit = une PR)
- Utiliser Chrome MCP en dehors du protocole défini dans `reproduction-protocol.md` (déclencher des dialogs, naviguer hors de l'app, etc.)

## Gestion des erreurs

| Situation | Action |
|---|---|
| Phase 1 → `NEEDS_MORE_INFO` | Demander à l'utilisateur les infos précises listées par l'agent |
| Phase 1 → `UNREPRODUCIBLE` (prod-only) | Escalade : capturer les diffs env, demander accès aux logs prod, ne pas forcer le fix |
| Phase 2 → test fail pour mauvaise raison | Faux RED, retour Phase 1 |
| Phase 3 → fix casse d'autres tests | Pas de raccourci `--no-verify` ; régression réelle, à fixer dans le scope |
| Phase 4 → Chrome MCP indisponible | Documenter manuellement la repro avec capture d'écran utilisateur |
| Phase 5 → bug touche un BC sans spec | Suggérer `/product-manager` pour formaliser après le fix (Boy Scout Rule) |

## Liens

- Rules : `rules/investigation-rings.md`, `rules/blast-radius-analysis.md`, `rules/reproduction-protocol.md`, `rules/proof-of-fix.md`, `rules/test-plan-template.md`
- Agents : `.claude/agents/debug-investigator.md`, `.claude/agents/qa-tester.md`
- Script scaffolding : `scripts/debug-workflow.sh`
- Layout artifacts : `documents/debug/README.md`
