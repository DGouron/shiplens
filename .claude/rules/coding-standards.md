# Coding Standards — Shiplens

## Naming

- Always use **full words** — no abbreviations, acronyms, or single letters
  - ✅ `quest`, `existing`, `index`, `CentralIntelligenceAgency`
  - ❌ `q`, `ex`, `i`, `idx`, `CIA`
- Names must scream intent — no code comments unless vital for comprehension
- File naming: `<entity>.ts`, `<action>-<entity>.usecase.ts`, `<feature>.presenter.ts`, `<entity>.in-<source>.gateway.ts`

## Imports

- **No barrel exports** — no `index.ts` re-export files, direct imports only
  - ✅ `import { createGuard } from '@shared/foundation/guard/guard.js'`
  - ❌ `import { createGuard } from '@shared/foundation'`
- **Inline type imports** — always `import { type X }`, never `import type X`
  - ✅ `import { type ArgumentsHost, Catch } from '@nestjs/common'`
  - ❌ `import type { ArgumentsHost } from '@nestjs/common'`

## TypeScript

- **Never** use type assertions (`as Type`, `as unknown as T`)
- **Never** use non-null assertions (`!`)
- **Never** use `any` — use `unknown` + type guards instead
- Prefer utility types over assertions: `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`
- Use Zod schemas for runtime validation at boundaries (guards)
- Derive types from Zod schemas: `type X = z.infer<typeof xSchema>`
- Use discriminated unions for state modeling
- Use type narrowing (`typeof`, `instanceof`, `in`, discriminant checks) over casts
- **Never** use `var` — use `const` by default, `let` only when reassignment is needed (applies to inline JS/HTML too)

## NestJS

- Use cases are `@Injectable` classes with `execute()` method
- Gateway ports are **abstract classes** (serve as DI tokens AND contracts)
- Controllers delegate to use cases — zero business logic
- Presenters transform domain → DTO — all formatting logic here
- Module wiring: `{ provide: AbstractGateway, useClass: ConcreteGateway }`

## Error Handling

- **3-tier error hierarchy** — never create error classes outside this:
  - `BusinessRuleViolation` — domain invariant violations → HTTP 422
  - `ApplicationRuleViolation` — precondition/config errors → HTTP 422
  - `GatewayError` — I/O failures (DB, API, filesystem) → HTTP 500
- Error classes in `entities/<entity>/<entity>.errors.ts` — never outside
- Controllers never catch errors — global filters handle them
- **Zero `console.log`** — use NestJS `Logger` exclusively (enforced by Biome `noConsole`)

## Testing

- **Framework**: Vitest — run with `pnpm test`
- **School**: Detroit (Inside-Out, state-based) — test observable results, not interactions
- **Location**: mirror structure in `/tests/`
  - `src/modules/auth/entities/user/user.ts` → `tests/modules/auth/entities/user/user.spec.ts`
- **Builders only**: never `new Entity()` in tests — use builders from `tests/builders/`
  - Pattern: `new UserBuilder().withEmail("x@y.com").build()`
  - Builders extend `EntityBuilder<Props, Entity>` from `shared/foundation/testing/entity-builder.ts`
- **Mocks**: only for I/O boundaries (gateways, APIs, DB) — never for internal logic
- **Good-path stubs**: `stub.<gateway>.gateway.ts` in `testing/good-path/`, concrete class extending the abstract gateway
- **Bad-path stubs**: `failing.<gateway>.gateway.ts` in `testing/bad-path/`, always `throw new GatewayError(...)` — never `throw new Error(...)` (enforced by hook)
  - Exception: domain-specific errors (e.g. `AiProviderUnavailableError`) when the stub intentionally simulates a business error
- **Acceptance tests**: `.acceptance.spec.ts` suffix + `(acceptance)` label in root `describe`
- One behavior per test — start with nominal case, add edge cases incrementally
- Tests written in **English** only

## Architecture

- **Screaming Architecture + Clean Architecture** — modules organized as bounded contexts (`src/modules/<context-name>/`)
- **Dependency Rule**: dependencies point inward only — domain never imports infrastructure
- **Layer responsibilities**:
  - **Entity**: pure business logic, private constructor + `static create()`
  - **Use Case**: one user intention, `@Injectable` with `execute()`, orchestrates entities + gateways
  - **Presenter**: transforms domain data → DTO (all presentation logic here)
  - **Controller**: NestJS `@Controller`, wires Use Case + Presenter
  - **Gateway**: abstract class (port) in `entities/`, Prisma implementation in `interface-adapters/gateways/`
  - **Guard**: Zod-based validation at boundaries (`createGuard()`)
- **Shared layers**:
  - `shared/foundation/`: pure technical abstractions, zero dependency on `main/`
  - `shared/domain/`: cross-BC business concepts (Shared Kernel)
  - `shared/infrastructure/prisma/`: PrismaService + PrismaModule

## Zod Schemas

- Prefer `z.nullable()` over `z.optional()` — absent fields are `null`, not `undefined`
- Derive types with `z.infer<typeof schema>` in the same `.schema.ts` file
- Guards in separate `.guard.ts` files using `createGuard(schema, 'EntityName')`

## Code Idioms

- `for...of` for imperative accumulation with `Map` — functional methods (`.map`, `.filter`, `.reduce`) for pure transforms
- Concrete gateway files use `.in-<source>.` infix: `.in-prisma.`, `.in-http.`, `.in-crypto.`, `.in-filesystem.`
- Commit scope aligns with bounded context name: `feat(analytics)`, `fix(sync)`, `docs(audit)`

## Anti-Overengineering

- **KISS**: simplest solution that works — if code gives a headache, it failed
- **YAGNI**: don't add patterns for imaginary future requirements
- 3 clear lines > 1 clever abstraction
- Don't create Value Objects for simple `{ name: string }` structures
- Don't add Repository when Gateway suffices
- Don't use Factory for simple object creation
- Before adding a pattern: does business complexity actually warrant it?
- Refactor **toward** patterns when pain emerges, not before
- Business logic must exceed boilerplate — if ratio is inverted, simplify
