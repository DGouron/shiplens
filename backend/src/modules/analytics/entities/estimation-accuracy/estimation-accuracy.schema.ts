import { z } from 'zod';

export const estimatedIssueSchema = z.object({
  externalId: z.string().min(1),
  title: z.string().min(1),
  points: z.number(),
  cycleTimeInDays: z.number(),
  assigneeName: z.string().nullable(),
  labelNames: z.array(z.string()),
});

export type EstimatedIssue = z.infer<typeof estimatedIssueSchema>;

export const estimationAccuracyPropsSchema = z.object({
  cycleId: z.string().min(1),
  teamId: z.string().min(1),
  issues: z.array(estimatedIssueSchema),
  excludedWithoutEstimation: z.number(),
  excludedWithoutCycleTime: z.number(),
});

export type EstimationAccuracyProps = z.infer<
  typeof estimationAccuracyPropsSchema
>;
