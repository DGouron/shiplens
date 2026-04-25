import { z } from 'zod';

export const memberMetricsCardIdSchema = z.enum([
  'blocked',
  'drifting',
  'slowestStatus',
  'estimationCalibration',
  'throughput',
  'verdict',
]);

export const memberMetricsSignalSchema = z.enum([
  'green',
  'orange',
  'red',
  'neutral',
]);

export const memberMetricsCardViewModelSchema = z.object({
  id: memberMetricsCardIdSchema,
  label: z.string(),
  value: z.string(),
  caption: z.nullable(z.string()),
  signal: memberMetricsSignalSchema,
});

export const memberMetricsViewModelSchema = z.object({
  cards: z.array(memberMetricsCardViewModelSchema),
});

export type MemberMetricsCardId = z.infer<typeof memberMetricsCardIdSchema>;
export type MemberMetricsSignal = z.infer<typeof memberMetricsSignalSchema>;
export type MemberMetricsCardViewModel = z.infer<
  typeof memberMetricsCardViewModelSchema
>;
export type MemberMetricsViewModel = z.infer<
  typeof memberMetricsViewModelSchema
>;
