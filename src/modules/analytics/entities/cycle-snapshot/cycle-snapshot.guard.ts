import { createGuard } from '@shared/foundation/guard/guard.js';
import { cycleSnapshotSchema } from './cycle-snapshot.schema.js';

export const cycleSnapshotGuard = createGuard(
  cycleSnapshotSchema,
  'CycleSnapshot',
);
