# Instructions Projet — Shiplens

## Tooling

Le projet utilise pnpm, non npm ni yarn.

## Comportement

Important : Chaque réponse commencera par "J'ai lu les règles.". Cela démontrera que tu as bien suivis nos règles.

Tu dois toujours me challenger quand c'est pertinant et être cash sans prendre de pincette, sinon ça me blèsse.

Tu dois toujours évaluer le scope de ce qui t'es demander et me dire si c'est trop large ou vague, sinon je serais triste.

Etant allergique aux commentaires technique dans le code, tu n'en mettra uniquement que si c'est vital pour la compréhension du code. Ce qui veux dire, que tu as déjà mis un nom de fonction, de fichier, de variable, de dossier qui crie l'intention.

## Philosophie code

- **KISS** : La solution la plus simple qui marche. Si le code donne mal à la tête, il a échoué.
- **Lisible comme de la prose** : Si tu dois relire une ligne deux fois, réécris-la. (Clean Code, Uncle Bob)
- **Pas de sur-abstraction** : 3 lignes claires > 1 abstraction maline. YAGNI prime.

## Quality Gates

- **Zéro erreur TypeScript** : `npx tsc --noEmit` doit passer sans aucune erreur avant tout commit. Si des erreurs pré-existantes sont détectées, les corriger dans le même commit ou un commit dédié.

## Standards techniques

Voir `.claude/rules/coding-standards.md` pour les règles détaillées : naming, imports, TypeScript, testing, architecture, langue, anti-overengineering.

## Commits

- **Format** : Conventional Commits (https://www.conventionalcommits.org/)
- **Types** : `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`
- **Scope** : Optionnel, entre parenthèses (ex: `feat(auth): add login endpoint`)
- **Ne jamais mentionner Claude** : Pas de `Co-Authored-By: Claude` ni mention de l'IA

## Testing

- **Framework** : Vitest + unplugin-swc
- **Approche** : TDD Detroit School (Inside-Out, state-based)
- **Règle absolue** : Jamais de code prod sans test rouge d'abord
- **Preuve obligatoire** : Toujours fournir la preuve que le travail fonctionne
- **Mocks** : Uniquement pour les I/O externes (gateways, API, DB) — jamais pour la logique interne
- **Workflow** : Utiliser le skill `/tdd` pour le guidage RED-GREEN-REFACTOR
- **Commande** : `pnpm test` (unit), `pnpm test:e2e` (Playwright)

### Structure des tests

- **Emplacement** : Tests en miroir dans `/tests/`
- **Exemple** : `src/modules/auth/entities/user/user.ts` → `tests/modules/auth/entities/user/user.spec.ts`

### Test Data Builders

- **Emplacement** : `/tests/builders/`
- **Convention** : `<entity>.builder.ts` — classe extends `EntityBuilder<Props, Entity>`
- **Base class** : `src/shared/foundation/testing/entity-builder.ts`
- **Usage** : Toujours utiliser les builders dans les tests, jamais `new Entity()` directement
- **Pattern** : `new UserBuilder().withEmail("x@y.com").build()`

## Architecture

- **Style** : Screaming Architecture + Clean Architecture (Uncle Bob)
- **DDD** : Niveau stratégique uniquement (Bounded Contexts, Ubiquitous Language)
- **Framework** : NestJS 11
- **BDD** : SQLite via Prisma ORM
- **Modules** : Organisés en bounded contexts (`src/modules/<context-name>/`)
- **Workflow** : Utiliser le skill `/architecture` pour créer des composants

### Principes

- Les définitions **Clean Architecture priment** sur DDD tactique
- Dependency Rule : dépendances vers l'intérieur uniquement
- **abstract classes comme DI tokens** : Les interfaces TS disparaissent au runtime → inutilisables comme tokens NestJS

### Injection de dépendances

Via NestJS native DI (`@Inject`). Les gateway ports sont des abstract classes (servent de contrat ET de token d'injection).

### Shared Layers

- `shared/foundation/` : Abstractions techniques cross-BC **pures** (guard, usecase, presenter, business-rule-violation, application-rule-violation, gateway-error, entity-builder). **Aucune dépendance vers `main/`**.
- `shared/domain/` : Concepts métier cross-BC — Shared Kernel DDD
- `shared/infrastructure/prisma/` : PrismaService + PrismaModule (@Global)

### Use Case Pattern (NestJS)

```typescript
@Injectable()
export class CreateSomethingUsecase implements Usecase<CreateParams, void> {
  constructor(private readonly somethingGateway: SomethingGateway) {}

  async execute(params: CreateParams): Promise<void> {
    // validation, entity creation, gateway call
  }
}
```

### Gateway Pattern (abstract class = DI token)

```typescript
export abstract class SomethingGateway {
  abstract getAll(): Promise<Something[]>;
  abstract create(something: Something): Promise<void>;
}
```

### Module DI Wiring

```typescript
@Module({
  controllers: [SomethingController],
  providers: [
    CreateSomethingUsecase,
    { provide: SomethingGateway, useClass: SomethingInPrismaGateway },
  ],
})
export class SomethingModule {}
```

## Base de données (Prisma + SQLite)

### Migrations — Workflow obligatoire

**INTERDIT :**
- `prisma db push` — pas d'historique de migration
- `prisma db push --force-reset` — supprime toutes les données
- `prisma migrate reset --force`
- Opérations SQL destructives directes

**PROCÉDURE OBLIGATOIRE :**
1. `pnpm db:backup` — toujours en premier
2. `pnpm db:migrate --name description` — test local
3. Vérifier le SQL généré dans `prisma/migrations/`
4. Tester l'application localement
5. `git add prisma/migrations/`
6. `git commit -m "feat: ..."`
7. `pnpm db:deploy` — production uniquement

**Règle d'or** : Pas de backup, pas de migration. Pas d'exception.

## Spec-Driven Development (SDD)

### Pipeline de feature

1. `/product-manager` — Spec DSL custom dans `docs/specs/`
2. `/implement-feature` — Orchestre planner + implementer TDD
3. `/ship` — Commit + push

### Double boucle

- **Boucle externe (SDD)** : Spec (Rules + Scenarios) -> tests d'acceptance (restent RED pendant l'impl)
- **Boucle interne (TDD)** : RED-GREEN-REFACTOR par incrément, fait passer la boucle externe au vert

### Artefacts

- `docs/specs/` — Specs DSL (source de vérité)
- `docs/ddd/` — Event Storming, Context Maps
- `docs/business-rules/` — Règles métier extraites du code

## Skills disponibles

| Skill | Quand l'utiliser |
|-------|------------------|
| `/product-manager` | Définir une feature, rédiger specs INVEST + DSL custom |
| `/implement-feature` | Implémenter une feature complète (orchestre planner + implementer) |
| `/tdd` | Écrire ou modifier du code (RED-GREEN-REFACTOR) |
| `/architecture` | Créer module, entité, use case, presenter, gateway... |
| `/ddd` | Découper le domaine, définir l'ubiquitous language |
| `/event-storming` | Session Event Storming Big Picture sur un bounded context |
| `/business-rules-extractor` | Extraire les règles métier d'un module |
| `/refactor` | Refactoring structuré (Mikado, Strangler Fig, Parallel Change) |
| `/debug-workflow` | Investigation progressive de bugs + plan de branches |
| `/ship` | Commit + push (vérifie les tests avant) |
| `/worktree` | Gérer les worktrees Git pour branches parallèles |
| `/skill-creator` | Créer ou modifier un skill |
