# Connect your Linear workspace

## Status: implemented

## Context
The user must link their Linear workspace to Shiplens so the application can access their data. Without this connection, no tracking functionality is available.

## Rules
- A user can only have one Linear workspace connected at a time
- Connection credentials are never exposed in plain text
- The Linear session remains active without manual user intervention
- Disconnection removes all workspace access traces on both the Linear and Shiplens sides

## Scenarios
- successful connection: {authenticated user, Linear authorization granted} -> status "connected" + workspace name displayed
- authorization denied: {authenticated user, Linear authorization denied} -> reject "La connexion à Linear a été refusée. Veuillez réessayer."
- insufficient permissions: {authenticated user, partial permissions granted} -> reject "Les permissions accordées sont insuffisantes. Veuillez autoriser tous les accès demandés."
- expired session: {Linear session expired} -> automatic renewal + "connected" status maintained
- renewal impossible: {Linear session expired, renewal failed} -> status "disconnected" + reject "Votre session Linear a expiré. Veuillez vous reconnecter."
- disconnection: {connected user, disconnection request} -> status "disconnected" + access revoked on Linear side
- workspace already connected: {connected user, attempt to connect another workspace} -> previous workspace replaced + status "connected" to the new one

## Out of scope
- Connecting multiple workspaces simultaneously
- Connecting to tools other than Linear
- Managing roles or permissions internal to Linear

## Glossary
| Term | Definition |
|------|------------|
| Workspace | Linear workspace of an organization |
| Session | Active link between Shiplens and the user's Linear workspace |
| Disconnection | Complete severing of the link, with access removal on both sides |

## Implementation

| Artefact | Path |
|----------|------|
| Bounded Context | `src/modules/identity/` |
| Entity | `entities/linear-workspace-connection/linear-workspace-connection.ts` |
| Use Cases | `usecases/get-connection-status.usecase.ts`, `usecases/connect-linear-workspace.usecase.ts`, `usecases/disconnect-linear-workspace.usecase.ts`, `usecases/refresh-linear-session.usecase.ts` |
| Controller | `interface-adapters/controllers/linear-connection.controller.ts` |
| Presenter | `interface-adapters/presenters/connection-status.presenter.ts` |
| Gateways | `interface-adapters/gateways/linear-workspace-connection.in-prisma.gateway.ts`, `interface-adapters/gateways/linear-api.in-http.gateway.ts`, `interface-adapters/gateways/token-encryption.in-crypto.gateway.ts` |
| Migration | `prisma/migrations/20260330212207_add_linear_workspace_connection/` |
| Acceptance tests | `tests/acceptance/connect-linear-workspace.acceptance.spec.ts` |

### Endpoints

| Method | Route | Use Case |
|--------|-------|----------|
| GET | `/linear/status` | GetConnectionStatus |
| POST | `/linear/connect` | ConnectLinearWorkspace |
| POST | `/linear/disconnect` | DisconnectLinearWorkspace |
| POST | `/linear/refresh` | RefreshLinearSession |

### Decisions

- Single-tenant: one workspace in the database (no multi-user)
- Tokens encrypted with AES-256-GCM before persistence, the entity only handles encrypted tokens
- 3 distinct gateway ports (persistence, Linear API, encryption)
- No automatic refresh via guard/middleware (YAGNI) — explicit endpoint
- Scopes stored as delimited string (SQLite constraint)
- Requires env vars: `LINEAR_CLIENT_ID`, `LINEAR_CLIENT_SECRET`, `ENCRYPTION_KEY`
