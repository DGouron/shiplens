# Investigation Rings — Shiplens (NestJS 11 + Prisma + SQLite + Vitest)

Investiguer en anneaux concentriques. **Arrêter d'élargir dès que la cause racine est expliquée** par fichier:ligne précis et mécanisme en 2-3 phrases.

## Anneau 0 — Localisation du symptôme

Le controller / service / use case / presenter / entity / gateway où le bug se manifeste.

Checks (par layer Clean Architecture) :

**Si controller (`backend/src/modules/<bc>/interface-adapters/controllers/`) :**
- DTO d'entrée mal validé (class-validator manquant ou trop permissif)
- Mauvaise transformation request → use case input
- Guard / interceptor / pipe mal configuré (ordre d'exécution NestJS)
- Erreur de routing : `@Controller('foo')` + `@Get('bar')` → URL `/foo/bar`

**Si use case (`backend/src/modules/<bc>/usecases/`) :**
- Orchestration incorrecte (await manquant, ordre des appels gateway)
- Erreur d'invariant (vérification qui devrait être dans l'entité)
- Gateway appelée avec mauvais paramètres

**Si entity (`backend/src/modules/<bc>/entities/`) :**
- `static create()` accepte un état invalide
- Méthode qui mute au lieu d'être pure
- Invariant business pas vérifié
- Value Object mal construit

**Si presenter (`backend/src/modules/<bc>/interface-adapters/presenters/`) :**
- Transformation entité → DTO de sortie qui throw sur null/undefined
- Format/labels qui assument une valeur jamais validée
- Logique métier qui devrait être dans l'entité

**Si gateway impl (`backend/src/modules/<bc>/interface-adapters/gateways/`) :**
- Mapping Prisma model → domain entity manquant un champ
- Mauvaise condition `where` / `include` / `select`
- Catch silencieux qui swallow l'erreur

## Anneau 1 — Dépendances directes

Les **callers** (qui appelle le code suspect) et **callees** (ce que le code suspect appelle).

Checks :
- **Contrat de gateway** : interface (port) déclarée dans `entities/<entity>/<entity>.gateway.ts` vs implémentation dans `interface-adapters/gateways/`
- **Abstract class injection** : NestJS DI exige `{ provide: AbstractGateway, useClass: ConcreteGateway }` — si oublié, le DI fail au runtime
- **DTO consistency** : DTO controller → input use case → entity props : un mismatch silencieux est une cause fréquente
- **Module imports** : `@Module({ imports: [...] })` — si le module qui exporte la gateway n'est pas importé là où elle est consommée, DI fail

## Anneau 2 — Data, Persistence, Cache

**Prisma queries :**
- Mauvaise condition `where` / `include` / `select`
- Mapping Prisma model → domain entity manquant un champ
- N+1 queries (`findMany` puis loop avec `findUnique`)
- Transaction (`prisma.$transaction([...])`) qui devrait être atomique mais ne l'est pas
- Unique constraint violations runtime
- Migration drift : `backend/prisma/schema.prisma` diverge de l'état réel de la DB
  - Diagnostic : `npx prisma db pull --print` (juste comparer, **ne pas écrire**)
  - Vérifier les migrations dans `backend/prisma/migrations/`

**SQLite spécifique :**
- Type coercion : SQLite stocke tout comme TEXT/INTEGER/REAL — un `Int` qui revient en string n'est pas exotique
- Concurrent writes : SQLite serialise les writes, possible bottleneck en multi-tenant
- Foreign keys : `PRAGMA foreign_keys=ON` est-il actif ?

**Cache (si présent) :**
- TTL non purgé après mutation
- Clé de cache qui ne contient pas un discriminator important (tenant, user)

## Anneau 3 — Infrastructure NestJS

À explorer si Anneaux 0-2 n'expliquent pas.

**Module wiring & DI :**
- Module manquant un `provider` ou un `export`
- Circular dependency injection (`forwardRef` requis)
- Abstract class non fournie comme DI token (`{ provide: AbstractX, useClass: ConcreteX }`)
- Gateway / service injecté via la mauvaise interface (versionnement de port)
- `@Inject()` manquant pour un token non-class (string token)
- Module global vs scope par module

**Lifecycle hooks :**
- `onModuleInit`, `onApplicationBootstrap` qui ne se déclenche pas (timing)
- Service avec `@Injectable({ scope: Scope.REQUEST })` qui crée un new instance par request — coût + état non partagé

**Pipeline de la requête :**
- Ordre : middleware → guard → interceptor → pipe → handler → interceptor (post) → exception filter
- Guard qui retourne false silencieusement
- Pipe de validation (class-validator) qui ne valide pas les nested objects
- Exception filter qui catch tout et masque l'erreur réelle

**Diagnostics :**
- `DEBUG=* pnpm start:dev` : verbose NestJS logs
- `pnpm start:dev --debug` : node inspector

## Anneau 4 — Environnement

**Dernier recours.**

- Variables d'environnement (`.env` vs `.env.production`)
- Version Node / pnpm
- Permissions du fichier SQLite (`.db` lock)
- Ports occupés
- Différence local vs CI vs prod (chemin DB, secrets)

## Heuristiques par symptôme

| Symptôme | Anneau primaire | Pistes spécifiques |
|---|---|---|
| 500 Internal Server Error | Anneau 0 ou 1 | Exception filter qui catch trop large, gateway qui throw sans être catched |
| 401/403 inattendu | Anneau 1 ou 3 | Guard d'auth, JWT expiré, scope/role mismatch |
| Réponse vide / shape inattendue | Anneau 1 ou 2 | Presenter null guard, mapping Prisma → entity manquant |
| Données stales / cache pas invalidé | Anneau 2 | TTL, clé cache, mutation qui n'invalide pas |
| `Cannot read properties of undefined` | Anneau 1 | Use case qui passe une dépendance non injectée (DI fail silencieux) |
| N+1 query / latence inattendue | Anneau 2 | Loop avec `findUnique`, missing `include` |
| Migration drift / "table doesn't exist" | Anneau 2 | `npx prisma db pull --print`, vérifier `migrations/` |
| Test passe en local mais fail en CI | Anneau 4 | DB seed, env vars, race conditions, ordre des tests |

## Side-list

Pendant l'investigation, **noter les autres bugs/smells** dans une "side-list" :
- Pas de scope-creep, on les fixe pas dans cette session
- Les remonter dans le rapport final pour follow-up

## Spec check

Si le BC touché a une spec dans `documents/specs/<bc>/`, la lire pour comparer **comportement attendu** vs **comportement observé**. La spec est la source de vérité métier.

## Quand arrêter

L'investigation est terminée quand on peut écrire :

```
ROOT_CAUSE_FOUND
file: backend/src/modules/<bc>/<layer>/<file>.ts:<line>
mechanism: <2-3 phrases factuelles, sans "probablement" / "devrait" / "ressemble à">
evidence:
  - <preuve 1 : grep, code lu, log observé, screenshot>
  - <preuve 2>
```

Si on ne peut pas remplir ce template proprement → on n'a pas fini, on continue (ou on retourne `NEEDS_MORE_INFO`).
