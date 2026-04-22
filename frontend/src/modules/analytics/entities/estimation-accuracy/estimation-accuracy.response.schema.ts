import { z } from 'zod';

export const estimationClassificationResponseSchema = z.enum([
  'over-estimated',
  'under-estimated',
  'well-estimated',
]);

export const issueRatioResponseSchema = z.object({
  externalId: z.string(),
  title: z.string(),
  points: z.number(),
  cycleTimeInDays: z.number(),
  ratio: z.number(),
  daysPerPoint: z.number(),
  classification: estimationClassificationResponseSchema,
});

export const developerScoreResponseSchema = z.object({
  developerName: z.string(),
  issueCount: z.number(),
  averageRatio: z.number(),
  daysPerPoint: z.number(),
  classification: estimationClassificationResponseSchema,
});

export const labelScoreResponseSchema = z.object({
  labelName: z.string(),
  issueCount: z.number(),
  averageRatio: z.number(),
  daysPerPoint: z.number(),
  classification: estimationClassificationResponseSchema,
});

export const estimationAccuracyResponseSchema = z.object({
  issues: z.array(issueRatioResponseSchema),
  developerScores: z.array(developerScoreResponseSchema),
  labelScores: z.array(labelScoreResponseSchema),
  excludedWithoutEstimation: z.number(),
  excludedWithoutCycleTime: z.number(),
});
