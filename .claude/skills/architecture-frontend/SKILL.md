---
name: architecture-frontend
description: Clean Architecture guide for the React frontend. Use to create frontend modules, entities, use cases, presenters, hooks, views, gateways, guards. Applies Humble Object pattern (Uncle Bob) — views are untestable glue, hooks and presenters hold all logic. For backend architecture, use architecture-backend instead.
---

# Clean Architecture - Frontend Tactical Guide (React + Vite)

## Activation

This skill activates for any creation or modification of frontend architectural components:
- Entities, Use Cases, Presenters (classes)
- Hooks (React bridge)
- Views (humble .tsx)
- Gateways (HTTP ports + implementations)
- Guards (Zod validation)
- DI wiring in `frontend/src/main/dependencies.ts`
- Module structure under `frontend/src/modules/<bc>/`

## Core Principle

> "The architecture should scream the intent of the system." — Uncle Bob

```
┌──────────────────────────────────────────────────┐
│ Interface Adapters                               │
│ ┌─ views/<feature>.view.tsx ..... HUMBLE (untested) ─┐
│ ├─ hooks/use-<feature>.ts ....... React bridge       │
│ ├─ presenters/<feature>.presenter.ts ... class       │
│ └─ gateways/<entity>.in-http.gateway.ts ... impl     │
├──────────────────────────────────────────────────┤
│ Use Cases .......... class with execute()        │
├──────────────────────────────────────────────────┤
│ Entities ........... pure TS, rare in frontend   │
└──────────────────────────────────────────────────┘
```

**Dependency Rule**: dependencies point inward. Views never import usecases or gateways directly — they only receive a `viewModel` prop and emit callbacks. Hooks compose usecases + presenters. Usecases receive gateway ports through their constructor. Nothing inward knows about React.

## Humble Object Pattern (Robert C. Martin, *Clean Architecture* ch. 23)

> « The Humble Object pattern separates the behaviors that are hard to test from those that are easy to test. The GUI is hard to test — so we leave very little behavior in it, just enough to make it dumb. The Presenter is easy to test — it does all the work. »

**Operational rule for this project:**

| Layer | Role | Testability |
|-------|------|-------------|
| `.view.tsx` | Humble. Receives `viewModel` prop, destructures, renders JSX. Zero React hook, zero condition on domain, zero calculation. | Not unit-tested. Verified visually or by e2e (Playwright). |
| `.presenter.ts` | Class `Presenter<Input, ViewModel>`. Pure function wrapped in a class. Transforms domain data into a ViewModel validated by a Zod schema. | Fully unit-tested (Vitest, no `renderHook`). |
| `use-<feature>.ts` | React bridge: `useEffect`, `useState`, custom hooks, composes presenter + usecase + `AsyncState`. | Unit-tested with `renderHook` from `@testing-library/react`. |

The **architectural boundary** lies between the `.view.tsx` (humble) and the `use-<feature>.ts` (testable).

## Module Structure

Bounded contexts are shared with the backend: `analytics`, `audit`, `identity`, `notification`, `synchronization`, etc. Same name on both sides.

```
frontend/src/modules/<bc>/
├── entities/<entity>/
│   ├── <entity>.ts                   ← class + Zod schema, private constructor, static create()
│   ├── <entity>.schema.ts            ← Zod schema (split if large)
│   ├── <entity>.guard.ts             ← createGuard() instance
│   ├── <entity>.gateway.ts           ← interface (port) — not class, not abstract class
│   └── <entity>.errors.ts            ← BusinessRuleViolation subclasses
├── usecases/
│   ├── <action>-<entity>.usecase.ts  ← class implementing Usecase<Params, Result>
│   └── <action>-<entity>.usecase.spec.ts
├── interface-adapters/
│   ├── gateways/
│   │   ├── <entity>.in-http.gateway.ts      ← class implementing the port, uses fetch
│   │   └── <entity>.in-http.gateway.spec.ts
│   ├── presenters/
│   │   ├── <feature>.presenter.ts           ← class implementing Presenter<Input, VM>
│   │   ├── <feature>.presenter.spec.ts
│   │   └── <feature>.view-model.schema.ts   ← Zod schema for the ViewModel
│   ├── hooks/
│   │   ├── use-<feature>.ts                 ← React bridge
│   │   └── use-<feature>.spec.ts
│   └── views/
│       └── <feature>.view.tsx               ← humble JSX, receives viewModel prop
└── testing/
    ├── good-path/
    │   └── stub.<entity>.gateway.ts         ← class implementing port (in-memory)
    └── bad-path/
        └── failing.<entity>.gateway.ts      ← class throwing GatewayError
```

Routes are declared in `frontend/src/app.tsx` (React Router v7). A route file imports the hook, renders the view, and lives at `frontend/src/app/routes/<feature>.route.tsx` (thin adapter between React Router and the view+hook pair).

