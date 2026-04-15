import { createGuard } from '@/shared/foundation/guard/guard.ts';
import { workspaceDashboardResponseSchema } from '../../entities/workspace-dashboard/workspace-dashboard.dto.schema.ts';

export const workspaceDashboardResponseGuard = createGuard(
  workspaceDashboardResponseSchema,
  'WorkspaceDashboardResponse',
);
