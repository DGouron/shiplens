# Blast Radius Analysis — Shiplens (NestJS)

**Phase 1.5 du `/debug-workflow`** — entre Investigation (Phase 1) et RED Gate (Phase 2).

> **Règle d'or** : avant de fixer, on **mesure ce que le fix risque de casser**. Pas d'analyse, pas de fix.

## Objectif

Pour la root cause identifiée, déterminer :
1. **Tous les fichiers/symboles** qui dépendent du code à modifier
2. **Tous les contrats publics** (interfaces, DTOs, modules NestJS exportés) impactés
3. **Tous les usages divergents** du même pattern qui pourraient avoir le même bug ou être affectés par le fix
4. Le **niveau de risque** par zone (LOW / MEDIUM / HIGH)
5. La **stratégie de mitigation** par zone

## Pourquoi avant le fix, pas après

Si on découvre après coup que le fix touche 12 endroits du codebase, on a perdu :
- Le test failing peut être trop étroit (ne couvre pas les autres usages)
- Le scope du commit explose silencieusement
- Le test plan QA est sous-dimensionné
- Les régressions arrivent en prod

**Le blast radius dimensionne le scope du fix, des tests, et du test plan.**

## Méthode

### Étape 1 — Identifier les symboles modifiés

Depuis `01-investigation.md`, lister précisément ce qui va changer :
- Fichiers (paths)
- Symboles exportés (functions, classes, types, abstract gateways, services injectables)
- Contrats publics (interfaces, DTOs, schemas class-validator, queries Prisma)

### Étape 2 — Cartographier les dépendants

Pour CHAQUE symbole modifié, exécuter une recherche exhaustive :

```bash
# Imports directs (TypeScript)
grep -rn "from.*<file-path>" backend/ --include="*.ts"
grep -rn "import.*<symbol>" backend/ --include="*.ts"

# Usages du symbole
grep -rn "\b<symbol>\b" backend/ --include="*.ts"

# Pour une abstract class / gateway : qui l'implémente, qui l'injecte
grep -rn "extends.*<Abstract>\|implements.*<Abstract>" backend/
grep -rn "useClass:.*<Concrete>" backend/
grep -rn "@Inject(<Token>)" backend/

# Pour un DTO : qui l'utilise dans @Body, @Query, @Param
grep -rn ": <DtoName>" backend/

# Pour un endpoint API : qui l'appelle (clients HTTP, supertest)
grep -rn "/api/<path>" backend/

# Pour un champ Prisma : qui le sélectionne
grep -rn "<fieldName>" backend/ --include="*.ts" backend/prisma/
```

Capturer tous les paths trouvés. Ne PAS filtrer prématurément.

### Étape 3 — Classifier par zone de blast

Pour chaque path trouvé, le ranger dans une des 3 zones :

| Zone | Définition | Niveau de risque par défaut |
|---|---|---|
| **Direct** | Importe ou appelle directement le symbole modifié | HIGH |
| **Indirect** | Dépend d'un dépendant direct (transitif, 1 niveau) | MEDIUM |
| **Sibling** | Pattern similaire mais pas un appel direct (autre service avec la même null-guard manquante, autre gateway avec la même query brisée, etc.) | LOW à MEDIUM selon la similarité |

### Étape 4 — Évaluer le risque par dépendant

| Critère | Effet sur le risque |
|---|---|
| Le contrat public change de signature (param ajouté, type changé) | +HIGH |
| Le contrat public change de comportement runtime (return value différente) | +HIGH |
| DI token / abstract class modifié → tous les modules qui l'injectent | +HIGH |
| Le fix se contente d'ajouter un cas (null guard, default value) sans casser l'existant | +LOW |
| Le dépendant a déjà des tests | -1 niveau |
| Le dépendant n'a aucun test | +1 niveau |
| Le dépendant est dans un BC critique (auth, paiement, sync, audit) | +1 niveau |
| Migration Prisma requise | +HIGH (data en jeu) |

### Étape 5 — Définir la stratégie par zone

| Stratégie | Quand l'utiliser |
|---|---|
| **Backwards-compatible fix** | Le fix n'élargit pas la signature, ne casse rien |
| **Coordinated update** | Le fix change un contrat — mettre à jour les dépendants dans le même commit |
| **Deprecation + migration** | Trop de dépendants pour un seul commit — voir `/refactor` Strangler Fig |
| **Test-only verification** | Le dépendant est testé mais pas modifié — vérifier que ses tests passent toujours |
| **Manual smoke test** | Pas de test, refacto non viable maintenant — passer en QA manuelle (test plan Phase 5) |

