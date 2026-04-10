import { z } from 'zod';
import { conditionSchema } from './condition.schema.js';

export const severitySchema = z.enum(['info', 'warning', 'error']);

export type Severity = z.infer<typeof severitySchema>;

export const originSchema = z.enum(['manual', 'packmind']);

export type Origin = z.infer<typeof originSchema>;

export const auditRulePropsSchema = z.object({
  identifier: z.string().min(1),
  name: z.string().min(1),
  severity: severitySchema,
  condition: conditionSchema,
  origin: originSchema,
});

export type AuditRuleProps = z.infer<typeof auditRulePropsSchema>;
