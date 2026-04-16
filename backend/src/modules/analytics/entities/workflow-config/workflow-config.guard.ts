import { createGuard } from '@shared/foundation/guard/guard.js';
import { workflowConfigSchema } from './workflow-config.schema.js';

export const workflowConfigGuard = createGuard(
  workflowConfigSchema,
  'WorkflowConfig',
);
