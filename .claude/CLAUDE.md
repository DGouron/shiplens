# Project Instructions — Shiplens

## Tooling

This project uses pnpm, not npm or yarn.

## Behavior

Important: Every response must start with "J'ai lu les règles." to demonstrate that you have followed our rules.

Always challenge me when relevant and be blunt — no sugarcoating, otherwise it hurts me.

Always evaluate the scope of what is asked and tell me if it's too broad or vague, otherwise I'll be sad.

Being allergic to code comments, only add them if vital for understanding. This means you have already named your function, file, variable, and folder to scream the intent.

## Code Philosophy

- **KISS**: The simplest solution that works. If the code gives a headache, it failed.
- **Readable as prose**: If you have to read a line twice, rewrite it. (Clean Code, Uncle Bob)
- **No over-abstraction**: 3 clear lines > 1 clever abstraction. YAGNI rules.

## Quality Gates

- **Zero TypeScript errors**: `npx tsc --noEmit` must pass with zero errors before any commit. If pre-existing errors are detected, fix them in the same commit or a dedicated one.
- **Zero Biome errors**: `pnpm lint:ci` must pass with zero errors before any commit.

## Technical Standards

See `.claude/rules/coding-standards.md` for detailed rules: naming, imports, TypeScript, testing, architecture, language, anti-overengineering.

## Commits

- **Format**: Conventional Commits (https://www.conventionalcommits.org/)
- **Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`
- **Scope**: Optional, in parentheses (e.g. `feat(auth): add login endpoint`)
- **Never mention Claude**: No `Co-Authored-By: Claude` or AI mentions

## Testing

- **Framework**: Vitest + unplugin-swc
- **Approach**: TDD Detroit School (Inside-Out, state-based)
- **Absolute rule**: Never write production code without a failing test first
- **Proof required**: Always provide proof that the work functions
- **Mocks**: Only for external I/O (gateways, API, DB) — never for internal logic
- **Workflow**: Use the `/tdd` skill for RED-GREEN-REFACTOR guidance
- **Commands**: `pnpm test` (unit), `pnpm test:e2e` (Playwright)

### Test Structure

- **Location**: Mirror structure in `/tests/`
- **Example**: `src/modules/auth/entities/user/user.ts` → `tests/modules/auth/entities/user/user.spec.ts`

### Test Data Builders

- **Location**: `/tests/builders/`
- **Convention**: `<entity>.builder.ts` — class extends `EntityBuilder<Props, Entity>`
- **Base class**: `src/shared/foundation/testing/entity-builder.ts`
- **Usage**: Always use builders in tests, never `new Entity()` directly
- **Pattern**: `new UserBuilder().withEmail("x@y.com").build()`

## Architecture

- **Style**: Screaming Architecture + Clean Architecture (Uncle Bob)
- **DDD**: Strategic level only (Bounded Contexts, Ubiquitous Language)
- **Framework**: NestJS 11
- **Database**: SQLite via Prisma ORM
- **Modules**: Organized as bounded contexts (`src/modules/<context-name>/`)
- **Workflow**: Use the `/architecture` skill to create components

### Principles

- **Clean Architecture definitions take precedence** over tactical DDD
- Dependency Rule: dependencies point inward only
- **Abstract classes as DI tokens**: TS interfaces vanish at runtime → unusable as NestJS tokens

### Dependency Injection

Via NestJS native DI (`@Inject`). Gateway ports are abstract classes (serve as both contract AND injection token).

### Shared Layers

- `shared/foundation/`: Pure cross-BC technical abstractions (guard, usecase, presenter, business-rule-violation, application-rule-violation, gateway-error, entity-builder). **Zero dependencies on `main/`**.
- `shared/domain/`: Cross-BC business concepts — DDD Shared Kernel
- `shared/infrastructure/prisma/`: PrismaService + PrismaModule (@Global)

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

## Database (Prisma + SQLite)

### Migrations — Mandatory Workflow

**FORBIDDEN:**
- `prisma db push` — no migration history
- `prisma db push --force-reset` — deletes all data
- `prisma migrate reset --force`
- Direct destructive SQL operations

**MANDATORY PROCEDURE:**
1. `pnpm db:backup` — always first
2. `pnpm db:migrate --name description` — test locally
3. Review generated SQL in `prisma/migrations/`
4. Test the application locally
5. `git add prisma/migrations/`
6. `git commit -m "feat: ..."`
7. `pnpm db:deploy` — production only

**Golden rule**: No backup, no migration. No exceptions.

## Spec-Driven Development (SDD)

### Feature Pipeline

1. `/product-manager` — Custom DSL spec in `docs/specs/`
2. `/implement-feature` — Orchestrates planner + TDD implementer
3. `/ship` — Commit + push

### Double Loop

- **Outer loop (SDD)**: Spec (Rules + Scenarios) → acceptance tests (stay RED during implementation)
- **Inner loop (TDD)**: RED-GREEN-REFACTOR incrementally, turns the outer loop GREEN

### Artifacts

- `docs/specs/` — DSL Specs (source of truth)
- `docs/ddd/` — Event Storming, Context Maps
- `docs/business-rules/` — Business rules extracted from code

## Available Skills

| Skill | When to use |
|-------|-------------|
| `/product-manager` | Define a feature, write INVEST specs + custom DSL |
| `/implement-feature` | Implement a complete feature (orchestrates planner + implementer) |
| `/tdd` | Write or modify code (RED-GREEN-REFACTOR) |
| `/architecture` | Create module, entity, use case, presenter, gateway... |
| `/ddd` | Slice the domain, define ubiquitous language |
| `/event-storming` | Big Picture Event Storming session on a bounded context |
| `/business-rules-extractor` | Extract business rules from a module |
| `/refactor` | Structured refactoring (Mikado, Strangler Fig, Parallel Change) |
| `/debug-workflow` | Progressive bug investigation + branch plan |
| `/ship` | Commit + push (runs tests first) |
| `/worktree` | Manage Git worktrees for parallel branches |
| `/skill-creator` | Create or modify a skill |
| `/auto-review` | Self-review before PR (5 sequential audits) |
| `/security` | Secret detection scan before commit |
| `/status` | Full project health diagnostic (read-only) |
