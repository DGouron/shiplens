import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { SlackNotificationConfigGateway } from '../entities/slack-notification-config/slack-notification-config.gateway.js';
import { SlackMessengerGateway, type SlackBlock } from '../entities/slack-notification-config/slack-messenger.gateway.js';
import { SlackReportDataGateway, type SlackReportSummary } from '../entities/slack-notification-config/slack-report-data.gateway.js';
import { WebhookNotConfiguredError } from '../entities/slack-notification-config/slack-notification-config.errors.js';
import { ReportNotGeneratedError } from '../entities/slack-notification-config/slack-notification-config.errors.js';
import { SlackDeliveryFailedError } from '../entities/slack-notification-config/slack-notification-config.errors.js';

interface SendReportToSlackParams {
  cycleId: string;
  teamId: string;
}

@Injectable()
export class SendReportToSlackUsecase implements Usecase<SendReportToSlackParams, void> {
  constructor(
    private readonly configGateway: SlackNotificationConfigGateway,
    private readonly messengerGateway: SlackMessengerGateway,
    private readonly reportDataGateway: SlackReportDataGateway,
  ) {}

  async execute(params: SendReportToSlackParams): Promise<void> {
    const config = await this.configGateway.findByTeamId(params.teamId);
    if (!config) {
      throw new WebhookNotConfiguredError();
    }

    if (!config.enabled) {
      return;
    }

    const report = await this.reportDataGateway.findLatestByCycleAndTeam(
      params.cycleId,
      params.teamId,
    );
    if (!report) {
      throw new ReportNotGeneratedError();
    }

    const dashboardLink = `/analytics/teams/${params.teamId}/reports/${report.reportId}`;
    const blocks = this.buildBlocks(report, dashboardLink);

    try {
      await this.messengerGateway.send(config.webhookUrl, {
        text: `Rapport de sprint - ${report.cycleName}`,
        blocks,
      });
    } catch {
      throw new SlackDeliveryFailedError();
    }
  }

  private buildBlocks(report: SlackReportSummary, dashboardLink: string): SlackBlock[] {
    return [
      {
        type: 'header',
        text: { type: 'plain_text', text: `Rapport - ${report.cycleName}` },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Synthèse*\n${report.executiveSummary}` },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Points forts*\n${report.highlights}` },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Risques*\n${report.risks}` },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<${dashboardLink}|Voir le rapport complet>`,
        },
      },
    ];
  }
}
