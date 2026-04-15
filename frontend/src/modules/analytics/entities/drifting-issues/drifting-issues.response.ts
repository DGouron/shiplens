import { type z } from 'zod';
import {
  type driftingIssueResponseSchema,
  type driftingIssuesResponseSchema,
} from './drifting-issues.response.schema.ts';

export type DriftingIssueResponse = z.infer<typeof driftingIssueResponseSchema>;
export type DriftingIssuesResponse = z.infer<
  typeof driftingIssuesResponseSchema
>;
