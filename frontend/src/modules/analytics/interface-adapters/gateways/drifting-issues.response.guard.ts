import { createGuard } from '@/shared/foundation/guard/guard.ts';
import { driftingIssueResponseSchema } from '../../entities/drifting-issues/drifting-issues.response.schema.ts';

export const driftingIssueResponseGuard = createGuard(
  driftingIssueResponseSchema,
  'DriftingIssueResponse',
);
