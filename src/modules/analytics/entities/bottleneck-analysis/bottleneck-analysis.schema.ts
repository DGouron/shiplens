import { z } from 'zod';

export const issueTransitionSchema = z.object({
  toStatusName: z.string().min(1),
  occurredAt: z.string().min(1),
});

export type IssueTransition = z.infer<typeof issueTransitionSchema>;

export const completedIssueSchema = z.object({
  externalId: z.string().min(1),
  assigneeName: z.string().nullable(),
  transitions: z.array(issueTransitionSchema).min(1),
});

export type CompletedIssue = z.infer<typeof completedIssueSchema>;

export const bottleneckAnalysisSchema = z.object({
  cycleId: z.string().min(1),
  teamId: z.string().min(1),
  completedIssues: z.array(completedIssueSchema),
  previousCycleMedians: z.record(z.string(), z.number()).optional(),
});

export type BottleneckAnalysisProps = z.infer<typeof bottleneckAnalysisSchema>;
