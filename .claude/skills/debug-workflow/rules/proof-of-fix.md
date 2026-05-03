# Proof of Fix — Critères obligatoires

Un fix n'est pas considéré comme livrable tant que **toutes** les preuves ci-dessous ne sont pas réunies. Document de référence pour la Phase 4 du `/debug-workflow`.

## Critère 1 — Test failing → GREEN

Le test failing committé en Phase 2 (RED gate) doit maintenant passer.

```bash
# Vitest
pnpm vitest run backend/tests/modules/<bc>/<feature>.bug-<slug>.test.ts

# Playwright
pnpm playwright test tests/e2e/<slug>.spec.ts
```

Capturer la sortie de la commande dans `03-proof.md`.

## Critère 2 — Suite de tests touchée GREEN

Tous les tests qui touchent les fichiers modifiés doivent passer.

```bash
pnpm vitest related <fichier-modifié-1> <fichier-modifié-2>
```

Si un test casse → c'est une régression introduite par le fix → retour Phase 3.

## Critère 3 — `pnpm verify` GREEN

Lint + types + Biome.

```bash
pnpm verify
```

Aucun warning toléré sur les fichiers modifiés. Si warning préexistant non lié → noter dans la side-list.

## Critère 4 — Reproduction live (si UI/interaction)

Replay des étapes de l'INTAKE via Chrome MCP, **mêmes conditions** que la repro before :
- Même viewport
- Même compte de test
- Mêmes données

Captures obligatoires :
- [ ] Screenshot `after-*.png` matchant le comportement attendu (équivalent du `before-*.png`)
- [ ] `read_console_messages(pattern: "error|warn|<keyword>")` → 0 occurrence lié au bug
- [ ] `read_network_requests(filter: "<endpoint>")` → status codes attendus, payloads conformes
- [ ] Reproduction tentée 3 fois consécutives → 3/3 OK

Si bug logic-only (pas UI) → critère 4 N/A, mais alors les critères 1-3 sont les seules preuves. Documenter explicitement dans `03-proof.md`.

## Critère 5 — Comparaison avant/après

Format obligatoire dans `03-proof.md` :

```markdown
## Comparaison avant/après

| Aspect | Avant fix | Après fix |
|---|---|---|
| UI visible | Screenshot: proof/before-error-screen.png | Screenshot: proof/after-list-loaded.png |
| Console | `TypeError: Cannot read properties of null (reading 'name')` | Clean (0 error, 0 warn) |
| Network | GET /api/admin/members → 200 OK avec member.address=null | GET /api/admin/members → 200 OK, presenter gère address null |
| Test bug | RED (`expected list, got error fallback`) | GREEN |
| `pnpm verify` | (n/a, fix scope) | ✅ pass |
```

## Critère 6 — Périmètre du diff vérifié

Le diff (`git diff`) doit contenir **uniquement** :
- Les fichiers nécessaires au fix
- Les tests ajoutés
- Aucun changement hors scope (cf. `.claude/rules/scope-discipline.md`)

Si du refactoring "au passage" a été fait → soit le retirer, soit le passer en commit séparé. **Pas de mélange.**

## Critère 7 — Pas de régression dans les zones du blast radius

**Source** : section "Blast radius analysis" de `01-investigation.md` (produite par `debug-investigator`).

Pour chaque path listé HIGH ou MEDIUM, l'une des actions suivantes est obligatoire :
- **Test automated** qui couvre le path et passe en GREEN après le fix
- **Smoke manual** documenté dans `03-proof.md` (Chrome MCP ou steps manuels)
- **Justification explicite** d'absence d'impact (le fix backwards-compatible ne touche pas la signature consommée par ce path)

Format dans `03-proof.md` :

```markdown
## Critère 7 — Blast radius zones vérifiées

| Path | Risk | Verification | Status |
|---|---|---|---|
| backend/src/modules/.../foo.ts | HIGH | Test backend/tests/modules/.../foo.test.ts | ✅ GREEN |
| backend/src/modules/.../bar.tsx | MEDIUM | Manual Chrome MCP smoke | ✅ no regression |
| backend/src/modules/.../baz.ts | LOW | Backwards-compatible, no signature change | ✅ N/A |
```

Si un path HIGH/MEDIUM n'a pas été vérifié → le proof est incomplet → retour Phase 3 ou ajouter au test plan QA Phase 5.

## Format `03-proof.md`

```markdown
# Proof of Fix — <slug>

## Critère 1 — Test failing → GREEN
- File: backend/tests/modules/<bc>/<feature>.bug-<slug>.test.ts
- Command: `pnpm vitest run <path>`
- Result: ✅ 1 passed (was failing in Phase 2)

## Critère 2 — Suite de tests touchée
- Command: `pnpm vitest related <files>`
- Result: ✅ N passed, 0 failed

## Critère 3 — pnpm verify
- Result: ✅ pass (lint + types + biome)

## Critère 4 — Reproduction live (Chrome MCP)
- Viewport: 375x667 (mobile)
- Account: admin@solife.test
- Steps: <repro steps>
- Screenshots: proof/before-*.png, proof/after-*.png
- Console: clean
- Network: clean
- Repro attempts: 3/3 PASS

## Critère 5 — Comparaison avant/après
<table comme ci-dessus>

## Critère 6 — Périmètre du diff
- Files changed: <n>
- Out-of-scope changes: 0 ✅

## Critère 7 — Régressions à risque vérifiées
- <zone connexe 1> : ✅ verifié manuellement / par test
- <zone connexe 2> : ✅ couvert par test plan QA (Phase 5)
```

## Quand un critère échoue

| Critère | Action si échec |
|---|---|
| 1 (test fail toujours) | Le fix est incomplet → retour Phase 3 |
| 2 (régression test connexe) | Le fix casse autre chose → retour Phase 3, ne pas masquer le test cassé |
| 3 (`pnpm verify` fail) | Fix non livrable, corriger lint/types AVANT |
| 4 (repro Chrome MCP toujours symptomatique) | Le fix ne traite pas la vraie cause → retour Phase 1 (diagnostic à revoir) |
| 5 (pas de capture before/after) | Refaire la capture, ne pas signer le proof sans |
| 6 (diff hors scope) | Split en commits séparés, garder uniquement le fix |
| 7 (régression détectée en zone connexe) | Élargir le scope ou créer une issue de suivi explicite |

## Anti-patterns

- ❌ "Les tests passent donc c'est bon" — ne suffit pas. La repro live est obligatoire pour les bugs UI.
- ❌ Capturer le screenshot AVANT le fix puis re-utiliser le même pour after — fraude.
- ❌ Lancer `pnpm verify --no-verify` ou skip un hook pour signer le proof — interdit.
- ❌ Ignorer un test connexe qui casse en se disant "il était déjà flaky" — investiguer ou retour Phase 3.
- ❌ Considérer un fix proven si Chrome MCP est down et qu'aucun fallback manuel n'est fourni — exiger soit l'un soit l'autre.
