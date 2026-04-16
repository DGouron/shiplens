import { createGuard } from '@/shared/foundation/guard/guard.ts';
import { estimationAccuracyResponseSchema } from '../../entities/estimation-accuracy/estimation-accuracy.response.schema.ts';

export const estimationAccuracyResponseGuard = createGuard(
  estimationAccuracyResponseSchema,
  'EstimationAccuracyResponse',
);
