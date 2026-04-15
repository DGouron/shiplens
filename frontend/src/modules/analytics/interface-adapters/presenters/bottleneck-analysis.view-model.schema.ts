import { z } from 'zod';

export const bottleneckRowViewModelSchema = z.object({
  statusName: z.string(),
  medianHoursLabel: z.string(),
  isBottleneck: z.boolean(),
});

export const bottleneckAnalysisViewModelSchema = z.object({
  rows: z.array(bottleneckRowViewModelSchema),
  bottleneckHeadline: z.string(),
  emptyMessage: z.nullable(z.string()),
});

export type BottleneckRowViewModel = z.infer<
  typeof bottleneckRowViewModelSchema
>;
export type BottleneckAnalysisViewModel = z.infer<
  typeof bottleneckAnalysisViewModelSchema
>;
