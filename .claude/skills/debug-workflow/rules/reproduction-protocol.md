# Reproduction Protocol — Shiplens (NestJS)

Shiplens est principalement un backend NestJS. La majorité des bugs sont **API** (endpoint qui retourne mal) ou **logic** (use case / gateway). Une minorité touche l'UI (Playwright). Trois protocoles de repro selon la nature.

## Choix du protocole

| Type de bug | Protocole | Section |
|---|---|---|
| API : status code, payload, headers, perf | **API repro (curl + supertest + vitest)** | A |
| Logic pure : invariant entity, calcul, transformation | **Vitest direct** | B |
| UI / interaction / layout / responsive | **Chrome MCP** | C |

---

## A. API repro (curl + supertest + vitest)

### A.1 Curl direct contre l'API local

Dev server :
```bash
pnpm start:dev
# api on http://localhost:3000 (default)
```

Curl la requête fautive. Capturer status + body + headers :
```bash
curl -i -X GET http://localhost:3000/api/<endpoint> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  | tee documents/debug/<slug>/proof/before-curl.txt
```

### A.2 Test supertest qui isole le bug

Si la repro curl est confirmée, écrire un test supertest dans `backend/tests/acceptance/` qui invoque l'endpoint et asserte le bug. Ce test deviendra le RED test de Phase 2.

### A.3 Capturer les logs serveur

Dans un autre terminal, lancer le serveur en mode verbose :
```bash
DEBUG=* pnpm start:dev > documents/debug/<slug>/proof/before-server.log 2>&1
```

Reproduire la requête, puis grep dans le log les erreurs / warnings / stack traces pertinentes.

### A.4 Inspecter la DB après la requête

Si le bug est lié à la persistance :
```bash
npx prisma studio
# OU SQLite CLI :
sqlite3 backend/prisma/dev.db "SELECT * FROM <table> WHERE id = '<id>';"
```

Capturer l'état avant/après la requête.

---

## B. Vitest direct (logic pure)

Pour les bugs purement logique (entity invariant, calcul, transformation) :
```bash
pnpm vitest run backend/tests/modules/<bc>/<feature>.test.ts
```

Écrire un test minimal qui reproduit le bug avec un builder d'entité, sans I/O.

---

## C. Chrome MCP (bugs UI / interaction)

Si shiplens a un frontend (Playwright e2e configuré), utiliser le protocole Chrome MCP.

### Quand utiliser

**Obligatoire** :
- Bug UI / interaction / layout / responsive
- Bug avec message d'erreur générique côté UI — capturer le payload de la requête fautive
- Bug "ça marche en local pas en X" (capturer la diff)

**Inutile** :
- Bug pure logique métier → utiliser protocole B (Vitest direct)
- Bug API sans UI → utiliser protocole A (curl + supertest)
- Bug build/types → `pnpm verify` suffit
- Bug Prisma query → `npx prisma studio` + test Vitest integration

## Pré-requis

1. **Dev server tourne** : `pnpm start:dev` (port 3000)
2. **Backup créé** si tu vas écrire dans la DB : `pnpm backup:db`
3. **Compte de test** : utiliser un compte admin local de seed, pas un compte prod
4. **Tab dédié** : créer un nouveau tab Chrome MCP, ne pas réutiliser un tab existant

## Étapes — repro AVANT fix

### 1. Setup

```
ToolSearch: select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp
mcp__claude-in-chrome__tabs_context_mcp  → constater l'état actuel
mcp__claude-in-chrome__tabs_create_mcp  → créer un nouveau tab pour l'investigation
```

### 2. Naviguer + capturer baseline

```
mcp__claude-in-chrome__navigate(url: "http://localhost:3000")
mcp__claude-in-chrome__resize_window(width: 375, height: 667)  // si bug mobile, sinon desktop
```

### 3. Reproduire le symptôme

Suivre **exactement** les étapes de l'INTAKE :
- Login (si nécessaire) avec compte de test
- Naviguer vers la page concernée
- Effectuer les actions (clics, saisie clavier)

