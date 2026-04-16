import { z } from 'zod';

export const cycleMetricsCardIdSchema = z.enum([
  'velocity',
  'throughput',
  'completionRate',
  'scopeCreep',
  'averageCycleTime',
  'averageLeadTime',
]);

export const cycleMetricsCardViewModelSchema = z.object({
  id: cycleMetricsCardIdSchema,
  label: z.string(),
  value: z.string(),
  isAlert: z.boolean(),
});

export const cycleMetricsViewModelSchema = z.object({
  cards: z.array(cycleMetricsCardViewModelSchema),
});

export type CycleMetricsCardId = z.infer<typeof cycleMetricsCardIdSchema>;
export type CycleMetricsCardViewModel = z.infer<
  typeof cycleMetricsCardViewModelSchema
>;
export type CycleMetricsViewModel = z.infer<typeof cycleMetricsViewModelSchema>;
