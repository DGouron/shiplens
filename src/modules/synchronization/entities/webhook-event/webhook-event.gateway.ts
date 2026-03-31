import { type WebhookEvent } from './webhook-event.js';

export abstract class WebhookEventGateway {
  abstract hasBeenProcessed(deliveryId: string): Promise<boolean>;
  abstract save(event: WebhookEvent): Promise<void>;
}
