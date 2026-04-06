import { z } from 'zod';

export const completedIssueDriftSchema = z.object({
  issueExternalId: z.string().min(1),
  assigneeName: z.string().nullable(),
  points: z.number().int().positive().nullable(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
});

export type CompletedIssueDrift = z.infer<typeof completedIssueDriftSchema>;
