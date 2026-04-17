# Event Storming Big Picture — Shiplens

*Created: 2026-04-04*
*Last updated: 2026-04-17*

## Overview

Shiplens is a team analytics tool connected to Linear. It synchronizes work data (issues, cycles, transitions), calculates sprint metrics, detects blockers, generates AI reports, and notifies via Slack.

The domain is split into **5 Bounded Contexts**:

| Bounded Context | Responsibility | Main Entities | Use Cases |
|-----------------|---------------|---------------|-----------|
| **Identity** | Linear workspace connection (OAuth2, API Key) | LinearWorkspaceConnection | 5 |
| **Synchronization** | Import and update of Linear data | TeamSelection, SyncProgress, WebhookEvent | 7 |
| **Analytics** | Metrics, alerts, predictions, AI reports | CycleSnapshot, SprintReport, BlockedIssueAlert, StatusThreshold, BottleneckAnalysis, EstimationAccuracy, DurationPrediction | 18 |
| **Audit** | Team audit rules and Packmind integration | AuditRule, ChecklistItem, PackmindPractice | 3 |
| **Notification** | Slack notifications (reports, alerts) | SlackNotificationConfig, TeamAlertChannel | 4 |

## Context Map

```
┌─────────────┐     Customer-Supplier     ┌────────────────────┐
│  Identity    │ ─────────────────────────→│  Synchronization   │
│  (Supplier)  │  LinearWorkspaceConn.GW   │  (Customer)        │
│              │  TokenEncryptionGW         │                    │
└─────────────┘                            └────────────────────┘
                                                    │
                                                    │ Published Language
                                                    │ (via DB schema)
                                                    ▼
┌─────────────┐     Customer-Supplier     ┌────────────────────┐
│  Audit       │ ────────────────────────→│  Analytics         │
│  (Supplier)  │  AuditRuleGW              │  (Customer)        │
│              │  ChecklistItemGW           │                    │
└─────────────┘  EvaluateAuditRuleUC       └────────────────────┘
                                                    │
                                                    │ Customer-Supplier
                                                    │ SprintReportGW
                                                    ▼
                                           ┌────────────────────┐
                                           │  Notification      │
                                           │  (Customer)        │
                                           └────────────────────┘
```

## Bounded Context Relationships (Vaughn Vernon)

| Relationship | Pattern | Upstream (Supplier) | Downstream (Customer) | Mechanism |
|-------------|---------|---------------------|-----------------------|-----------|
| Identity → Synchronization | **Customer-Supplier** | Identity | Synchronization | IdentityModule exports `LinearWorkspaceConnectionGateway` and `TokenEncryptionGateway`. SynchronizationModule imports them via NestJS DI. 4 out of 7 Sync usecases depend on these ports. |
| Synchronization → Analytics | **Published Language (via DB)** | Synchronization | Analytics | No code coupling. Analytics reads synchronized data directly via its own Prisma gateways. The database schema acts as the implicit contract. |
| Audit → Analytics | **Customer-Supplier** | Audit | Analytics | AuditModule exports 5 providers. AnalyticsModule imports AuditModule. `GenerateSprintReportUsecase` directly accesses Audit module internal files (relative import `../../audit/entities/...`). |
| Analytics → Notification | **Customer-Supplier** | Analytics | Notification | AnalyticsModule exports `SprintReportGateway`. NotificationModule imports AnalyticsModule to send reports on Slack. |
| Synchronization → Notification | **Published Language (via DB)** | Synchronization | Notification | Synchronized issue data feeds blocked issue alerts in Notification via Prisma gateways. |

## Shared Kernel

The Shared Kernel (`src/shared/`) provides cross-cutting technical abstractions:

| Layer | Content |
|-------|---------|
| `shared/foundation/` | `Usecase<P, R>`, `Presenter<I, O>`, `BusinessRuleViolation`, `ApplicationRuleViolation`, `GatewayError`, `createGuard()`, `EntityBuilder<P, E>` |
| `shared/domain/` | **Empty** — no shared business concepts yet |
| `shared/infrastructure/prisma/` | `PrismaService`, `PrismaModule` (global) |

The `shared/domain/` directory is empty. Types currently shared between BCs are shared via NestJS module exports, not through an explicit shared kernel. This is a point of attention: the `CycleMetrics` type (defined in Audit, built in Analytics) would be a good candidate for `shared/domain/`.

## Main Flows (narrative)

### 1. Onboarding — Connection and initial synchronization

