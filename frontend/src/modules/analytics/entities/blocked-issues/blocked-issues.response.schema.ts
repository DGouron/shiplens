import { z } from 'zod';

export const blockedIssueAlertResponseSchema = z.object({
  id: z.string(),
  issueExternalId: z.string(),
  issueTitle: z.string(),
  teamId: z.string(),
  statusName: z.string(),
  severity: z.string(),
  durationHours: z.number(),
  issueUrl: z.string(),
  detectedAt: z.string(),
  assigneeName: z.nullable(z.string()),
});

export const blockedIssuesResponseSchema = z.array(
  blockedIssueAlertResponseSchema,
);
