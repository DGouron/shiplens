---
name: architecture
description: Clean Architecture (Uncle Bob) guide for NestJS. Use to create modules, entities, use cases, presenters, controllers, gateways, guards. Contains tactical patterns and structure conventions.
---

# Clean Architecture - Tactical Guide (NestJS)

## Activation

This skill activates for any creation or modification of architectural components:
- Entities, Use Cases, Presenters
- Controllers, Gateways, Guards
- DTOs, Services
- Module structure

## Core Principle

> "The architecture should scream the intent of the system." — Uncle Bob

```
┌─────────────────────────────────────┐
│       Interface Adapters            │  ← Controllers, Presenters, Gateways (Prisma)
├─────────────────────────────────────┤
│           Use Cases                 │  ← Application Business Rules (@Injectable)
├─────────────────────────────────────┤
│            Entities                 │  ← Enterprise Business Rules (pure TS)
└─────────────────────────────────────┘
```

**Dependency Rule**: Dependencies point inward. The domain knows nothing about infrastructure.

---

## Module Structure

```
backend/src/modules/<bounded-context>/
├── <context>.module.ts            # NestJS module (DI wiring)
├── entities/
│   └── <entity>/
│       ├── <entity>.ts            # Pure entity (private constructor, static create)
│       ├── <entity>.schema.ts     # Zod schema
│       ├── <entity>.guard.ts      # Boundary validation
│       ├── <entity>.gateway.ts    # Port = abstract class (DI token)
│       └── <entity>.errors.ts     # BusinessRuleViolation
├── usecases/
│   └── <action>-<entity>.usecase.ts  # @Injectable + execute()
├── interface-adapters/
│   ├── controllers/
│   │   └── <feature>.controller.ts   # NestJS @Controller
│   ├── presenters/
│   │   └── <feature>.presenter.ts    # Domain → DTO
│   └── gateways/
│       └── <entity>.in-prisma.gateway.ts  # Prisma implementation
└── testing/
    ├── good-path/
    │   └── stub.<entity>.gateway.ts
    └── bad-path/
        └── failing.<entity>.gateway.ts
```

---

## Components

### Entity

Pure business logic, independent of any framework.

```typescript
export class Something {
  private constructor(private readonly props: SomethingProps) {}

  static create(props: SomethingProps): Something {
    return new Something(props)
  }

  get title(): string {
    return this.props.title
  }
}
```

### Use Case

Orchestration of a business action. One use case = one user intention. `@Injectable` with `execute()`.

```typescript
@Injectable()
export class CreateSomethingUsecase implements Usecase<CreateParams, void> {
  constructor(private readonly somethingGateway: SomethingGateway) {}

  async execute(params: CreateParams): Promise<void> {
    const something = Something.create({ ...params, id: crypto.randomUUID() })
    await this.somethingGateway.create(something)
  }
}
```

### Presenter

Transforms business data into DTOs for API responses. Contains ALL presentation logic.

```typescript
export class SomethingPresenter implements Presenter<Something[], SomethingListDto> {
  present(items: Something[]): SomethingListDto {
    return {
      items: items.map(item => ({
        id: item.id,
        title: item.title,
      })),
      count: items.length,
    }
  }
}
```

### Controller (NestJS)

Receives HTTP requests, calls the Use Case, returns via Presenter.

```typescript
@Controller('somethings')
export class SomethingController {
  constructor(
    private readonly createSomething: CreateSomethingUsecase,
    private readonly getSomethings: GetSomethingsUsecase,
    private readonly presenter: SomethingPresenter,
  ) {}

  @Post()
  async create(@Body() body: CreateSomethingDto): Promise<void> {
    await this.createSomething.execute(body)
  }

  @Get()
  async findAll(): Promise<SomethingListDto> {
    const items = await this.getSomethings.execute()
    return this.presenter.present(items)
  }
}
```

### Gateway

Port (abstract class) in entities, implementation (Prisma) in interface-adapters.

```typescript
// entities/something/something.gateway.ts (PORT = DI TOKEN)
export abstract class SomethingGateway {
  abstract getAll(): Promise<Something[]>
  abstract create(something: Something): Promise<void>
}

// interface-adapters/gateways/something.in-prisma.gateway.ts (IMPL)
@Injectable()
export class SomethingInPrismaGateway extends SomethingGateway {
  constructor(private readonly prisma: PrismaService) { super() }

  async getAll(): Promise<Something[]> {
    const records = await this.prisma.something.findMany()
    return records.map(record => Something.create(record))
  }

  async create(something: Something): Promise<void> {
    await this.prisma.something.create({ data: { ... } })
  }
}
```

### Guard

Boundary validation with Zod + createGuard.

```typescript
export const somethingGuard = createGuard<SomethingProps>(SomethingPropsSchema, 'Something')
```

### Module (DI Wiring)

```typescript
@Module({
  controllers: [SomethingController],
  providers: [
    CreateSomethingUsecase,
    GetSomethingsUsecase,
    SomethingPresenter,
    { provide: SomethingGateway, useClass: SomethingInPrismaGateway },
  ],
})
export class SomethingModule {}
```

---

## Error Layers

| Layer | Base Class | Example |
|-------|-----------|---------|
| Entity (domain) | `BusinessRuleViolation` | `TitleRequiredError` |
| Use Case (application) | `ApplicationRuleViolation` | `GatewayNotAvailableError` |
| Infrastructure (I/O) | `GatewayError` | `DatabaseConnectionError` |

---

## Test doubles

```
testing/
├── good-path/
│   └── stub.something.gateway.ts    # Happy path
└── bad-path/
    └── failing.something.gateway.ts # Error scenarios
```

Stubs extend the abstract gateway class.

---

## Anti-patterns to avoid

- No business logic in Controllers
- No presentation logic in Use Cases
- No entities aware of infrastructure (Prisma, NestJS)
- No dependencies pointing outward
- No TS interfaces as DI tokens (they vanish at runtime)
