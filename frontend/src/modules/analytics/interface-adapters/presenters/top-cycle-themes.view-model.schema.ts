import { z } from 'zod';

export const topCycleThemesMetricSchema = z.enum(['count', 'points', 'time']);

export const topCycleThemesMetricToggleViewModelSchema = z.object({
  activeMetric: topCycleThemesMetricSchema,
  countLabel: z.string(),
  pointsLabel: z.string(),
  timeLabel: z.string(),
});

export const topCycleThemeRankingRowViewModelSchema = z.object({
  themeName: z.string(),
  metricValueLabel: z.string(),
});

export const topCycleThemesEmptyToneSchema = z.enum(['neutral', 'warning']);

export const topCycleThemesViewModelSchema = z.object({
  title: z.string(),
  refreshLabel: z.string(),
  metricToggle: topCycleThemesMetricToggleViewModelSchema,
  rankingRows: z.array(topCycleThemeRankingRowViewModelSchema),
  emptyMessage: z.nullable(z.string()),
  emptyTone: topCycleThemesEmptyToneSchema,
  showMetricToggle: z.boolean(),
  showRows: z.boolean(),
  showEmptyMessage: z.boolean(),
  showRefreshButton: z.boolean(),
});

export type TopCycleThemesMetric = z.infer<typeof topCycleThemesMetricSchema>;
export type TopCycleThemesMetricToggleViewModel = z.infer<
  typeof topCycleThemesMetricToggleViewModelSchema
>;
export type TopCycleThemeRankingRowViewModel = z.infer<
  typeof topCycleThemeRankingRowViewModelSchema
>;
export type TopCycleThemesEmptyTone = z.infer<
  typeof topCycleThemesEmptyToneSchema
>;
export type TopCycleThemesViewModel = z.infer<
  typeof topCycleThemesViewModelSchema
>;
