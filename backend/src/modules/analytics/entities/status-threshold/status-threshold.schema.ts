import { z } from 'zod';

export const statusThresholdSchema = z.object({
  id: z.string().min(1),
  statusName: z.string().min(1),
  thresholdHours: z.number(),
});

export type StatusThresholdProps = z.infer<typeof statusThresholdSchema>;
