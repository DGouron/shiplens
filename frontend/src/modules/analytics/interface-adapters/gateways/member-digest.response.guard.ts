import { createGuard } from '@/shared/foundation/guard/guard.ts';
import { memberDigestResponseSchema } from '../../entities/member-digest/member-digest.response.schema.ts';

export const memberDigestResponseGuard = createGuard(
  memberDigestResponseSchema,
  'MemberDigestResponse',
);
