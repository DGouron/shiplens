import { z } from 'zod';

export const cycleSummaryResponseSchema = z.object({
  externalId: z.string(),
  name: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  issueCount: z.number(),
  status: z.enum(['in_progress', 'completed']),
});

export const teamCyclesResponseSchema = z.object({
  cycles: z.array(cycleSummaryResponseSchema),
});
