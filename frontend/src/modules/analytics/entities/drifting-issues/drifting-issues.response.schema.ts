import { z } from 'zod';

export const driftingIssueResponseSchema = z.object({
  issueExternalId: z.string(),
  issueTitle: z.string(),
  teamId: z.string(),
  statusName: z.string(),
  points: z.nullable(z.number()),
  driftStatus: z.string(),
  elapsedBusinessHours: z.number(),
  expectedMaxHours: z.nullable(z.number()),
  issueUrl: z.string(),
});

export const driftingIssuesResponseSchema = z.array(
  driftingIssueResponseSchema,
);
