import { z } from 'zod';

export const blockedIssueAlertSchema = z.object({
  id: z.string().min(1),
  issueExternalId: z.string().min(1),
  issueTitle: z.string().min(1),
  issueUuid: z.string().min(1),
  teamId: z.string(),
  statusName: z.string().min(1),
  severity: z.enum(['warning', 'critical']),
  durationHours: z.number().positive(),
  detectedAt: z.string().min(1),
  active: z.boolean(),
  resolvedAt: z.string().nullable(),
  assigneeName: z.string().nullable(),
});

export type BlockedIssueAlertProps = z.infer<typeof blockedIssueAlertSchema>;
