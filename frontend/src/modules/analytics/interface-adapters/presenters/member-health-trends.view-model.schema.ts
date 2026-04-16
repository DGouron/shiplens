import { z } from 'zod';

export const healthSignalIdSchema = z.enum([
  'estimationScore',
  'underestimationRatio',
  'averageCycleTime',
  'driftingTickets',
  'medianReviewTime',
]);

export const healthSignalViewModelSchema = z.object({
  id: healthSignalIdSchema,
  label: z.string(),
  description: z.string(),
  value: z.string(),
  trendDirection: z.enum(['rising', 'falling', 'stable']).nullable(),
  indicatorColor: z.enum(['green', 'orange', 'red']).nullable(),
  showNotApplicableNote: z.boolean(),
  showNotEnoughHistoryNote: z.boolean(),
  notApplicableNote: z.string(),
  notEnoughHistoryNote: z.string(),
});

export const breadcrumbViewModelSchema = z.object({
  label: z.string(),
  href: z.nullable(z.string()),
});

export const legendItemViewModelSchema = z.object({
  indicator: z.string(),
  label: z.string(),
});

export const memberHealthTrendsViewModelSchema = z.object({
  pageTitle: z.string(),
  memberName: z.string(),
  breadcrumbs: z.array(breadcrumbViewModelSchema),
  backToReportHref: z.string(),
  backToReportLabel: z.string(),
  cycleCountOptions: z.array(z.number()),
  selectedCycleCount: z.number(),
  subtitle: z.string(),
  completedSprintsLabel: z.string(),
  signals: z.array(healthSignalViewModelSchema),
  legendItems: z.array(legendItemViewModelSchema),
  noticeIntro: z.string(),
  noticeMinimum: z.string(),
});

export type HealthSignalId = z.infer<typeof healthSignalIdSchema>;
export type HealthSignalViewModel = z.infer<typeof healthSignalViewModelSchema>;
export type BreadcrumbViewModel = z.infer<typeof breadcrumbViewModelSchema>;
export type LegendItemViewModel = z.infer<typeof legendItemViewModelSchema>;
export type MemberHealthTrendsViewModel = z.infer<
  typeof memberHealthTrendsViewModelSchema
>;
