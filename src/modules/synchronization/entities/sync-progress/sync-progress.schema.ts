import { z } from 'zod';

export const syncProgressSchema = z.object({
  teamId: z.string().min(1),
  totalIssues: z.number().int().min(0),
  syncedIssues: z.number().int().min(0),
  status: z.enum(['in_progress', 'completed', 'failed']),
  cursor: z.string().nullable(),
});

export type SyncProgressProps = z.infer<typeof syncProgressSchema>;
