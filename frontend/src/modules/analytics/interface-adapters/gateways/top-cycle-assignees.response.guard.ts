import { createGuard } from '@/shared/foundation/guard/guard.ts';
import {
  cycleAssigneeIssuesResponseSchema,
  topCycleAssigneesResponseSchema,
} from '../../entities/top-cycle-assignees/top-cycle-assignees.response.schema.ts';

export const topCycleAssigneesResponseGuard = createGuard(
  topCycleAssigneesResponseSchema,
  'TopCycleAssigneesResponse',
);

export const cycleAssigneeIssuesResponseGuard = createGuard(
  cycleAssigneeIssuesResponseSchema,
  'CycleAssigneeIssuesResponse',
);
