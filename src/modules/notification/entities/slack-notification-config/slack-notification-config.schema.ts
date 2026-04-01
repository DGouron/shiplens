import { z } from 'zod';

const SLACK_WEBHOOK_URL_PATTERN = /^https:\/\/hooks\.slack\.com\/services\/.+/;

export const slackNotificationConfigPropsSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().min(1),
  webhookUrl: z.string().regex(SLACK_WEBHOOK_URL_PATTERN),
  enabled: z.boolean(),
});

export type SlackNotificationConfigProps = z.infer<
  typeof slackNotificationConfigPropsSchema
>;
