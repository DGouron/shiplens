import { createGuard } from '@shared/foundation/guard/guard.js';
import { slackNotificationConfigPropsSchema } from './slack-notification-config.schema.js';

export const slackNotificationConfigGuard = createGuard(
  slackNotificationConfigPropsSchema,
  'SlackNotificationConfig',
);
