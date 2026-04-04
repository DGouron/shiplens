# Event Storming — Synchronization

*Date: 2026-04-04*
*Scope: Import and update of Linear data (teams, issues, cycles, transitions, webhooks)*

## Domain Events (Orange)

| Event | Trigger | Source File |
|-------|---------|-------------|
| TeamSelectionSaved | SaveTeamSelection | `src/modules/synchronization/usecases/save-team-selection.usecase.ts` |
| ReferenceDataSynchronized | SyncReferenceData | `src/modules/synchronization/usecases/sync-reference-data.usecase.ts` |
| IssueDataSynchronized | SyncIssueData | `src/modules/synchronization/usecases/sync-issue-data.usecase.ts` |
| SyncProgressCompleted | SyncIssueData (end) | `src/modules/synchronization/usecases/sync-issue-data.usecase.ts` (l.86-93) |
| SyncProgressFailed | SyncIssueData (error) | `src/modules/synchronization/entities/sync-progress/sync-progress.ts` (l.59-63) |
| WebhookEventProcessed | ProcessWebhookEvent | `src/modules/synchronization/usecases/process-webhook-event.usecase.ts` (l.97-99) |
| WebhookEventFailed | ProcessWebhookEvent (max retries) | `src/modules/synchronization/usecases/process-webhook-event.usecase.ts` (l.103-105) |
| IssueUpserted | ProcessWebhookEvent (Issue create/update) | `src/modules/synchronization/usecases/process-webhook-event.usecase.ts` (l.152) |
| IssueSoftDeleted | ProcessWebhookEvent (Issue remove) | `src/modules/synchronization/usecases/process-webhook-event.usecase.ts` (l.132-134) |
| CycleUpserted | ProcessWebhookEvent (Cycle create/update) | `src/modules/synchronization/usecases/process-webhook-event.usecase.ts` (l.170-171) |
| StateTransitionRecorded | ProcessWebhookEvent (Issue update with status change) | `src/modules/synchronization/usecases/process-webhook-event.usecase.ts` (l.154-166) |

## Commands (Blue)

| Command | Actor | Produced Event | Source File |
|---------|-------|----------------|-------------|
| ListAvailableTeams | user | — (read) | `src/modules/synchronization/usecases/list-available-teams.usecase.ts` |
| SaveTeamSelection | user | TeamSelectionSaved | `src/modules/synchronization/usecases/save-team-selection.usecase.ts` |
| GetTeamSelection | user | — (read) | `src/modules/synchronization/usecases/get-team-selection.usecase.ts` |
| SyncReferenceData | user | ReferenceDataSynchronized | `src/modules/synchronization/usecases/sync-reference-data.usecase.ts` |
| SyncIssueData | user | IssueDataSynchronized | `src/modules/synchronization/usecases/sync-issue-data.usecase.ts` |
| GetSyncProgress | user | — (read) | `src/modules/synchronization/usecases/get-sync-progress.usecase.ts` |
| ProcessWebhookEvent | system (Linear) | WebhookEventProcessed / WebhookEventFailed | `src/modules/synchronization/usecases/process-webhook-event.usecase.ts` |

## Entities (Yellow)

| Entity | Responsibility | Files |
|--------|---------------|-------|
| TeamSelection | Selection of teams and projects to synchronize | `src/modules/synchronization/entities/team-selection/team-selection.ts` |
| SyncProgress | Initial synchronization progress per team (status, cursor, percentage) | `src/modules/synchronization/entities/sync-progress/sync-progress.ts` |
| WebhookEvent | Linear event received via webhook — signature, deduplication, retry, routing | `src/modules/synchronization/entities/webhook-event/webhook-event.ts` |

## Policies and Business Rules (Purple)

