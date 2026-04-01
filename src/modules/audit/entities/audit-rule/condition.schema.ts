import { z } from 'zod';

export const thresholdConditionSchema = z.object({
  type: z.literal('threshold'),
  metric: z.string().min(1),
  operator: z.enum(['>', '<', '>=', '<=']),
  value: z.number(),
  unit: z.string().optional(),
});

export const ratioConditionSchema = z.object({
  type: z.literal('ratio'),
  numerator: z.string().min(1),
  denominator: z.string().min(1),
  operator: z.enum(['>', '<', '>=', '<=']),
  value: z.number(),
});

export const patternConditionSchema = z.object({
  type: z.literal('pattern'),
  target: z.enum(['label', 'status']),
  matcher: z.enum(['contains', 'equals']),
  value: z.string().min(1),
});

export const conditionSchema = z.discriminatedUnion('type', [
  thresholdConditionSchema,
  ratioConditionSchema,
  patternConditionSchema,
]);

export type ThresholdCondition = z.infer<typeof thresholdConditionSchema>;
export type RatioCondition = z.infer<typeof ratioConditionSchema>;
export type PatternCondition = z.infer<typeof patternConditionSchema>;
export type Condition = z.infer<typeof conditionSchema>;
