import { createGuard } from '@shared/foundation/guard/guard.js';
import { estimationAccuracyPropsSchema } from './estimation-accuracy.schema.js';

export const estimationAccuracyGuard = createGuard(
  estimationAccuracyPropsSchema,
  'EstimationAccuracy',
);
