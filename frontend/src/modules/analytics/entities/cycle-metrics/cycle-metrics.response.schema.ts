import { z } from 'zod';

export const velocityResponseSchema = z.object({
  completedPoints: z.number(),
  plannedPoints: z.number(),
});

export const cycleMetricsTrendResponseSchema = z.object({
  previousVelocities: z.array(z.number()),
});

export const cycleMetricsResponseSchema = z.object({
  velocity: velocityResponseSchema,
  throughput: z.number(),
  completionRate: z.number(),
  scopeCreep: z.number(),
  averageCycleTimeInDays: z.nullable(z.number()),
  averageLeadTimeInDays: z.nullable(z.number()),
  trend: z.optional(cycleMetricsTrendResponseSchema),
});
