import { createGuard } from '@shared/foundation/guard/guard.js';
import { cycleThemeSetPropsSchema } from './cycle-theme-set.schema.js';

export const cycleThemeSetGuard = createGuard(
  cycleThemeSetPropsSchema,
  'CycleThemeSet',
);
