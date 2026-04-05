import { createGuard } from '@shared/foundation/guard/guard.js';
import { memberHealthPropsSchema } from './member-health.schema.js';

export const memberHealthGuard = createGuard(
  memberHealthPropsSchema,
  'MemberHealth',
);
