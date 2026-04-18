import { z } from 'zod';

export const topCycleAssigneesMetricSchema = z.enum([
  'count',
  'points',
  'time',
]);

export const topCycleAssigneesMetricToggleViewModelSchema = z.object({
  activeMetric: topCycleAssigneesMetricSchema,
  countLabel: z.string(),
  pointsLabel: z.string(),
  timeLabel: z.string(),
});

export const topCycleAssigneeRankingRowViewModelSchema = z.object({
  assigneeName: z.string(),
  metricValueLabel: z.string(),
});

export const topCycleAssigneesViewModelSchema = z.object({
  title: z.string(),
  metricToggle: topCycleAssigneesMetricToggleViewModelSchema,
  rankingRows: z.array(topCycleAssigneeRankingRowViewModelSchema),
  emptyMessage: z.nullable(z.string()),
  showRows: z.boolean(),
  showEmptyMessage: z.boolean(),
});

export type TopCycleAssigneesMetric = z.infer<
  typeof topCycleAssigneesMetricSchema
>;
export type TopCycleAssigneesMetricToggleViewModel = z.infer<
  typeof topCycleAssigneesMetricToggleViewModelSchema
>;
export type TopCycleAssigneeRankingRowViewModel = z.infer<
  typeof topCycleAssigneeRankingRowViewModelSchema
>;
export type TopCycleAssigneesViewModel = z.infer<
  typeof topCycleAssigneesViewModelSchema
>;
