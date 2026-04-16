import { type z } from 'zod';
import {
  type developerScoreResponseSchema,
  type estimationAccuracyResponseSchema,
  type estimationClassificationResponseSchema,
  type issueRatioResponseSchema,
  type labelScoreResponseSchema,
  type teamScoreResponseSchema,
} from './estimation-accuracy.response.schema.ts';

export type EstimationClassificationResponse = z.infer<
  typeof estimationClassificationResponseSchema
>;
export type IssueRatioResponse = z.infer<typeof issueRatioResponseSchema>;
export type DeveloperScoreResponse = z.infer<
  typeof developerScoreResponseSchema
>;
export type LabelScoreResponse = z.infer<typeof labelScoreResponseSchema>;
export type TeamScoreResponse = z.infer<typeof teamScoreResponseSchema>;
export type EstimationAccuracyResponse = z.infer<
  typeof estimationAccuracyResponseSchema
>;
