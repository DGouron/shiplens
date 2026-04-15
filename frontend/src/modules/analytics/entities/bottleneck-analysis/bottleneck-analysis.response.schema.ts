import { z } from 'zod';

export const statusDistributionResponseSchema = z.object({
  statusName: z.string(),
  medianHours: z.number(),
});

export const assigneeBreakdownResponseSchema = z.object({
  assigneeName: z.string(),
  statusMedians: z.array(statusDistributionResponseSchema),
});

export const cycleComparisonResponseSchema = z.object({
  statusName: z.string(),
  previousMedianHours: z.number(),
  currentMedianHours: z.number(),
  evolutionPercent: z.number(),
});

export const bottleneckAnalysisResponseSchema = z.object({
  statusDistribution: z.array(statusDistributionResponseSchema),
  bottleneckStatus: z.string(),
  assigneeBreakdown: z.array(assigneeBreakdownResponseSchema),
  cycleComparison: z.nullable(z.array(cycleComparisonResponseSchema)),
});
