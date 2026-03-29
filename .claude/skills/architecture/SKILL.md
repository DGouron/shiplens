---
name: architecture
description: Guide Clean Architecture (Uncle Bob) pour NestJS. Utiliser pour créer module, entité, use case, presenter, controller, gateway, guard. Contient les patterns tactiques et conventions de structure.
---

# Clean Architecture - Guide Tactique (NestJS)

## Activation

Ce skill s'active pour toute création ou modification de composants architecturaux :
- Entities, Use Cases, Presenters
- Controllers, Gateways, Guards
- DTOs, Services
- Structure de modules

## Principe fondamental

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

**Dependency Rule** : Les dépendances pointent vers l'intérieur. Le domaine ne connaît pas l'infrastructure.

---

## Structure d'un module

```
src/modules/<bounded-context>/
├── <context>.module.ts            # NestJS module (wiring DI)
├── entities/
│   └── <entity>/
│       ├── <entity>.ts            # Entité pure (private constructor, static create)
│       ├── <entity>.schema.ts     # Zod schema
│       ├── <entity>.guard.ts      # Validation aux frontières
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
│       └── <entity>.in-prisma.gateway.ts  # Implémentation Prisma
└── testing/
    ├── good-path/
    │   └── stub.<entity>.gateway.ts
    └── bad-path/
        └── failing.<entity>.gateway.ts
```

---

## Composants

### Entity

Logique métier pure, indépendante de tout framework.

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

Orchestration d'une action métier. Un use case = une intention utilisateur. `@Injectable` avec `execute()`.

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

Transforme les données métier en DTO pour réponse API. Contient TOUTE la logique de présentation.

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

Reçoit les requêtes HTTP, appelle le Use Case, retourne via Presenter.

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

Port (abstract class) dans entities, implémentation (Prisma) dans interface-adapters.

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

Validation aux frontières avec Zod + createGuard.

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

## Anti-patterns à éviter

- ❌ Logique métier dans les Controllers
- ❌ Logique de présentation dans les Use Cases
- ❌ Entités qui connaissent l'infrastructure (Prisma, NestJS)
- ❌ Dépendances qui pointent vers l'extérieur
- ❌ Interfaces TS comme DI tokens (disparaissent au runtime)