## Pattern: View (Humble)

**Canonical example — Dashboard view:**

```tsx
// frontend/src/modules/analytics/interface-adapters/views/dashboard.view.tsx
import type { DashboardViewModel } from '../presenters/dashboard.view-model.schema.ts';
import { TeamCard } from './team-card.view.tsx';
import { SyncStatusBar } from './sync-status-bar.view.tsx';

interface DashboardViewProps {
  viewModel: DashboardViewModel;
  onResyncClick: () => void;
}

export function DashboardView({ viewModel, onResyncClick }: DashboardViewProps) {
  return (
    <main>
      <SyncStatusBar status={viewModel.synchronization} onResyncClick={onResyncClick} />
      <section>
        {viewModel.teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </section>
    </main>
  );
}
```

**Rules:**
- No `useState`, `useEffect`, `useMemo`, `useCallback`, `useReducer`, `useRef`, `useContext` (enforced by `scripts/hooks/no-logic-in-views.sh`).
- No import from `usecases/` or `gateways/` (enforced by the same hook).
- No conditional rendering on domain state — branching happens in the hook before calling the view.
- Receives a `viewModel` prop typed from the presenter output.
- Emits via callback props (`onResyncClick`, etc.).
- Child views follow the same rule, recursively.

## Pattern: Presenter (Testable)

```typescript
// frontend/src/modules/analytics/interface-adapters/presenters/dashboard.view-model.schema.ts
import { z } from 'zod';

export const DashboardTeamViewModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  cycleName: z.string().nullable(),
  completionPercentage: z.number(),
  healthTier: z.enum(['healthy', 'warning', 'danger', 'idle']),
  blockedCount: z.number(),
  reportPath: z.string().nullable(),
});

export const DashboardViewModelSchema = z.object({
  teams: z.array(DashboardTeamViewModelSchema),
  synchronization: z.object({
    lastSyncedAt: z.string().nullable(),
    isLate: z.boolean(),
  }),
});

export type DashboardViewModel = z.infer<typeof DashboardViewModelSchema>;
```

```typescript
// frontend/src/modules/analytics/interface-adapters/presenters/dashboard.presenter.ts
import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import { type WorkspaceDashboardDto } from '../gateways/dashboard.dto.ts';
import { type DashboardViewModel } from './dashboard.view-model.schema.ts';

export class DashboardPresenter implements Presenter<WorkspaceDashboardDto, DashboardViewModel> {
  present(dto: WorkspaceDashboardDto): DashboardViewModel {
    return {
      teams: dto.teams.map((team) => ({
        id: team.id,
        name: team.name,
        cycleName: team.activeCycle?.name ?? null,
        completionPercentage: team.activeCycle?.completion ?? 0,
        healthTier: this.computeHealthTier(team),
        blockedCount: team.activeCycle?.blockedCount ?? 0,
        reportPath: team.activeCycle?.reportId ? `/cycle-report?teamId=${team.id}` : null,
      })),
      synchronization: {
        lastSyncedAt: dto.synchronization.lastSyncedAt,
        isLate: dto.synchronization.isLate,
      },
    };
  }

  private computeHealthTier(team: WorkspaceDashboardDto['teams'][number]): 'healthy' | 'warning' | 'danger' | 'idle' {
    if (!team.activeCycle) return 'idle';
    if (team.activeCycle.blockedRatio >= 1) return 'danger';
    if (team.activeCycle.completion >= 60) return 'healthy';
    if (team.activeCycle.completion >= 30) return 'warning';
    return 'danger';
  }
}
```

**Rules:**
- A class implementing `Presenter<Input, Output>`.
- Pure transformation: same input → same output, no side effects.
- Output shape is a Zod-inferred ViewModel type (runtime safety at boundaries).
- Private helpers for intermediate calculations (SRP).
- No React, no fetch, no imports from `hooks/` or `views/`.

## Pattern: Hook (React Bridge)

Only place in the codebase where `useState`, `useEffect`, `useMemo`, and custom hooks are allowed alongside views' children. The hook orchestrates the usecase, the presenter, and exposes an `AsyncState` discriminated union.

