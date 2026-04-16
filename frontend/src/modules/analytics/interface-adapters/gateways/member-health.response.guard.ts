import { createGuard } from '@/shared/foundation/guard/guard.ts';
import { memberHealthResponseSchema } from '../../entities/member-health/member-health.response.schema.ts';

export const memberHealthResponseGuard = createGuard(
  memberHealthResponseSchema,
  'MemberHealthResponse',
);
