import { type z } from 'zod';
import {
  type blockedIssueAlertResponseSchema,
  type blockedIssuesResponseSchema,
} from './blocked-issues.response.schema.ts';

export type BlockedIssueAlertResponse = z.infer<
  typeof blockedIssueAlertResponseSchema
>;
export type BlockedIssuesResponse = z.infer<typeof blockedIssuesResponseSchema>;
