import { z } from 'zod';

export const cycleSummarySchema = z.object({
  externalId: z.string().min(1),
  teamId: z.string().min(1),
  name: z.string().min(1),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  issueCount: z.number().int().min(0),
  isActive: z.boolean(),
});

export type CycleSummary = z.infer<typeof cycleSummarySchema>;

export const cycleIssueDetailSchema = z.object({
  externalId: z.string().min(1),
  title: z.string().min(1),
  statusName: z.string().min(1),
  points: z.number().nullable(),
  assigneeName: z.string().nullable(),
});

export type CycleIssueDetail = z.infer<typeof cycleIssueDetailSchema>;
