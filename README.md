# Shiplens

Shiplens connects to your [Linear](https://linear.app) workspace and turns raw project data into actionable insights: cycle metrics, bottleneck detection, AI-generated sprint reports, estimation accuracy tracking, and team health dashboards.

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22 + NestJS 11 |
| Language | TypeScript (strict, zero `any`) |
| Database | SQLite via Prisma ORM |
| Validation | Zod |
| Unit tests | Vitest |
| E2E tests | Playwright |
| Package manager | pnpm 10+ |

## Architecture

**Screaming Architecture + Clean Architecture** (Uncle Bob), organized as bounded contexts.

```
src/
  modules/
    identity/             # Linear OAuth, workspace connection, token management
    synchronization/      # Team selection, reference data, issue & cycle sync, webhooks
    analytics/            # Cycle metrics, reports, blocked detection, estimation, dashboard
    audit/                # Custom audit rules, Packmind integration
    notification/         # Slack reports & blocked issue alerts
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
- pnpm 10+

## Setup

```bash
pnpm install
```

Create a `.env` file at the root (see `.env.example`):

```env
# Required
DATABASE_URL="file:./dev.db"
PORT=3000
ENCRYPTION_KEY=your-32-char-encryption-key

# Linear OAuth
LINEAR_CLIENT_ID=your-linear-oauth-client-id
LINEAR_CLIENT_SECRET=your-linear-oauth-client-secret
LINEAR_WEBHOOK_SIGNING_SECRET=your-webhook-signing-secret

# Optional: Linear auto-connection (skips OAuth)
LINEAR_PERSONAL_API_KEY=your-personal-api-key

# Optional: AI text generation (pick one)
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key
OLLAMA_URL=http://localhost:11434/api/generate

# Optional: Packmind integration
PACKMIND_API_URL=https://api.packmind.com
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

## Code Quality

```bash
pnpm lint                # lint & fix with Biome
pnpm lint:ci             # lint check (CI, no auto-fix)
pnpm format              # format with Biome
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
| POST | `/sync/issue-data` | Sync issues & cycles for a team |
| GET | `/sync/issue-data/progress` | Get sync progress |
| POST | `/webhooks/linear` | Receive Linear webhook events |

### Analytics — Cycle Metrics & Reports

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/analytics/cycles/:cycleId/metrics` | Calculate cycle metrics |
| POST | `/analytics/cycles/:cycleId/report` | Generate AI sprint report |
| GET | `/analytics/teams/:teamId/reports` | List team reports |
| GET | `/analytics/reports/:reportId` | Get report detail |
| POST | `/analytics/cycles/:cycleId/member-digest` | Generate member digest |

### Analytics — Blocked Issues & Bottlenecks

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/analytics/blocked-issues` | List blocked issues |
| GET | `/analytics/blocked-issues/history` | Alert history |
| POST | `/analytics/blocked-issues/thresholds` | Configure status thresholds |
| POST | `/analytics/blocked-issues/detect` | Trigger blocked detection |
| GET | `/analytics/cycles/:cycleId/bottlenecks` | Bottleneck analysis by status |

### Analytics — Estimation & Prediction

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/analytics/teams/:teamId/cycles/:cycleId/estimation-accuracy` | Estimation accuracy for a cycle |
| GET | `/api/analytics/teams/:teamId/estimation-trend` | Estimation trend over time |
| GET | `/api/analytics/teams/:teamId/issues/:issueExternalId/duration-prediction` | Predict issue duration |

### Analytics — Pages & Dashboard

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/dashboard` | Workspace dashboard (HTML) |
| GET | `/dashboard/data` | Dashboard data (JSON) |
| GET | `/cycle-report` | Cycle report page (HTML) |
| GET | `/analytics/teams/:teamId/cycles` | List team cycles |
| GET | `/analytics/cycles/:cycleId/issues` | Issues in a cycle |
| GET | `/settings` | Settings page (HTML) |

### Analytics — Team Settings

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/settings/teams/:teamId/excluded-statuses` | Get excluded statuses |
| PUT | `/settings/teams/:teamId/excluded-statuses` | Update excluded statuses |
| GET | `/settings/teams/:teamId/available-statuses` | List available statuses |

### Audit

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/audit/sync-packmind` | Import rules from Packmind |

### Notification

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/notifications/slack/configure` | Configure Slack webhook |
| POST | `/notifications/slack/send` | Send report to Slack |
| POST | `/notifications/slack/alerts/configure` | Configure alert channel |
| POST | `/notifications/slack/alerts/send` | Send blocked issue alerts |

## Features

| Feature | Module | Status |
|---------|--------|--------|
| Connect Linear workspace (OAuth + API key) | Identity | implemented |
| Select teams to sync | Synchronization | implemented |
| Sync reference data (labels, statuses, members, projects) | Synchronization | implemented |
| Sync issues & cycles (paginated) | Synchronization | implemented |
| Real-time sync via webhooks | Synchronization | implemented |
| Calculate cycle metrics (velocity, throughput, cycle time, scope creep) | Analytics | implemented |
| Generate AI sprint report | Analytics | implemented |
| Export sprint reports | Analytics | implemented |
| Detect blocked issues (scheduled hourly) | Analytics | implemented |
| Analyze bottlenecks by status | Analytics | implemented |
| Track estimation accuracy (estimates vs reality) | Analytics | implemented |
| Predict issue duration (statistical) | Analytics | implemented |
| Workspace dashboard with team KPIs | Analytics | implemented |
| Cycle report page | Analytics | implemented |
| Dashboard empty states | Analytics | implemented |
| Cycle piloting data | Analytics | implemented |
| Member cycle profile | Analytics | implemented |
| Define custom audit rules | Audit | implemented |
| Import rules from Packmind | Audit | implemented |
| Evaluate audit rules in sprint reports | Analytics | implemented |
| Send sprint reports to Slack | Notification | implemented |
| Alert blocked issues on Slack (scheduled daily) | Notification | implemented |
| Detect drifting issues | Analytics | ready |
| Member health trends | Analytics | ready |

Full tracker with specs: [`docs/feature-tracker.md`](docs/feature-tracker.md)

## Project Methodology

- **Spec-Driven Development**: features start as specs in [`docs/specs/`](docs/specs/) with Rules, Scenarios, and Glossary
- **TDD Detroit School**: inside-out, state-based, RED-GREEN-REFACTOR
- **DDD Strategic**: bounded contexts, ubiquitous language (no tactical over-engineering)
- **Conventional Commits**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

## License

[MIT](LICENSE)
