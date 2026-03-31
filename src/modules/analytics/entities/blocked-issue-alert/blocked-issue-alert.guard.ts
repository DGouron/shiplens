import { createGuard } from '@shared/foundation/guard/guard.js';
import { blockedIssueAlertSchema } from './blocked-issue-alert.schema.js';

export const blockedIssueAlertGuard = createGuard(
  blockedIssueAlertSchema,
  'BlockedIssueAlert',
);