| Rule | Description | Source File |
|------|-------------|-------------|
| WebhookSignatureVerification | Each webhook must be verified via HMAC SHA-256 before processing | `src/modules/synchronization/entities/webhook-event/webhook-event.ts` (l.41-58) |
| WebhookIdempotency | An already processed webhook (same deliveryId) is silently ignored | `src/modules/synchronization/usecases/process-webhook-event.usecase.ts` (l.52-55) |
| SupportedEventsFilter | Only `create:Issue`, `update:Issue`, `remove:Issue`, `create:Cycle`, `update:Cycle`, `create:Comment` events are processed | `src/modules/synchronization/entities/webhook-event/webhook-event.ts` (l.14-21) |
| TeamFilterOnWebhook | A webhook is ignored if the team is not in the selection | `src/modules/synchronization/usecases/process-webhook-event.usecase.ts` (l.64-69) |
| MaxRetryPolicy | Maximum 3 processing attempts before marking as failed | `src/modules/synchronization/usecases/process-webhook-event.usecase.ts` (l.30) |
| SyncResumability | If the previous sync failed, it can resume from the last cursor | `src/modules/synchronization/usecases/sync-issue-data.usecase.ts` (l.53-56) |
| MinimumOneTeam | At least one team must be selected | `src/modules/synchronization/entities/team-selection/team-selection.errors.ts` |
| WorkspaceRequired | Workspace connection is a prerequisite for all operations | `src/modules/synchronization/entities/team-selection/team-selection.errors.ts` |

## Presenters (Green)

| Presenter | Exposed Data | File |
|-----------|-------------|------|
| AvailableTeamsPresenter | List of workspace Linear teams/projects | `src/modules/synchronization/interface-adapters/presenters/available-teams.presenter.ts` |
| TeamSelectionPresenter | Current team selection | `src/modules/synchronization/interface-adapters/presenters/team-selection.presenter.ts` |
| SyncProgressPresenter | Progress percentage, sync status | `src/modules/synchronization/interface-adapters/presenters/sync-progress.presenter.ts` |

## Gateways and External Systems (White)

| System | Interaction | Gateway |
|--------|------------|---------|
| Linear API (GraphQL) | Read teams, paginated issues, cycles, transition history | `linear-team.gateway.ts`, `linear-issue-data.gateway.ts`, `linear-reference-data.gateway.ts` |
| Prisma (SQLite) | Persistence of issues, cycles, transitions, selections, webhook events, sync progress | `issue-data.in-prisma.gateway.ts`, `team-selection.in-prisma.gateway.ts`, etc. |
| Identity (NestJS module) | Access to decrypted access token for calling Linear | via `LinearWorkspaceConnectionGateway` and `TokenEncryptionGateway` exported by IdentityModule |

## Relationships with Other Bounded Contexts

| Related BC | Pattern (Vaughn Vernon) | Direction | Detail |
|-----------|------------------------|-----------|--------|
| Identity | Customer-Supplier | Identity (Supplier) → Synchronization (Customer) | Consumes `LinearWorkspaceConnectionGateway` and `TokenEncryptionGateway` to obtain the Linear access token. Strong dependency — no sync operation without a connection. |
| Analytics | Published Language (via DB) | Synchronization (Upstream) → Analytics (Downstream) | Synchronized data (issues, cycles, transitions) is read directly from Prisma by Analytics gateways. No code coupling, but coupling on the database schema. |
| Notification | Published Language (via DB) | Synchronization (Upstream) → Notification (Downstream) | Blocked issue alerts use data from the Linear sync. |

## Ubiquitous Language

| Term | Definition in this BC | Equivalent term elsewhere |
|------|----------------------|---------------------------|
| Initial synchronization | Full paginated import of all issues/cycles/transitions for a team | — |
| Incremental sync | Update via Linear webhooks — event by event | — |
| Webhook Event | Notification sent by Linear when data changes | Event (ubiquitous language) |
| Isolated event | Webhook marked as `failed` after 3 attempts | — |
| Reference Data | Team reference data (statuses, labels, members) | — |
| Cursor | Pagination position for sync resumption | — |

## Hot Spots (Pink)

| Problem | Severity | Detail |
|---------|----------|--------|
| Strong coupling on Identity types | medium | Sync usecases directly import Identity gateway ports (`@modules/identity/entities/...`). This is compliant since they are NestJS module exports, but the number of affected usecases (4 out of 7) shows significant dependency. |
| No soft delete for cycles | low | The `remove:Issue` webhook does a soft delete, but there is no equivalent for cycles. If a cycle is deleted in Linear, it remains in Shiplens. |
| No `Comment update/remove` handling | low | Only `create:Comment` is supported. Comment modifications and deletions in Linear are not propagated. |
