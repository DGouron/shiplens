import { type z } from 'zod';
import {
  type workflowConfigResponseSchema,
  type workflowConfigSourceSchema,
} from './workflow-config.response.schema.ts';

export type WorkflowConfigSource = z.infer<typeof workflowConfigSourceSchema>;
export type WorkflowConfigResponse = z.infer<
  typeof workflowConfigResponseSchema
>;
