import { z } from 'zod';

const SLACK_WEBHOOK_URL_PATTERN = /^https:\/\/hooks\.slack\.com\/services\/.+/;

export const teamAlertChannelPropsSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().min(1),
  webhookUrl: z.string().regex(SLACK_WEBHOOK_URL_PATTERN),
});

export type TeamAlertChannelProps = z.infer<typeof teamAlertChannelPropsSchema>;
