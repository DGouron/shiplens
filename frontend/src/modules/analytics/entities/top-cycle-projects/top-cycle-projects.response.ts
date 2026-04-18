import { type z } from 'zod';
import {
  type cycleProjectIssueRowResponseSchema,
  type cycleProjectIssuesResponseSchema,
  type topCycleProjectRowResponseSchema,
  type topCycleProjectsResponseSchema,
} from './top-cycle-projects.response.schema.ts';

export type TopCycleProjectRowResponse = z.infer<
  typeof topCycleProjectRowResponseSchema
>;
export type TopCycleProjectsResponse = z.infer<
  typeof topCycleProjectsResponseSchema
>;
export type CycleProjectIssueRowResponse = z.infer<
  typeof cycleProjectIssueRowResponseSchema
>;
export type CycleProjectIssuesResponse = z.infer<
  typeof cycleProjectIssuesResponseSchema
>;
