# Shiplens

Shiplens connects to your [Linear](https://linear.app) workspace and turns raw project data into actionable insights: cycle metrics, bottleneck detection, AI-generated sprint reports, and team health dashboards.

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22 + NestJS 11 |
| Language | TypeScript (strict, zero `any`) |
| Database | SQLite via Prisma ORM |
| Validation | Zod |
| Unit tests | Vitest |
| E2E tests | Playwright |
| Package manager | pnpm |

## Architecture

**Screaming Architecture + Clean Architecture** (Uncle Bob), organized as bounded contexts.

```
src/
  modules/
    identity/             # Linear OAuth, workspace connection, token management
    synchronization/      # Team selection, reference data & issue sync
  shared/
    foundation/           # Cross-BC abstractions (usecase, guard, presenter, errors)
    domain/               # Shared Kernel (cross-BC business concepts)
    infrastructure/       # PrismaService, PrismaModule
  main/                   # App bootstrap
```

Each module follows Clean Architecture layers:

```
modules/<context>/
  entities/               # Domain types, Zod schemas, gateway ports, errors
  usecases/               # @Injectable use cases with execute()
  interface-adapters/
    controllers/          # HTTP endpoints (zero business logic)
    gateways/             # Prisma & HTTP gateway implementations
    presenters/           # Domain -> DTO transformation
  testing/
    good-path/            # Stubs for nominal scenarios
    bad-path/             # Stubs for error scenarios
```

**Dependency rule**: dependencies point inward only. Domain never imports infrastructure.

## Prerequisites

- Node.js >= 22
- pnpm

## Setup

```bash
pnpm install
```

Create a `.env` file at the root:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
LINEAR_CLIENT_ID=your-linear-oauth-client-id
LINEAR_CLIENT_SECRET=your-linear-oauth-client-secret
ENCRYPTION_KEY=your-32-char-encryption-key
```

Run migrations:

```bash
pnpm db:migrate
```

## Development

```bash
pnpm start:dev           # watch mode with hot reload
pnpm start:debug         # debug mode (--inspect)
pnpm start:prod          # production build
```

## Testing

```bash
pnpm test                # unit tests
pnpm test:watch          # unit tests in watch mode
pnpm test:cov            # unit tests with coverage
pnpm test:e2e            # end-to-end tests (Playwright)
npx tsc --noEmit         # type check (must pass before any commit)
```

## Database

```bash
pnpm db:backup                         # always backup first
pnpm db:migrate --name <description>   # create + apply migration
pnpm db:deploy                         # apply pending migrations (production)
pnpm db:status                         # check migration status
pnpm prisma:studio                     # visual DB browser
```

## API Endpoints

### Identity

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/linear/status` | Connection status |
| POST | `/linear/connect` | Connect Linear workspace (OAuth) |
| POST | `/linear/disconnect` | Disconnect workspace |
| POST | `/linear/refresh` | Refresh OAuth session |

### Synchronization

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/sync/teams` | List available Linear teams |
| POST | `/sync/selection` | Save team selection |
| GET | `/sync/selection` | Get current team selection |
| POST | `/sync/reference-data` | Sync labels, statuses, members, projects |

## Feature Roadmap

| Feature | Status |
|---------|--------|
| Connect Linear workspace | implemented |
| Select teams to sync | implemented |
| Sync reference data (labels, statuses, members, projects) | implemented |
| Sync issues & cycles | drafted |
| Calculate cycle metrics | drafted |
| Detect blocked issues | drafted |
| Generate AI sprint report | drafted |
| Analyze bottlenecks by status | drafted |
| Workspace dashboard | drafted |
| Real-time sync (webhooks) | drafted |
| Slack notifications | drafted |
| Custom audit rules | drafted |

Full tracker with specs: [`docs/feature-tracker.md`](docs/feature-tracker.md)

## Project Methodology

- **Spec-Driven Development**: features start as specs in [`docs/specs/`](docs/specs/) with Rules, Scenarios, and Glossary
- **TDD Detroit School**: inside-out, state-based, RED-GREEN-REFACTOR
- **DDD Strategic**: bounded contexts, ubiquitous language (no tactical over-engineering)
- **Conventional Commits**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

## License

UNLICENSED
