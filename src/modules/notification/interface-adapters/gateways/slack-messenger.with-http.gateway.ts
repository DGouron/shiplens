import { Injectable } from '@nestjs/common';
import { SlackMessengerGateway, type SlackMessage } from '../../entities/slack-notification-config/slack-messenger.gateway.js';
import { GatewayError } from '@shared/foundation/gateway-error.js';

@Injectable()
export class SlackMessengerWithHttpGateway extends SlackMessengerGateway {
  async send(webhookUrl: string, message: SlackMessage): Promise<void> {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new GatewayError(
        `Slack webhook returned ${response.status}: ${response.statusText}`,
      );
    }
  }
}
