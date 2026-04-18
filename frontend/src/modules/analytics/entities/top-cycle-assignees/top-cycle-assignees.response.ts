import { type z } from 'zod';
import {
  type cycleAssigneeIssueRowResponseSchema,
  type cycleAssigneeIssuesResponseSchema,
  type topCycleAssigneeRowResponseSchema,
  type topCycleAssigneesResponseSchema,
} from './top-cycle-assignees.response.schema.ts';

export type TopCycleAssigneeRowResponse = z.infer<
  typeof topCycleAssigneeRowResponseSchema
>;
export type TopCycleAssigneesResponse = z.infer<
  typeof topCycleAssigneesResponseSchema
>;
export type CycleAssigneeIssueRowResponse = z.infer<
  typeof cycleAssigneeIssueRowResponseSchema
>;
export type CycleAssigneeIssuesResponse = z.infer<
  typeof cycleAssigneeIssuesResponseSchema
>;
