import { WebhookEventGateway } from '../../entities/webhook-event/webhook-event.gateway.js';
import { type WebhookEvent } from '../../entities/webhook-event/webhook-event.js';

interface StoredEvent {
  deliveryId: string;
  status: string;
  attempts: number;
}

export class StubWebhookEventGateway extends WebhookEventGateway {
  events: Map<string, StoredEvent> = new Map();

  async hasBeenProcessed(deliveryId: string): Promise<boolean> {
    const event = this.events.get(deliveryId);
    return event?.status === 'processed';
  }

  async save(event: WebhookEvent): Promise<void> {
    this.events.set(event.deliveryId, {
      deliveryId: event.deliveryId,
      status: event.status,
      attempts: event.attempts,
    });
  }
}
