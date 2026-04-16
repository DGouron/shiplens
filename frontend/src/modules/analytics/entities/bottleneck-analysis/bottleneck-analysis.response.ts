import { type z } from 'zod';
import {
  type assigneeBreakdownResponseSchema,
  type bottleneckAnalysisResponseSchema,
  type cycleComparisonResponseSchema,
  type statusDistributionResponseSchema,
} from './bottleneck-analysis.response.schema.ts';

export type StatusDistributionResponse = z.infer<
  typeof statusDistributionResponseSchema
>;
export type AssigneeBreakdownResponse = z.infer<
  typeof assigneeBreakdownResponseSchema
>;
export type CycleComparisonResponse = z.infer<
  typeof cycleComparisonResponseSchema
>;
export type BottleneckAnalysisResponse = z.infer<
  typeof bottleneckAnalysisResponseSchema
>;
