import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { SlackMessengerGateway } from '../entities/slack-notification-config/slack-messenger.gateway.js';
import { BlockedIssueAlertDataGateway } from '../entities/team-alert-channel/blocked-issue-alert-data.gateway.js';
import { SlackAlertLogGateway } from '../entities/team-alert-channel/slack-alert-log.gateway.js';
import { SlackAlertDeliveryFailedError } from '../entities/team-alert-channel/team-alert-channel.errors.js';
import { TeamAlertChannelGateway } from '../entities/team-alert-channel/team-alert-channel.gateway.js';

@Injectable()
export class AlertBlockedIssuesOnSlackUsecase implements Usecase<void, void> {
  constructor(
    private readonly channelGateway: TeamAlertChannelGateway,
    private readonly messengerGateway: SlackMessengerGateway,
    private readonly alertDataGateway: BlockedIssueAlertDataGateway,
    private readonly alertLogGateway: SlackAlertLogGateway,
  ) {}

  async execute(): Promise<void> {
    const blockedIssues = await this.alertDataGateway.findActiveWithContext();

    const today = new Date().toISOString().slice(0, 10);

    for (const issue of blockedIssues) {
      const channel = await this.channelGateway.findByTeamId(issue.teamId);
      if (!channel) continue;

      const alreadySent = await this.alertLogGateway.wasAlertSentToday(
        issue.issueExternalId,
        today,
      );
      if (alreadySent) continue;

      try {
        await this.messengerGateway.sendAlert({
          webhookUrl: channel.webhookUrl,
          issueTitle: issue.issueTitle,
          statusName: issue.statusName,
          durationHours: issue.durationHours,
          assigneeName: issue.assigneeName,
          issueUrl: `https://linear.app/issue/${issue.issueUuid}`,
          severity: issue.severity,
        });
      } catch {
        throw new SlackAlertDeliveryFailedError();
      }

      await this.alertLogGateway.recordAlertSent(
        issue.issueExternalId,
        new Date().toISOString(),
      );
    }
  }
}
