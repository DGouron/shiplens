import { createGuard } from '@/shared/foundation/guard/guard.ts';
import { blockedIssueAlertResponseSchema } from '../../entities/blocked-issues/blocked-issues.response.schema.ts';

export const blockedIssueAlertResponseGuard = createGuard(
  blockedIssueAlertResponseSchema,
  'BlockedIssueAlertResponse',
);