```typescript
// frontend/src/modules/analytics/interface-adapters/hooks/use-dashboard.ts
import { useCallback, useEffect, useState } from 'react';
import { type AsyncState } from '@/shared/foundation/async-state/async-state.type.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { usecases } from '@/main/dependencies.ts';
import { DashboardPresenter } from '../presenters/dashboard.presenter.ts';
import { type DashboardViewModel } from '../presenters/dashboard.view-model.schema.ts';

type DashboardEmptyVariant =
  | { status: 'empty'; reason: 'not_connected' }
  | { status: 'empty'; reason: 'no_teams' };

export type DashboardState = AsyncState<DashboardViewModel, DashboardEmptyVariant>;

interface UseDashboardResult {
  state: DashboardState;
  resync: () => Promise<void>;
}

export function useDashboard(): UseDashboardResult {
  const [state, setState] = useState<DashboardState>({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const dto = await usecases.getWorkspaceDashboard.execute();
      if (dto.teams.length === 0) {
        setState({ status: 'empty', reason: dto.isConnected ? 'no_teams' : 'not_connected' });
        return;
      }
      const presenter = new DashboardPresenter();
      setState({ status: 'ready', data: presenter.present(dto) });
    } catch (error) {
      const message = error instanceof GatewayError ? error.message : 'Unexpected error';
      setState({ status: 'error', message });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { state, resync: load };
}
```

**Rules:**
- Named `use-<feature>.ts` in `interface-adapters/hooks/`.
- Imports usecases from the singleton registry `@/main/dependencies.ts`.
- Instantiates presenters locally (they are stateless classes, no DI needed).
- Exposes an `AsyncState` extended with feature-specific variants when needed (`empty`, `submitting`, etc.).
- All React hooks live here, nowhere else (except their strict React-UI counterparts in other hooks).

## Pattern: UseCase

```typescript
// frontend/src/modules/analytics/usecases/get-workspace-dashboard.usecase.ts
import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type DashboardGateway } from '../entities/dashboard/dashboard.gateway.ts';
import { type WorkspaceDashboardDto } from '../interface-adapters/gateways/dashboard.dto.ts';

export class GetWorkspaceDashboardUsecase implements Usecase<void, WorkspaceDashboardDto> {
  constructor(private readonly dashboardGateway: DashboardGateway) {}

  async execute(): Promise<WorkspaceDashboardDto> {
    return this.dashboardGateway.fetchWorkspaceDashboard();
  }
}
```

**Rules:**
- One user intention per usecase (CQRS-like: one usecase per read or one per command).
- Dependencies received via constructor — pure DI, no service locator.
- Returns domain data (or DTOs from the gateway) — never ViewModels.
- Throws `BusinessRuleViolation` or `ApplicationRuleViolation` on rule failure, never `GatewayError` (gateway errors bubble up from the gateway).
- No React, no DOM, no window.

## Pattern: Gateway (Port + Implementation)

**Port** (interface in `entities/`):

```typescript
// frontend/src/modules/analytics/entities/dashboard/dashboard.gateway.ts
import { type WorkspaceDashboardDto } from '../../interface-adapters/gateways/dashboard.dto.ts';

export interface DashboardGateway {
  fetchWorkspaceDashboard(): Promise<WorkspaceDashboardDto>;
}
```

**HTTP implementation** (in `interface-adapters/gateways/`):

```typescript
// frontend/src/modules/analytics/interface-adapters/gateways/dashboard.in-http.gateway.ts
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { type DashboardGateway } from '../../entities/dashboard/dashboard.gateway.ts';
import { workspaceDashboardDtoGuard } from './dashboard.dto.guard.ts';
import { type WorkspaceDashboardDto } from './dashboard.dto.ts';

export class DashboardInHttpGateway implements DashboardGateway {
  async fetchWorkspaceDashboard(): Promise<WorkspaceDashboardDto> {
    const response = await fetch('/dashboard/data');
    if (!response.ok) {
      throw new GatewayError(`Failed to fetch dashboard: ${response.status}`);
    }
    const body: unknown = await response.json();
    return workspaceDashboardDtoGuard.parse(body);
  }
}
```

**Rules:**
- Port is a `TypeScript interface` (frontend has no runtime DI container, so no need for an abstract class).
- Implementation validates responses with a Zod guard at the boundary (trust nothing from network).
- HTTP failures throw `GatewayError`, not raw `Error`.
- Never import `presenters/`, `hooks/`, `views/`.

## Pattern: Entity (Rare in Frontend)

Entities appear frontend-side only when pure client-side business logic is needed — e.g., a local draft state with invariants, or a cache policy. Most frontend modules will have zero entities and consume DTOs directly.

Same conventions as backend: private constructor, `static create()`, Zod schema, `.errors.ts` with `BusinessRuleViolation` subclasses.

## Dependency Injection: Module-Level Singleton Registry

No React Context, no Redux, no service container. A single module exports instantiated usecases. Hooks import them directly.

