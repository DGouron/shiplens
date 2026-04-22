import { z } from 'zod';

export const estimationBucketViewModelSchema = z.object({
  label: z.string(),
  count: z.number(),
  percentage: z.number(),
});

export const estimationDonutViewModelSchema = z.object({
  wellEstimated: estimationBucketViewModelSchema,
  overEstimated: estimationBucketViewModelSchema,
  underEstimated: estimationBucketViewModelSchema,
  totalLabel: z.string(),
});

export const estimationDiagnosisViewModelSchema = z.object({
  healthLevel: z.enum(['healthy', 'mixed', 'needs-calibration']),
  healthHeadline: z.string(),
  accuracySummary: z.string(),
  driftSummary: z.string(),
  showDriftSummary: z.boolean(),
  recommendation: z.string(),
});

export const estimationExclusionViewModelSchema = z.object({
  count: z.number(),
  label: z.string(),
});

export const estimationExclusionsViewModelSchema = z.object({
  withoutEstimation: estimationExclusionViewModelSchema,
  withoutCycleTime: estimationExclusionViewModelSchema,
});

export const estimationAccuracyViewModelSchema = z.object({
  donut: estimationDonutViewModelSchema,
  diagnosis: estimationDiagnosisViewModelSchema,
  exclusions: estimationExclusionsViewModelSchema,
  emptyMessage: z.nullable(z.string()),
  showEmptyMessage: z.boolean(),
  showContent: z.boolean(),
  showExclusionWithoutEstimation: z.boolean(),
  showExclusionWithoutCycleTime: z.boolean(),
});

export type EstimationBucketViewModel = z.infer<
  typeof estimationBucketViewModelSchema
>;
export type EstimationDonutViewModel = z.infer<
  typeof estimationDonutViewModelSchema
>;
export type EstimationDiagnosisViewModel = z.infer<
  typeof estimationDiagnosisViewModelSchema
>;
export type EstimationExclusionViewModel = z.infer<
  typeof estimationExclusionViewModelSchema
>;
export type EstimationExclusionsViewModel = z.infer<
  typeof estimationExclusionsViewModelSchema
>;
export type EstimationAccuracyViewModel = z.infer<
  typeof estimationAccuracyViewModelSchema
>;