### Étape 6 — Produire le rapport

Écrire dans `documents/debug/<slug>/01-investigation.md`, **section dédiée** ajoutée après "Root cause" (template dans l'agent `debug-investigator.md`).

## Heuristiques par type de modification

### Modification d'un Service / Use Case

- **Direct** : controllers qui invoquent le service via constructor injection
- **Indirect** : middleware/guards/interceptors qui dépendent de la réponse du controller
- **Sibling** : autres services du même module qui partagent le même pattern d'orchestration
- **Risque public** : si signature `execute()` change → tous les controllers cassent ; si DI token change → tout le wiring du module casse

### Modification d'une Gateway implementation

- **Direct** : `{ provide: AbstractX, useClass: ConcreteX }` dans le module
- **Indirect** : use cases qui consomment via interface
- **Sibling** : autres implémentations de la même gateway (in-memory pour tests, prisma pour prod)
- **Risque public** : si l'implémentation change de comportement runtime sans changer l'interface → bugs silencieux dans use cases

### Modification d'une Entity / Value Object

- **Direct** : use cases qui invoquent `Entity.create()` / méthodes
- **Indirect** : presenters qui mappent l'entity → DTO de sortie
- **Sibling** : entities du même BC qui partagent un pattern (ex: tous les guards class-validator sans `@IsNotEmpty()`)
- **Risque public** : si `Entity.create()` rejette désormais des inputs jusqu'ici acceptés → CASSE des données existantes potentiellement

### Modification d'un Controller / DTO

- **Direct** : clients HTTP qui consomment l'endpoint, tests supertest qui l'appellent
- **Indirect** : middleware/guards qui inspectent la requête
- **Sibling** : autres controllers qui partagent un guard ou un interceptor
- **Risque public** : changement de DTO = breaking change pour tous les clients (web, mobile, intégrations) — ⚠️ versionner si nécessaire

### Modification d'un schema Prisma

- **Direct** : gateways qui font des queries sur la table
- **Indirect** : use cases / presenters qui consomment les données
- **Sibling** : autres tables qui ont des FK ou relations vers la table modifiée
- **Risque public** : ⚠️ **MIGRATION DB obligatoire**. `pnpm prisma migrate dev` en local, `pnpm prisma migrate deploy` en prod. NEVER `prisma db push`.

### Modification d'un module NestJS (`@Module({ ... })`)

- **Direct** : modules qui importent ce module
- **Indirect** : services injectés depuis ce module (export changes ?)
- **Sibling** : autres modules du même BC
- **Risque public** : retirer un export = casse tous les imports ailleurs ; ajouter un provider mal scope = pollution du DI

## Anti-patterns

- ❌ "Fix simple, blast radius LOW, on verra" — toujours dérouler la méthode (5 min) avant de se prononcer
- ❌ Skip cette phase parce que "le fix est trivial" — c'est précisément les fix triviaux qui ont des blast radius non triviaux
- ❌ Lister 50 dépendants HIGH risk sans stratégie pour chacun — c'est juste reporter le problème
- ❌ Cocher "public contract unchanged" sans vérifier les types exportés et les DTOs publics
- ❌ Ignorer les sibling patterns — ils sont la principale source de "on fixe ici, on casse ailleurs" 6 mois plus tard
- ❌ Modifier une abstract gateway sans vérifier toutes ses implémentations (notamment les fakes/stubs de tests)

## Quand le blast radius est HIGH

Si l'aggregate risk est HIGH (≥ 3 paths HIGH risk OU ≥ 1 contrat public modifié OU migration Prisma requise) :
1. **Pause obligatoire** avant Phase 2
2. Présenter le rapport blast radius à l'utilisateur
3. Décider ensemble : on continue avec coordinated update, ou on **migre vers `/refactor`** (Mikado / Strangler Fig)
4. Ne JAMAIS forcer un fix HIGH-blast-radius sans validation utilisateur

## Outputs consommés downstream

- **Phase 2 (RED Gate)** : le test failing doit couvrir au moins le path principal + 1 path direct dependent
- **Phase 3 (Fix)** : le diff doit toucher uniquement les paths listés
- **Phase 4 (Proof)** : critère 7 ("régressions zones connexes") = vérifier les paths du blast radius
- **Phase 5 (Test plan)** : section 3 ("Régressions à risque") = un item par path MEDIUM/HIGH ; sibling patterns = follow-up issues
