import { z } from 'zod';

export const activeCycleLocatorSchema = z.object({
  cycleId: z.string().min(1),
  cycleName: z.string().min(1),
});

export const cycleAssigneeAggregateSchema = z.object({
  assigneeName: z.string().min(1),
  issueCount: z.number().int().min(0),
  totalPoints: z.number().min(0),
  totalCycleTimeInHours: z.number().min(0).nullable(),
});

export const cycleAssigneeIssueDetailSchema = z.object({
  externalId: z.string().min(1),
  title: z.string().min(1),
  points: z.number().nullable(),
  totalCycleTimeInHours: z.number().min(0).nullable(),
  statusName: z.string().min(1),
});

export const cycleAssigneeIssuesResultSchema = z.object({
  assigneeName: z.string().min(1),
  issues: z.array(cycleAssigneeIssueDetailSchema),
});

export type ActiveCycleLocator = z.infer<typeof activeCycleLocatorSchema>;
export type CycleAssigneeAggregate = z.infer<
  typeof cycleAssigneeAggregateSchema
>;
export type CycleAssigneeIssueDetail = z.infer<
  typeof cycleAssigneeIssueDetailSchema
>;
export type CycleAssigneeIssuesResult = z.infer<
  typeof cycleAssigneeIssuesResultSchema
>;
