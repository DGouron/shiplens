import { Injectable } from '@nestjs/common';
import {
  SlackMessengerGateway,
  type SendReportParams,
  type SendAlertParams,
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

  async sendAlert(params: SendAlertParams): Promise<void> {
    const severityEmoji = params.severity === 'critical' ? ':red_circle:' : ':warning:';
    const assigneeText = params.assigneeName
      ? `*Assigné à :* ${params.assigneeName}`
      : '_Aucun responsable assigné_';

    const payload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${severityEmoji} Issue bloquée`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*<${params.issueUrl}|${params.issueTitle}>*\n*Statut :* ${params.statusName} depuis ${params.durationHours}h\n${assigneeText}`,
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
