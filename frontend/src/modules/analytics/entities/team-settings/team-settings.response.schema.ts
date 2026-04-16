import { z } from 'zod';

export const timezoneResponseSchema = z.object({
  timezone: z.string(),
});

export const statusListResponseSchema = z.object({
  statuses: z.array(z.string()),
});
