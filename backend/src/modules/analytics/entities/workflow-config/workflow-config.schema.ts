import { z } from 'zod';

export const workflowConfigSourceSchema = z.enum(['auto-detected', 'manual']);

export const workflowConfigSchema = z.object({
  startedStatuses: z.array(z.string()),
  completedStatuses: z.array(z.string()),
  source: workflowConfigSourceSchema,
});

export type WorkflowConfigProps = z.infer<typeof workflowConfigSchema>;
export type WorkflowConfigSource = z.infer<typeof workflowConfigSourceSchema>;
