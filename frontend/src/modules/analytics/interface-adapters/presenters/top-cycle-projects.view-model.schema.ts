import { z } from 'zod';

export const topCycleProjectsMetricSchema = z.enum(['count', 'points', 'time']);

export const topCycleProjectsMetricToggleViewModelSchema = z.object({
  activeMetric: topCycleProjectsMetricSchema,
  countLabel: z.string(),
  pointsLabel: z.string(),
  timeLabel: z.string(),
});

export const topCycleProjectRankingRowViewModelSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  metricValueLabel: z.string(),
  isNoProjectBucket: z.boolean(),
});

export const topCycleProjectsViewModelSchema = z.object({
  title: z.string(),
  metricToggle: topCycleProjectsMetricToggleViewModelSchema,
  rankingRows: z.array(topCycleProjectRankingRowViewModelSchema),
  emptyMessage: z.nullable(z.string()),
  showRows: z.boolean(),
  showEmptyMessage: z.boolean(),
  showExpandButton: z.boolean(),
  expandLabel: z.string(),
});

export type TopCycleProjectsMetric = z.infer<
  typeof topCycleProjectsMetricSchema
>;
export type TopCycleProjectsMetricToggleViewModel = z.infer<
  typeof topCycleProjectsMetricToggleViewModelSchema
>;
export type TopCycleProjectRankingRowViewModel = z.infer<
  typeof topCycleProjectRankingRowViewModelSchema
>;
export type TopCycleProjectsViewModel = z.infer<
  typeof topCycleProjectsViewModelSchema
>;
