# Send sprint report on Slack

## Status: implemented

## Context
The tech lead wants to automatically receive the sprint report in their dedicated Slack channel, without having to manually fetch it from the dashboard. This ensures the whole team and stakeholders see the summary at the right time, with no extra effort.

## Rules
- Slack sending requires a webhook configured for the target channel
- The report is sent automatically at the close of each cycle
- The Slack message contains a formatted summary with rich formatting and a link to the full report in the dashboard
- Each team can independently enable or disable Slack notification
- A report can only be sent if it has been generated beforehand
- The webhook is validated during configuration to avoid silently failed sends

## Scenarios
- nominal send: {cycle closed, report generated, webhook configured, notification enabled} -> message sent on Slack + formatted summary + link to full report
- notification disabled by team: {cycle closed, report generated, webhook configured, notification disabled} -> no send
- webhook not configured: {cycle closed, report generated, no webhook} -> reject "No Slack webhook is configured for this team. Please add one in the notification settings."
- invalid webhook: {malformed webhook during configuration} -> reject "The Slack webhook URL is invalid. Please check the format."
- report not generated: {cycle closed, no report generated, webhook configured} -> reject "The sprint report has not been generated yet. Cannot send the notification."
- send failed on Slack side: {cycle closed, report generated, webhook configured, Slack unreachable} -> reject "Sending to Slack failed. Please check the webhook configuration or try again later."
- webhook configuration: {user enters a valid webhook URL} -> webhook saved + test message sent to the channel
- webhook modification: {webhook already configured, new URL entered} -> old webhook replaced + test message sent to the new channel

## Out of scope
- Sending to anything other than Slack (email, Teams, Discord)
- Customizing the Slack message content
- Sending to multiple Slack channels per team
- Scheduling the send at a specific time (sending occurs at cycle close)
- Manual resend of an already sent report

## Glossary
| Term | Definition |
|------|------------|
| Slack webhook | Destination URL allowing to send a message to a Slack channel |
| Slack channel | Discussion space in Slack where the report will be published |
| Cycle | Team work period (sprint) whose report summarizes the activity |
| Formatted summary | Condensed version of the report adapted for reading in Slack with rich formatting |
| Notification | Automatic message sent on Slack at the close of a cycle |

## Implementation

- **Bounded Context**: `notification` (new BC)
- **Entity**: `SlackNotificationConfig` (id, teamId, webhookUrl, enabled)
- **Use Cases**: `ConfigureSlackWebhookUsecase`, `SendReportOnSlackUsecase`
- **Controller**: `SlackNotificationController`
- **Endpoints**: `POST /notifications/slack/configure`, `POST /notifications/slack/send`
- **Gateways**: `SlackNotificationConfigInPrismaGateway`, `SlackMessengerInHttpGateway`
- **Migration**: `20260401114500_add_slack_notification_config`
- **Cross-BC**: Read-only dependency on `SprintReportGateway` (analytics BC)
- **Decision**: Automatic sending at cycle close requires an event bus (out of scope). Sending is done via explicit endpoint.
