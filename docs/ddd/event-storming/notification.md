# Event Storming — Notification

*Date: 2026-04-04*
*Scope: Configuration and sending of Slack notifications (sprint reports, blocked issue alerts)*

## Domain Events (Orange)

| Event | Trigger | Source File |
|-------|---------|-------------|
| SlackWebhookConfigured | ConfigureSlackWebhook | `src/modules/notification/usecases/configure-slack-webhook.usecase.ts` |
| TeamAlertChannelConfigured | ConfigureTeamAlertChannel | `src/modules/notification/usecases/configure-team-alert-channel.usecase.ts` |
| SprintReportSentOnSlack | SendReportOnSlack | `src/modules/notification/usecases/send-report-on-slack.usecase.ts` |
| BlockedIssueAlertSentOnSlack | AlertBlockedIssuesOnSlack | `src/modules/notification/usecases/alert-blocked-issues-on-slack.usecase.ts` |

## Commands (Blue)

| Command | Actor | Produced Event | Source File |
|---------|-------|----------------|-------------|
| ConfigureSlackWebhook | user | SlackWebhookConfigured | `src/modules/notification/usecases/configure-slack-webhook.usecase.ts` |
| ConfigureTeamAlertChannel | user | TeamAlertChannelConfigured | `src/modules/notification/usecases/configure-team-alert-channel.usecase.ts` |
| SendReportOnSlack | user | SprintReportSentOnSlack | `src/modules/notification/usecases/send-report-on-slack.usecase.ts` |
| AlertBlockedIssuesOnSlack | system (hourly cron) | BlockedIssueAlertSentOnSlack | `src/modules/notification/usecases/alert-blocked-issues-on-slack.usecase.ts` |

## Entities (Yellow)

| Entity | Responsibility | Files |
|--------|---------------|-------|
| SlackNotificationConfig | Slack webhook configuration for sending sprint reports per team | `src/modules/notification/entities/slack-notification-config/slack-notification-config.ts` |
| TeamAlertChannel | Slack channel configuration for blocked issue alerts per team | `src/modules/notification/entities/team-alert-channel/team-alert-channel.ts` |

## Policies and Business Rules (Purple)

| Rule | Description | Source File |
|------|-------------|-------------|
| WebhookValidation | Slack webhook URL must be valid (Zod guard validation) | `src/modules/notification/usecases/configure-slack-webhook.usecase.ts` (l.25-31) |
| TestMessageOnConfiguration | A test message is sent when configuring a webhook to verify it works | `src/modules/notification/usecases/configure-slack-webhook.usecase.ts` (l.45) |
| DisabledNotificationSkip | If the config is disabled (`enabled: false`), sending is silently skipped | `src/modules/notification/usecases/send-report-on-slack.usecase.ts` (l.35-37) |
| ReportExistenceCheck | The report must exist before it can be sent | `src/modules/notification/usecases/send-report-on-slack.usecase.ts` (l.39-41) |
| DailyThrottling | One alert per issue per day to avoid noise | `src/modules/notification/usecases/alert-blocked-issues-on-slack.usecase.ts` (l.27-29) |
| ChannelRequired | If no channel is configured for the team, the alert is silently skipped | `src/modules/notification/usecases/alert-blocked-issues-on-slack.usecase.ts` (l.25) |

## Presenters (Green)

| Presenter | Exposed Data | File |
|-----------|-------------|------|
| SlackNotificationConfigPresenter | Slack configuration (webhookUrl, enabled, teamId) | `src/modules/notification/interface-adapters/presenters/slack-notification-config.presenter.ts` |

## Gateways and External Systems (White)

| System | Interaction | Gateway |
|--------|------------|---------|
| Slack Webhook API | Message sending (reports, alerts, test messages) | `src/modules/notification/entities/slack-notification-config/slack-messenger.gateway.ts` |
| Prisma (SQLite) | Webhook config, alert channels, send logs persistence | `slack-notification-config.in-prisma.gateway.ts`, `team-alert-channel.in-prisma.gateway.ts`, `slack-alert-log.in-prisma.gateway.ts` |
| Analytics (NestJS module) | Sprint report reading for Slack delivery | via `SprintReportGateway` exported by AnalyticsModule |

## Relationships with Other Bounded Contexts

| Related BC | Pattern (Vaughn Vernon) | Direction | Detail |
|-----------|------------------------|-----------|--------|
| Analytics | Customer-Supplier | Analytics (Supplier) → Notification (Customer) | Notification imports `AnalyticsModule` to consume `SprintReportGateway` (report reading for sending). Notification also reads blocked issue alerts via its own `BlockedIssueAlertDataGateway` that accesses data created by Analytics (DB-level coupling). |
| Synchronization | Published Language (via DB) | Synchronization (Upstream) → Notification (Downstream) | Issue data underlying alerts comes from the Linear sync. No direct code coupling. |

## Ubiquitous Language

| Term | Definition in this BC | Equivalent term elsewhere |
|------|----------------------|---------------------------|
| Slack webhook | Destination URL for sending messages to a Slack channel | — |
| Alert channel | Slack webhook dedicated to blocked issue alerts (distinct from report webhook) | Slack channel (ubiquitous language) |
| Notification | Automated message sent on Slack — sprint report or alert | — |
| Throttling | Limitation to one alert per issue per day | — |
| Test message | Message sent on configuration to verify the webhook works | — |

## Hot Spots (Pink)

| Problem | Severity | Detail |
|---------|----------|--------|
| Two separate Slack configs | medium | `SlackNotificationConfig` (for reports) and `TeamAlertChannel` (for alerts) are two distinct entities with different webhooks. A user might want to send everything to the same channel. Configuration duplication is a potential source of confusion. |
| Strong coupling Notification → Analytics via SprintReportGateway | medium | Notification directly accesses the `SprintReportGateway` port defined in the Analytics module. This is compliant with the NestJS Customer-Supplier pattern, but it means Notification knows the internal `SprintReport` model from Analytics. |
| No retry on Slack delivery | low | If sending fails, a `SlackDeliveryFailedError` or `SlackAlertDeliveryFailedError` is raised immediately. No retry mechanism like the Linear webhooks have. |
