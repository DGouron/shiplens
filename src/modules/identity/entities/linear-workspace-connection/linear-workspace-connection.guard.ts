import { createGuard } from '@shared/foundation/guard/guard.js';
import { linearWorkspaceConnectionSchema } from './linear-workspace-connection.schema.js';

export const linearWorkspaceConnectionGuard = createGuard(
  linearWorkspaceConnectionSchema,
  'LinearWorkspaceConnection',
);
