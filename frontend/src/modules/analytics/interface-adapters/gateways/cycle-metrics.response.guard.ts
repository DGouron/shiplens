import { createGuard } from '@/shared/foundation/guard/guard.ts';
import { cycleMetricsResponseSchema } from '../../entities/cycle-metrics/cycle-metrics.response.schema.ts';

export const cycleMetricsResponseGuard = createGuard(
  cycleMetricsResponseSchema,
  'CycleMetricsResponse',
);
