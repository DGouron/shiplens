import { createGuard } from '@shared/foundation/guard/guard.js';
import {
  type WebhookEventProps,
  webhookEventPropsSchema,
} from './webhook-event.schema.js';

export const webhookEventGuard = createGuard<WebhookEventProps>(
  webhookEventPropsSchema,
  'WebhookEvent',
);
