import { createGuard } from '@shared/foundation/guard/guard.js';
import { statusThresholdSchema } from './status-threshold.schema.js';

export const statusThresholdGuard = createGuard(
  statusThresholdSchema,
  'StatusThreshold',
);
