import { createGuard } from '@shared/foundation/guard/guard.js';
import { syncProgressSchema } from './sync-progress.schema.js';

export const syncProgressGuard = createGuard(
  syncProgressSchema,
  'SyncProgress',
);
