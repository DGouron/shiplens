import {
  SlackMessengerGateway,
  type SendReportParams,
  type SendAlertParams,
} from '../../entities/slack-notification-config/slack-messenger.gateway.js';
import { GatewayError } from '@shared/foundation/gateway-error.js';

export class FailingSlackMessengerGateway extends SlackMessengerGateway {
  async sendReport(_params: SendReportParams): Promise<void> {
    throw new GatewayError('Slack API unreachable');
  }

  async sendAlert(_params: SendAlertParams): Promise<void> {
    throw new GatewayError('Slack API unreachable');
  }

  async sendTestMessage(_webhookUrl: string): Promise<void> {
    throw new GatewayError('Slack API unreachable');
  }
}
