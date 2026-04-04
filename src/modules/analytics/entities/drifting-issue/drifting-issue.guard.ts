import { createGuard } from '@shared/foundation/guard/guard.js';
import { driftingIssueInputSchema } from './drifting-issue.schema.js';

export const driftingIssueInputGuard = createGuard(
  driftingIssueInputSchema,
  'DriftingIssueInput',
);
