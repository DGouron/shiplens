# Contributing to Shiplens

## Prerequisites

- Node.js >= 22
- pnpm 10+ (`corepack enable` activates it)

## Setup

```bash
git clone https://github.com/DGouron/shiplens.git
cd shiplens
pnpm install
cp .env.example .env
# Edit .env with your values
pnpm db:migrate
pnpm start:dev
```

## Development Workflow

1. Fork the repository
2. Create a feature branch from `master`: `git checkout -b feat/my-feature`
3. Make your changes following the conventions below
4. Push and open a Pull Request against `master`

## Quality Gates

Every PR must pass before merge:

```bash
pnpm lint:ci          # Biome lint (zero errors)
npx tsc --noEmit      # TypeScript type check (zero errors)
pnpm test             # Unit tests (all green)
pnpm build            # Build succeeds
```

These run automatically in CI.

## Conventions

### Commits

[Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat(analytics): add cycle velocity chart
fix(sync): handle empty webhook payload
refactor(identity): simplify token refresh flow
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`

### Code Style

- **TypeScript strict** — no `any`, no type assertions (`as`), no non-null assertions (`!`)
- **Full words** in names — `existing`, not `ex`; `index`, not `idx`
- **No barrel exports** — direct imports only, no `index.ts` re-exports
- **Biome** handles formatting and linting — run `pnpm lint` to auto-fix

### Testing

- **Framework**: Vitest
- **Approach**: TDD Detroit School (inside-out, state-based)
- **Location**: mirror structure in `tests/` — e.g. `src/modules/auth/entities/user.ts` maps to `tests/modules/auth/entities/user.spec.ts`
- **Builders**: always use builders from `tests/builders/`, never `new Entity()` directly
- **Mocks**: only for I/O boundaries (gateways, APIs, DB)
- **Language**: English only in tests

### Language

| Context | Language |
|---------|----------|
| Code, tests, commits, logs | English |
| Error messages, UI texts (end-user facing) | French |

## Architecture

Screaming Architecture + Clean Architecture, organized as bounded contexts:

```
src/modules/<context>/
  entities/            # Domain types, schemas, gateway ports
  usecases/            # @Injectable use cases
  interface-adapters/
    controllers/       # HTTP endpoints
    gateways/          # Prisma & HTTP implementations
    presenters/        # Domain -> DTO
```

**Dependency rule**: dependencies point inward only. Domain never imports infrastructure.

See the [README](README.md) for the full module list and API reference.

## Branch Protection

The `master` branch requires:

- All CI checks passing (lint, types, tests, build)
- At least 1 approving review
- No force pushes

## Reporting Issues

- **Bugs**: use the [bug report template](https://github.com/DGouron/shiplens/issues/new?template=bug_report.yml)
- **Features**: use the [feature request template](https://github.com/DGouron/shiplens/issues/new?template=feature_request.yml)
- **Security**: see [SECURITY.md](SECURITY.md) — do not open public issues
