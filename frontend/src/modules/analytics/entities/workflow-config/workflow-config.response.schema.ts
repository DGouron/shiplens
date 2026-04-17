import { z } from 'zod';

export const workflowConfigSourceSchema = z.enum(['auto-detected', 'manual']);

export const workflowConfigResponseSchema = z.object({
  startedStatuses: z.array(z.string()),
  completedStatuses: z.array(z.string()),
  source: workflowConfigSourceSchema,
  knownStatuses: z.array(z.string()),
});
