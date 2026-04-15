import { type z } from 'zod';
import {
  type cycleMetricsResponseSchema,
  type cycleMetricsTrendResponseSchema,
  type velocityResponseSchema,
} from './cycle-metrics.response.schema.ts';

export type VelocityResponse = z.infer<typeof velocityResponseSchema>;
export type CycleMetricsTrendResponse = z.infer<
  typeof cycleMetricsTrendResponseSchema
>;
export type CycleMetricsResponse = z.infer<typeof cycleMetricsResponseSchema>;
