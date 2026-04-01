import { createGuard } from '@shared/foundation/guard/guard.js';
import { auditRulePropsSchema } from './audit-rule.schema.js';

export const auditRuleGuard = createGuard(
  auditRulePropsSchema,
  'AuditRule',
);
