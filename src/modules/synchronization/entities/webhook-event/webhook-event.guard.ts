import { createGuard } from '@shared/foundation/guard/guard.js';
import { webhookEventPropsSchema, type WebhookEventProps } from './webhook-event.schema.js';

export const webhookEventGuard = createGuard<WebhookEventProps>(
  webhookEventPropsSchema,
  'WebhookEvent',
);
