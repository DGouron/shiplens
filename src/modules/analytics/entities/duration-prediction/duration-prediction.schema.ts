import { z } from 'zod';

export const durationPredictionPropsSchema = z.object({
  optimistic: z.number().positive(),
  probable: z.number().positive(),
  pessimistic: z.number().positive(),
  similarIssueCount: z.number().int().nonnegative(),
});

export type DurationPredictionProps = z.infer<typeof durationPredictionPropsSchema>;
