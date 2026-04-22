import { createGuard } from '@/shared/foundation/guard/guard.ts';
import {
  cycleThemeIssuesResponseSchema,
  topCycleThemesResponseSchema,
} from '../../entities/top-cycle-themes/top-cycle-themes.response.schema.ts';

export const topCycleThemesResponseGuard = createGuard(
  topCycleThemesResponseSchema,
  'TopCycleThemesResponse',
);

export const cycleThemeIssuesResponseGuard = createGuard(
  cycleThemeIssuesResponseSchema,
  'CycleThemeIssuesResponse',
);