```
[User] ──ConnectLinearWorkspace──→ [Identity]
         LinearWorkspaceConnected
[User] ──ListAvailableTeams──→ [Synchronization] ──getTeams──→ [Linear API]
[User] ──SaveTeamSelection──→ [Synchronization]
         TeamSelectionSaved
[User] ──SyncReferenceData──→ [Synchronization] ──getTeamReferenceData──→ [Linear API]
         ReferenceDataSynchronized
[User] ──SyncIssueData──→ [Synchronization] ──getIssuesPage (paginated)──→ [Linear API]
         IssueDataSynchronized, SyncProgressCompleted
```

### 2. Incremental sync — Linear webhooks

```
[Linear] ──webhook──→ [Synchronization.WebhookController]
         ──verifySignature──→ ProcessWebhookEvent
         ──routeEvent──→ IssueUpserted / CycleUpserted / StateTransitionRecorded
         WebhookEventProcessed
```

### 3. Analysis — Metrics and reports

```
[User] ──CalculateCycleMetrics──→ [Analytics]
         CycleMetricsCalculated
[User] ──GenerateSprintReport──→ [Analytics] ──evaluateAuditRules──→ [Audit]
         ──generate──→ [AI Provider]
         SprintReportGenerated
```

### 4. Alerting — Detection and notification

```
[Scheduler] ──DetectBlockedIssues──→ [Analytics]
             BlockedIssueAlertCreated / BlockedIssueAlertResolved
[Scheduler] ──AlertBlockedIssuesOnSlack──→ [Notification] ──sendAlert──→ [Slack]
             BlockedIssueAlertSentOnSlack
```

### 5. Notification — Report on Slack

```
[User] ──SendReportOnSlack──→ [Notification] ──findById──→ [Analytics.SprintReportGateway]
         ──sendReport──→ [Slack]
         SprintReportSentOnSlack
```

## Domain Events Inventory

| # | Event | BC | Type |
|---|-------|----|------|
| 1 | LinearWorkspaceConnected | Identity | Command |
| 2 | LinearWorkspaceDisconnected | Identity | Command |
| 3 | LinearSessionRefreshed | Identity | Command |
| 4 | LinearConnectionRefused | Identity | Error |
| 5 | LinearSessionExpired | Identity | Error |
| 6 | TeamSelectionSaved | Synchronization | Command |
| 7 | ReferenceDataSynchronized | Synchronization | Command |
| 8 | IssueDataSynchronized | Synchronization | Command |
| 9 | SyncProgressCompleted | Synchronization | Lifecycle |
| 10 | SyncProgressFailed | Synchronization | Lifecycle |
| 11 | WebhookEventProcessed | Synchronization | System |
| 12 | WebhookEventFailed | Synchronization | System |
| 13 | IssueUpserted | Synchronization | System |
| 14 | IssueSoftDeleted | Synchronization | System |
| 15 | CycleUpserted | Synchronization | System |
| 16 | StateTransitionRecorded | Synchronization | System |
| 17 | CycleMetricsCalculated | Analytics | Command |
| 18 | SprintReportGenerated | Analytics | Command |
| 19 | BlockedIssuesDetected | Analytics | System |
| 20 | BlockedIssueAlertCreated | Analytics | System |
| 21 | BlockedIssueAlertResolved | Analytics | System |
| 22 | StatusThresholdUpdated | Analytics | Command |
| 23 | BottleneckAnalysisCompleted | Analytics | Command |
| 24 | EstimationAccuracyCalculated | Analytics | Command |
| 25 | IssueDurationPredicted | Analytics | Command |
| 26 | WorkspaceDashboardGenerated | Analytics | Command |
| 27 | MemberDigestGenerated | Analytics | Command |
| 28 | TeamExcludedStatusesUpdated | Analytics | Command |
| 29 | AuditRuleCreated | Audit | Command |
| 30 | AuditRuleEvaluated | Audit | Command |
| 31 | PackmindRulesSynchronized | Audit | Command |
| 32 | PackmindRuleSyncedFromCache | Audit | Fallback |
| 33 | SlackWebhookConfigured | Notification | Command |
| 34 | TeamAlertChannelConfigured | Notification | Command |
| 35 | SprintReportSentOnSlack | Notification | Command |
| 36 | BlockedIssueAlertSentOnSlack | Notification | System |

## Business Rules Inventory

