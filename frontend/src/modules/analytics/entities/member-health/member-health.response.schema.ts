import { z } from 'zod';

export const trendSchema = z.enum(['rising', 'falling', 'stable']);

export const signalIndicatorSchema = z.enum([
  'green',
  'orange',
  'red',
  'not-applicable',
  'not-enough-history',
]);

export const memberHealthSignalResponseSchema = z.object({
  value: z.string(),
  trend: z.nullable(trendSchema),
  indicator: signalIndicatorSchema,
});

export const memberHealthResponseSchema = z.object({
  teamId: z.string(),
  memberName: z.string(),
  estimationScore: memberHealthSignalResponseSchema,
  underestimationRatio: memberHealthSignalResponseSchema,
  averageCycleTime: memberHealthSignalResponseSchema,
  driftingTickets: memberHealthSignalResponseSchema,
  medianReviewTime: memberHealthSignalResponseSchema,
});
