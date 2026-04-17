import { createGuard } from '@/shared/foundation/guard/guard.ts';
import { workflowConfigResponseSchema } from '../../entities/workflow-config/workflow-config.response.schema.ts';

export const workflowConfigResponseGuard = createGuard(
  workflowConfigResponseSchema,
  'WorkflowConfigResponse',
);
