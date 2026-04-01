import { Injectable } from '@nestjs/common';
import {
  SlackMessengerGateway,
  type SendReportParams,
} from '../../entities/slack-notification-config/slack-messenger.gateway.js';

@Injectable()
export class SlackMessengerInHttpGateway extends SlackMessengerGateway {
  async sendReport(params: SendReportParams): Promise<void> {
    const payload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Rapport de sprint : ${params.cycleName}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: params.reportSummary,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `<${params.reportLink}|Voir le rapport complet>`,
          },
        },
      ],
    };

    const response = await fetch(params.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack API responded with status ${response.status}`);
    }
  }

  async sendTestMessage(webhookUrl: string): Promise<void> {
    const payload = {
      text: 'Shiplens : webhook configuré avec succès.',
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack API responded with status ${response.status}`);
    }
  }
}
