import { z } from 'zod';

export const driftingIssueInputSchema = z.object({
  issueExternalId: z.string().min(1),
  issueTitle: z.string().min(1),
  issueUuid: z.string().min(1),
  teamId: z.string().min(1),
  points: z.number().int().positive().nullable(),
  statusName: z.string().min(1),
  statusType: z.string().min(1),
  startedAt: z.string().min(1).nullable(),
});

export type DriftingIssueInput = z.infer<typeof driftingIssueInputSchema>;
