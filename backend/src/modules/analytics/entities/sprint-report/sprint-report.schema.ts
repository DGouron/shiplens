import { z } from 'zod';

export const sprintReportSectionSchema = z.object({
  executiveSummary: z.string().min(1),
  trends: z.string().nullable(),
  highlights: z.string().min(1),
  risks: z.string().min(1),
  recommendations: z.string().min(1),
});

export type SprintReportSection = z.infer<typeof sprintReportSectionSchema>;

export const evaluatedRuleSchema = z.object({
  ruleName: z.string(),
  status: z.enum(['pass', 'warn', 'fail']),
  measuredValue: z.string(),
  threshold: z.string(),
  recommendation: z.string().nullable(),
});

export type EvaluatedRule = z.infer<typeof evaluatedRuleSchema>;

export const auditChecklistItemSchema = z.object({
  name: z.string(),
});

export type AuditChecklistItem = z.infer<typeof auditChecklistItemSchema>;

export const auditTrendSchema = z.object({
  scores: z.array(z.number()),
  message: z.string(),
});

export type AuditTrend = z.infer<typeof auditTrendSchema>;

export const auditSectionSchema = z.object({
  evaluatedRules: z.array(evaluatedRuleSchema),
  checklistItems: z.array(auditChecklistItemSchema),
  adherenceScore: z.number(),
  trend: auditTrendSchema.nullable(),
});

export type AuditSection = z.infer<typeof auditSectionSchema>;

export const sprintReportPropsSchema = z.object({
  id: z.string().uuid(),
  cycleId: z.string().min(1),
  teamId: z.string().min(1),
  cycleName: z.string().min(1),
  language: z.enum(['FR', 'EN']),
  generatedAt: z.string().min(1),
  sections: sprintReportSectionSchema,
  auditSection: auditSectionSchema.nullable().optional(),
});

export type SprintReportProps = z.infer<typeof sprintReportPropsSchema>;
