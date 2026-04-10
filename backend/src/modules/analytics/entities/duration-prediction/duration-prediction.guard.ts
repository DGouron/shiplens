import { createGuard } from '@shared/foundation/guard/guard.js';
import { durationPredictionPropsSchema } from './duration-prediction.schema.js';

export const durationPredictionGuard = createGuard(
  durationPredictionPropsSchema,
  'DurationPrediction',
);
