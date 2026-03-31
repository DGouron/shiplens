import { z } from 'zod';

export const issueDataSchema = z.object({
  externalId: z.string().min(1),
  teamId: z.string().min(1),
  title: z.string().min(1),
  statusName: z.string().min(1),
  points: z.number().nullable(),
  labelIds: z.string(),
  assigneeName: z.string().nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const cycleDataSchema = z.object({
  externalId: z.string().min(1),
  teamId: z.string().min(1),
  name: z.string().nullable(),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  issueExternalIds: z.string(),
});

export const stateTransitionDataSchema = z.object({
  externalId: z.string().min(1),
  issueExternalId: z.string().min(1),
  teamId: z.string().min(1),
  fromStatusName: z.string().nullable(),
  toStatusName: z.string().min(1),
  occurredAt: z.string().min(1),
});

export const paginatedIssuesSchema = z.object({
  issues: z.array(issueDataSchema),
  hasNextPage: z.boolean(),
  endCursor: z.string().nullable(),
});

export type IssueData = z.infer<typeof issueDataSchema>;
export type CycleData = z.infer<typeof cycleDataSchema>;
export type StateTransitionData = z.infer<typeof stateTransitionDataSchema>;
export type PaginatedIssues = z.infer<typeof paginatedIssuesSchema>;

export const commentDataSchema = z.object({
  externalId: z.string().min(1),
  issueExternalId: z.string().min(1),
  teamId: z.string().min(1),
  body: z.string().min(1),
  authorName: z.string().min(1),
  createdAt: z.string().min(1),
});

export type CommentData = z.infer<typeof commentDataSchema>;
