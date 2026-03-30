# Shiplens

Shiplens connects to your Linear workspace and turns raw project data into actionable insights: sprint reports, bottleneck detection, cycle metrics, and team health dashboards.

## Stack

- **Runtime** : Node.js + NestJS 11
- **Language** : TypeScript (strict)
- **Database** : SQLite via Prisma ORM
- **Testing** : Vitest + Playwright
- **Package manager** : pnpm

## Architecture

Screaming Architecture + Clean Architecture (Uncle Bob), organized as bounded contexts.

```
src/
  modules/
    identity/           # Workspace connection, auth, tokens
    synchronization/    # Team selection, reference data sync, data import
  shared/
    foundation/         # Cross-BC abstractions (usecase, guard, presenter, errors)
    domain/             # Shared Kernel (cross-BC business concepts)
    infrastructure/     # PrismaService, PrismaModule
  main/                 # App bootstrap, NestJS wiring
```

Each module follows the same internal structure:

```
modules/<context>/
  entities/             # Domain types, schemas, gateway ports, errors
  usecases/             # Application logic (@Injectable, execute())
  interface-adapters/
    controllers/        # HTTP endpoints
    gateways/           # Prisma/HTTP implementations
    presenters/         # Domain -> DTO transformation
  testing/
    good-path/          # Stubs for happy path
    bad-path/           # Stubs for error scenarios
```

## Setup

```bash
pnpm install
cp .env.example .env    # configure LINEAR_CLIENT_ID, LINEAR_CLIENT_SECRET, ENCRYPTION_KEY
pnpm db:migrate         # run Prisma migrations
```

## Development

```bash
pnpm start:dev          # watch mode
pnpm test               # unit tests (Vitest)
pnpm test:e2e           # end-to-end tests (Playwright)
npx tsc --noEmit        # type check
```

## Database

```bash
pnpm db:backup          # backup before any migration
pnpm db:migrate --name <description>   # create + apply migration
pnpm db:deploy          # apply migrations in production
pnpm prisma:studio      # visual DB browser
```

## Feature Status

| Feature | Status |
|---------|--------|
| Connect Linear workspace | implemented |
| Select teams to sync | implemented |
| Sync reference data (labels, statuses, members, projects) | implemented |
| Sync issues and cycles | drafted |
| Calculate cycle metrics | drafted |
| Detect blocked issues | drafted |
| Generate AI sprint report | drafted |
| Workspace dashboard | drafted |

Full tracker: [`docs/feature-tracker.md`](docs/feature-tracker.md)

## Specs

Feature specifications live in [`docs/specs/`](docs/specs/). Each spec follows a custom DSL with Rules, Scenarios, and Glossary sections.

## License

UNLICENSED