| # | Rule | BC | Severity |
|---|------|----|----------|
| 1 | RequiredScopes (read, write, issues:create) | Identity | blocking |
| 2 | SingleConnectionPolicy | Identity | blocking |
| 3 | TokenRevocationOnDisconnect | Identity | blocking |
| 4 | WebhookSignatureVerification (HMAC SHA-256) | Synchronization | blocking |
| 5 | WebhookIdempotency (unique deliveryId) | Synchronization | silent |
| 6 | SupportedEventsFilter (6 types) | Synchronization | silent |
| 7 | MaxRetryPolicy (3 attempts) | Synchronization | degraded |
| 8 | SyncResumability (cursor) | Synchronization | resilience |
| 9 | CycleCompletionRequired | Analytics | blocking |
| 10 | ThresholdSeverityEscalation (warning x1, critical x2) | Analytics | business |
| 11 | DefaultThresholds (48h/48h/72h) | Analytics | business |
| 12 | EstimationClassification (>2.0 over, <0.5 under) | Analytics | business |
| 13 | MinimumCyclesForPrediction (2) | Analytics | blocking |
| 14 | MinimumHistoryForTrend (3) | Analytics | blocking |
| 15 | SupportedLanguages (FR, EN) | Analytics | blocking |
| 16 | ExcludedStatusesAutoResolve | Analytics | business |
| 17 | UniqueIdentifier (audit rules) | Audit | blocking |
| 18 | SeverityToOutcomeMapping | Audit | business |
| 19 | PackmindCacheFallback | Audit | resilience |
| 20 | MeasurableVsQualitative | Audit | business |
| 21 | DailyThrottling (1 alert/issue/day) | Notification | anti-noise |
| 22 | TestMessageOnConfiguration | Notification | verification |
| 23 | DisabledNotificationSkip | Notification | silent |

## Global Hot Spots (Pink)

| # | Problem | BC | Severity | Detail |
|---|----------|----|----------|--------|
| 1 | **Analytics module too large** | Analytics | high | 18 usecases, 7 entities, 15+ gateways. This BC does the work of 4-5 subdomains (Metrics, Reporting, Alerting, Estimation, Dashboard). Splitting would improve cohesion. |
| 2 | **Direct import Analytics → Audit** | Analytics/Audit | high | `GenerateSprintReportUsecase` imports internal files from the Audit module via a relative path (`../../audit/entities/...`). Violates BC boundary even though the NestJS module declares it. A port in Analytics or a type in `shared/domain/` would be cleaner. |
| 3 | **`CycleMetrics`: implicitly shared type** | Audit/Analytics | medium | Defined in Audit, built in Analytics. Natural candidate for `shared/domain/`. |
| 4 | **Heterogeneous persistence (filesystem vs Prisma)** | Audit, Analytics | medium | Audit rules and team settings use the filesystem. Everything else uses Prisma. Potential issue in multi-instance deployments. |
| 5 | **Two distinct Slack configs** | Notification | medium | `SlackNotificationConfig` (reports) and `TeamAlertChannel` (alerts) each have their own webhook. Potentially confusing configuration duplication. |
| 6 | **No automatic session refresh** | Identity | medium | The refresh token is not called automatically. Risk of unexpected `LinearSessionExpiredError`. |
| 7 | **`shared/domain/` is empty** | Global | low | No shared business concept is explicitly placed in the Shared Kernel. Shared types transit via NestJS module imports. |

## Detailed Documents per BC

- [Identity](event-storming/identity.md)
- [Synchronization](event-storming/synchronization.md)
- [Analytics](event-storming/analytics.md)
- [Audit](event-storming/audit.md)
- [Notification](event-storming/notification.md)


## Addendum 2026-04-17 — Analytics BC

The Analytics BC now spans both workspaces with the same ubiquitous language. New elements worth surfacing in the global picture:

### New client-side domain events
- `TeamSelected` — user clicks a team card on the dashboard; the selected team becomes the anchor for all future right-side widgets (top projects/epics/assignees/themes).
- `TeamSelectionRestored` — dashboard mount reads the persisted selection from `localStorage` and applies it (with stale-fallback).

### New cross-BC relationship
- **Identity → Analytics (backend)** — `GetWorkspaceDashboardUsecase` now depends on `LinearWorkspaceConnectionGateway` to expose `workspaceId` in the dashboard DTO. Customer-Supplier pattern. Needed so the frontend can scope its `localStorage` key per workspace without an extra round-trip.

### New hot spot
- `useDashboard` carries two parallel selection states (`selectionOverride` + `persistedTeamId`). Works for one consumer; flagged to revisit when the second downstream widget (top cycle projects, etc.) lands.

### Glossary additions
- `Workspace-scoped persistence`, `Known statuses`, `Workflow status tag`, `Source badge` — see `docs/ddd/ubiquitous-language.md`.


## Session History

| Date | Mode | Scope | Contributor |
|------|------|-------|-------------|
| 2026-04-04 | Global audit | 5 BCs (Identity, Synchronization, Analytics, Audit, Notification) | Event Storming Big Picture |
| 2026-04-17 | Target | Analytics BC re-audit — front + back unified, team-selection feature, workflow-config UI, dashboard `workspaceId` | Event Storming (analytics) |
