import { createGuard } from '@shared/foundation/guard/guard.js';
import { teamSelectionSchema } from './team-selection.schema.js';

export const teamSelectionGuard = createGuard(
  teamSelectionSchema,
  'TeamSelection',
);
