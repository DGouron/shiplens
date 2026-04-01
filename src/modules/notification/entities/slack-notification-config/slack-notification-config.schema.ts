import { z } from 'zod';

export const slackNotificationConfigPropsSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().min(1),
  webhookUrl: z.string().url().startsWith('https://hooks.slack.com/'),
  enabled: z.boolean(),
});

export type SlackNotificationConfigProps = z.infer<typeof slackNotificationConfigPropsSchema>;
