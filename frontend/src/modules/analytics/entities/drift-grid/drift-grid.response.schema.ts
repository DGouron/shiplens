import { z } from 'zod';

export const driftGridEntrySchema = z.object({
  points: z.number(),
  maxBusinessHours: z.number(),
});

export const driftGridResponseSchema = z.array(driftGridEntrySchema);