```typescript
// frontend/src/main/dependencies.ts
import { GetWorkspaceDashboardUsecase } from '@/modules/analytics/usecases/get-workspace-dashboard.usecase.ts';
import { SyncWorkspaceTeamsUsecase } from '@/modules/synchronization/usecases/sync-workspace-teams.usecase.ts';
import { DashboardInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/dashboard.in-http.gateway.ts';
import { SyncInHttpGateway } from '@/modules/synchronization/interface-adapters/gateways/sync.in-http.gateway.ts';

const dashboardGateway = new DashboardInHttpGateway();
const syncGateway = new SyncInHttpGateway();

export const usecases = {
  getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(dashboardGateway),
  syncWorkspaceTeams: new SyncWorkspaceTeamsUsecase(syncGateway, dashboardGateway),
};

export function overrideUsecases(overrides: Partial<typeof usecases>): void {
  Object.assign(usecases, overrides);
}
```

**Usage in a hook:**
```typescript
import { usecases } from '@/main/dependencies.ts';
// inside the hook:
const dto = await usecases.getWorkspaceDashboard.execute();
```

**Usage in a test:**
```typescript
import { overrideUsecases } from '@/main/dependencies.ts';

beforeEach(() => {
  overrideUsecases({
    getWorkspaceDashboard: {
      async execute() { return stubDashboardDto; },
    },
  });
});
```

Or with `vi.mock('@/main/dependencies')` when the test wants to replace the whole module.

**Why not React Context for DI**: Context propagates through the render tree and couples testing to `render()` + provider setup. The registry is a plain module import — no render needed to unit-test a hook (`renderHook` is enough, no provider to wrap).

## Testing

### Stubs

Good-path stub (in-memory):
```typescript
// frontend/src/modules/analytics/testing/good-path/stub.dashboard.gateway.ts
import { type DashboardGateway } from '../../entities/dashboard/dashboard.gateway.ts';
import { type WorkspaceDashboardDto } from '../../interface-adapters/gateways/dashboard.dto.ts';

export class StubDashboardGateway implements DashboardGateway {
  constructor(private readonly dto: WorkspaceDashboardDto) {}
  async fetchWorkspaceDashboard(): Promise<WorkspaceDashboardDto> { return this.dto; }
}
```

Bad-path stub (always fails):
```typescript
// frontend/src/modules/analytics/testing/bad-path/failing.dashboard.gateway.ts
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { type DashboardGateway } from '../../entities/dashboard/dashboard.gateway.ts';

export class FailingDashboardGateway implements DashboardGateway {
  async fetchWorkspaceDashboard(): Promise<never> {
    throw new GatewayError('Network error');
  }
}
```

Bad-path stubs **must throw `GatewayError`**, not `Error` (enforced by `enforce-gateway-error-in-bad-path.sh`).

### Builders

Test data builders live in `frontend/tests/builders/<entity>.builder.ts` and extend `EntityBuilder<Props, Entity>` from `@/shared/foundation/testing/entity-builder.ts`. Same convention as backend.

### Test Location

Co-located tests (`<file>.spec.ts` next to the source file) are fine for unit tests. Acceptance tests go in `frontend/tests/acceptance/<feature>.acceptance.spec.ts` with the `(acceptance)` label in the root `describe`.

## Anti-Patterns (automated quality gates block these)

| # | Anti-pattern | Gate |
|---|--------------|------|
| 1 | `useState`, `useEffect`, etc. in a `.view.tsx` | `no-logic-in-views.sh` |
| 2 | `.view.tsx` importing usecase/gateway | `no-logic-in-views.sh` |
| 3 | Dependency Rule violation (entity importing interface-adapters) | `enforce-dependency-rule.sh` |
| 4 | `.gateway.ts` port containing a `class` | `enforce-gateway-port-purity.sh` |
| 5 | Bad-path stub throwing `Error` instead of `GatewayError` | `enforce-gateway-error-in-bad-path.sh` |
| 6 | Presenter written as a function instead of a class | `enforce-presenter-class.sh` |
| 7 | View not receiving `viewModel` prop | `no-logic-in-views.sh` |
| 8 | `import type X` instead of `import { type X }` | `enforce-inline-type-imports.sh` |

## Foundation Reference

Located at `frontend/src/shared/foundation/`:

| File | Purpose |
|------|---------|
| `presenter/presenter.ts` | `Presenter<Input, Output>` interface |
| `usecase/usecase.ts` | `Usecase<Params, Result>` interface |
| `guard/guard.ts` | `createGuard(schema, instigator)` — Zod-based runtime validator |
| `async-state/async-state.type.ts` | `AsyncState<Data, ExtraVariants>` discriminated union |
| `gateway-error.ts` | `GatewayError` — for I/O failures |
| `business-rule-violation.ts` | `BusinessRuleViolation` — abstract base for domain invariant violations |
| `application-rule-violation.ts` | `ApplicationRuleViolation` — abstract base for precondition/config errors |
| `testing/entity-builder.ts` | `EntityBuilder<Props, Entity>` — base for test data builders |

These files are duplicated from `backend/src/shared/foundation/`. A future refactor will extract them into a shared monorepo package.