À CHAQUE étape pertinente, capturer :
- **Screenshot** : `mcp__claude-in-chrome__upload_image` ou `read_page` selon besoin → stocker dans `documents/debug/<slug>/proof/before-<step>.png`
- **Console** : `mcp__claude-in-chrome__read_console_messages(pattern: "error|warn|<keyword>")`
- **Network** : `mcp__claude-in-chrome__read_network_requests(filter: "<endpoint>")` → capturer les status codes, payloads, headers

### 4. Documenter dans `01-investigation.md`

```markdown
## Reproduction (BEFORE fix)

**Steps applied** :
1. Login as admin@solife.test (rôle: admin standard)
2. Navigate to /admin/members
3. Resize to 375x667 (mobile viewport)

**Symptom captured** :
- Screenshot: documents/debug/<slug>/proof/before-error-screen.png
- Error message UI: "Une erreur est survenue"
- Console:
  ```
  [Error] TypeError: Cannot read properties of null (reading 'name')
    at MemberRowMobile (member-row-mobile.tsx:42:18)
  ```
- Network: GET /api/admin/members → 200 OK, payload contient member with `address: null`

**Status** : REPRODUCED (3/3 attempts)
```

## Étapes — repro APRÈS fix (Phase 4 — Proof)

**Re-jouer les MÊMES étapes** que la repro before, dans le même viewport, avec le même compte.

Critères d'acceptation (toutes obligatoires) :
- [ ] Screenshot **after** matche le comportement attendu
- [ ] Console **clean** : 0 erreur, 0 warning lié au bug (les warnings tiers OK)
- [ ] Network **clean** : pas de 4xx/5xx inattendus, payloads conformes
- [ ] Reproduction status : `FIXED` (3 essais consécutifs OK)

Stocker dans `proof/` :
- `before-*.png` (capturés avant le fix)
- `after-*.png` (capturés après le fix)
- Optionnel : GIF de la séquence complète via `gif_creator` si la repro est multi-steps

## Anti-patterns

- ❌ **Déclencher des dialogs JS** (`confirm`, `alert`, `prompt`, beforeunload) → bloque les events Chrome MCP suivants. Si une action UI déclenche un dialog, le contourner via `javascript_tool` (auto-confirm) ou alerter l'utilisateur.
- ❌ **Naviguer hors de l'app** (logout, autre site) sans recréer un tab propre — pollue le contexte
- ❌ **Réutiliser un tab d'une session précédente** — toujours `tabs_create_mcp` au début
- ❌ **Oublier le viewport** — un bug mobile testé en desktop ne se reproduit pas
- ❌ **Capturer un seul screenshot final** sans étapes intermédiaires — on perd la séquence
- ❌ **Cliquer sur des boutons "Delete"** sans avertir l'utilisateur (cf. règles Chrome MCP)

## Cas particuliers

### Bug "certains utilisateurs uniquement"

Tester avec **au moins 2 comptes** :
- Un compte qui reproduit
- Un compte qui ne reproduit pas
- Comparer : rôle, données possédées (membres, donations, etc.), permissions
- La différence pertinente est probablement la cause racine (Anneau 2 — data spécifique ou guard d'authz)

### Bug mobile uniquement

Tester `resize_window` à plusieurs tailles :
- 320x568 (iPhone SE)
- 375x667 (iPhone 8)
- 390x844 (iPhone 14)
- Pour chacun : screenshot + console
- Si le bug n'apparaît qu'en dessous d'un breakpoint → repérer le breakpoint dans le code (Tailwind `sm:`, `md:`, `useIsMobile`, `useMediaQuery`)

### Bug intermittent / flaky

- Re-jouer la repro **5 fois minimum**
- Compter le taux d'apparition (X/5)
- Capturer les diffs entre les essais (timing, network, etc.)
- Si < 3/5 → marquer comme `FLAKY`, ne pas verrouiller un test sur une hypothèse fragile

## Limite : MCP indisponible

Si l'utilisateur n'a pas Chrome MCP configuré ou que le tool fail :
- Fallback : demander à l'utilisateur de capturer manuellement (screenshot, console copy/paste, payload network depuis devtools Network tab)
- Documenter `01-investigation.md` avec ces évidences manuelles
- Ne PAS bloquer le workflow — le MCP est un accélérateur, pas un prérequis dur
