import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { SlackNotificationConfigGateway } from '../entities/slack-notification-config/slack-notification-config.gateway.js';
import { SlackMessengerGateway } from '../entities/slack-notification-config/slack-messenger.gateway.js';
import { SprintReportGateway } from '@modules/analytics/entities/sprint-report/sprint-report.gateway.js';
import {
  SlackWebhookNotConfiguredError,
  ReportNotGeneratedError,
  SlackDeliveryFailedError,
} from '../entities/slack-notification-config/slack-notification-config.errors.js';

interface SendReportOnSlackParams {
  teamId: string;
  reportId: string;
  reportLink: string;
}

@Injectable()
export class SendReportOnSlackUsecase
  implements Usecase<SendReportOnSlackParams, void>
{
  constructor(
    private readonly configGateway: SlackNotificationConfigGateway,
    private readonly messengerGateway: SlackMessengerGateway,
    private readonly reportGateway: SprintReportGateway,
  ) {}

  async execute(params: SendReportOnSlackParams): Promise<void> {
    const config = await this.configGateway.findByTeamId(params.teamId);

    if (!config) {
      throw new SlackWebhookNotConfiguredError();
    }

    if (!config.enabled) {
      return;
    }

    const report = await this.reportGateway.findById(params.reportId);

    if (!report) {
      throw new ReportNotGeneratedError();
    }

    try {
      await this.messengerGateway.sendReport({
        webhookUrl: config.webhookUrl,
        reportSummary: report.executiveSummary,
        reportLink: params.reportLink,
        cycleName: report.cycleName,
      });
    } catch {
      throw new SlackDeliveryFailedError();
    }
  }
}
