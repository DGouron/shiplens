import { createGuard } from '@/shared/foundation/guard/guard.ts';
import {
  cycleProjectIssuesResponseSchema,
  topCycleProjectsResponseSchema,
} from '../../entities/top-cycle-projects/top-cycle-projects.response.schema.ts';

export const topCycleProjectsResponseGuard = createGuard(
  topCycleProjectsResponseSchema,
  'TopCycleProjectsResponse',
);

export const cycleProjectIssuesResponseGuard = createGuard(
  cycleProjectIssuesResponseSchema,
  'CycleProjectIssuesResponse',
);
