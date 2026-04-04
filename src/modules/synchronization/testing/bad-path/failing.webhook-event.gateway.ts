import { GatewayError } from '@shared/foundation/gateway-error.js';
import { WebhookEventGateway } from '../../entities/webhook-event/webhook-event.gateway.js';
import { type WebhookEvent } from '../../entities/webhook-event/webhook-event.js';

export class FailingWebhookEventGateway extends WebhookEventGateway {
  async hasBeenProcessed(_deliveryId: string): Promise<boolean> {
    throw new GatewayError('WebhookEventGateway failure');
  }

  async save(_event: WebhookEvent): Promise<void> {
    throw new GatewayError('WebhookEventGateway failure');
  }
}
