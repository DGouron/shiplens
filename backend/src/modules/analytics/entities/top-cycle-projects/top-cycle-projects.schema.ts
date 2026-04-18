import { z } from 'zod';

export const NO_PROJECT_BUCKET_ID = '__no_project__';
export const NO_PROJECT_BUCKET_NAME = 'No project';

export const activeCycleLocatorSchema = z.object({
  cycleId: z.string().min(1),
  cycleName: z.string().min(1),
});

export const cycleProjectAggregateSchema = z.object({
  projectExternalId: z.string().nullable(),
  projectName: z.string().nullable(),
  issueCount: z.number().int().min(0),
  totalPoints: z.number().min(0),
  totalCycleTimeInHours: z.number().min(0).nullable(),
});

export const cycleProjectIssueDetailSchema = z.object({
  externalId: z.string().min(1),
  title: z.string().min(1),
  assigneeName: z.string().nullable(),
  points: z.number().nullable(),
  statusName: z.string().min(1),
});

export const cycleProjectIssuesResultSchema = z.object({
  projectName: z.string().nullable(),
  issues: z.array(cycleProjectIssueDetailSchema),
});

export type ActiveCycleLocator = z.infer<typeof activeCycleLocatorSchema>;
export type CycleProjectAggregate = z.infer<typeof cycleProjectAggregateSchema>;
export type CycleProjectIssueDetail = z.infer<
  typeof cycleProjectIssueDetailSchema
>;
export type CycleProjectIssuesResult = z.infer<
  typeof cycleProjectIssuesResultSchema
>;
