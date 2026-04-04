# Event Storming — Identity

*Date: 2026-04-04*
*Scope: Management of the connection between Shiplens and a Linear workspace (OAuth2, API Key, session)*

## Domain Events (Orange)

| Event | Trigger | Source File |
|-------|---------|-------------|
| LinearWorkspaceConnected | ConnectLinearWorkspace / ConnectWithApiKey | `src/modules/identity/usecases/connect-linear-workspace.usecase.ts` |
| LinearWorkspaceDisconnected | DisconnectLinearWorkspace | `src/modules/identity/usecases/disconnect-linear-workspace.usecase.ts` |
| LinearSessionRefreshed | RefreshLinearSession | `src/modules/identity/usecases/refresh-linear-session.usecase.ts` |
| LinearConnectionRefused | ConnectLinearWorkspace (exchange code failure) | `src/modules/identity/usecases/connect-linear-workspace.usecase.ts` |
| LinearSessionExpired | RefreshLinearSession (refresh token failure) | `src/modules/identity/usecases/refresh-linear-session.usecase.ts` |

## Commands (Blue)

| Command | Actor | Produced Event | Source File |
|---------|-------|----------------|-------------|
| ConnectLinearWorkspace | user | LinearWorkspaceConnected | `src/modules/identity/usecases/connect-linear-workspace.usecase.ts` |
| ConnectWithApiKey | system (bootstrap) | LinearWorkspaceConnected | `src/modules/identity/usecases/connect-with-api-key.usecase.ts` |
| DisconnectLinearWorkspace | user | LinearWorkspaceDisconnected | `src/modules/identity/usecases/disconnect-linear-workspace.usecase.ts` |
| GetConnectionStatus | user | — (read) | `src/modules/identity/usecases/get-connection-status.usecase.ts` |
| RefreshLinearSession | user | LinearSessionRefreshed | `src/modules/identity/usecases/refresh-linear-session.usecase.ts` |

## Entities (Yellow)

| Entity | Responsibility | Files |
|--------|---------------|-------|
| LinearWorkspaceConnection | Represents the active link between Shiplens and a Linear workspace. Holds encrypted tokens, scopes, status. | `src/modules/identity/entities/linear-workspace-connection/linear-workspace-connection.ts`, `linear-workspace-connection.schema.ts` |

## Policies and Business Rules (Purple)

| Rule | Description | Source File |
|------|-------------|-------------|
| RequiredScopes | Scopes `read`, `write`, `issues:create` are mandatory for OAuth2 connection | `src/modules/identity/usecases/connect-linear-workspace.usecase.ts` (l.20-21) |
| SingleConnectionPolicy | Only one active connection at a time — existing one is deleted before creating a new one | `src/modules/identity/usecases/connect-linear-workspace.usecase.ts` (l.61-63) |
| TokenRevocationOnDisconnect | The access token is revoked on the Linear side upon disconnection | `src/modules/identity/usecases/disconnect-linear-workspace.usecase.ts` (l.22) |
| ApiKeyValidation | The API key must allow retrieving workspace info, otherwise it is invalid | `src/modules/identity/usecases/connect-with-api-key.usecase.ts` (l.29-35) |

## Presenters (Green)

| Presenter | Exposed Data | File |
|-----------|-------------|------|
| ConnectionStatusPresenter | Connection status, workspace name, connection date | `src/modules/identity/interface-adapters/presenters/connection-status.presenter.ts` |

## Gateways and External Systems (White)

| System | Interaction | Gateway |
|--------|------------|---------|
| Linear API (OAuth2) | Exchange code, refresh token, revoke token, workspace info | `src/modules/identity/entities/linear-workspace-connection/linear-api.gateway.ts` |
| Prisma (SQLite) | Workspace connection persistence | `src/modules/identity/interface-adapters/gateways/linear-workspace-connection.in-prisma.gateway.ts` |
| Crypto (Node) | Token encryption/decryption | `src/modules/identity/entities/linear-workspace-connection/token-encryption.gateway.ts` |

## Relationships with Other Bounded Contexts

| Related BC | Pattern (Vaughn Vernon) | Direction | Detail |
|-----------|------------------------|-----------|--------|
| Synchronization | Customer-Supplier | Identity (Supplier) → Synchronization (Customer) | Synchronization consumes `LinearWorkspaceConnectionGateway` and `TokenEncryptionGateway` exported by IdentityModule to access tokens and verify connection |

## Ubiquitous Language

| Term | Definition in this BC | Equivalent term elsewhere |
|------|----------------------|---------------------------|
| Session | Active link between Shiplens and the Linear workspace, materialized by encrypted tokens | — |
| Disconnection | Token revocation + local connection deletion | — |
| Workspace | Linear organization's workspace | Used everywhere |
| Scopes | OAuth2 permissions granted by Linear | — |

## Hot Spots (Pink)

| Problem | Severity | Detail |
|---------|----------|--------|
| No automatic token refresh mechanism | medium | `RefreshLinearSession` is called manually — no scheduler detects imminent expiration. The system may encounter an unexpected `LinearSessionExpiredError` during sync. |
| `onApplicationBootstrap` coupled to the module | low | The Identity module auto-connects via API Key at startup if the environment variable is present — bootstrap logic within the module itself. |
