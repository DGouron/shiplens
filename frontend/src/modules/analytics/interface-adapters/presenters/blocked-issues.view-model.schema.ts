import { z } from 'zod';

export const blockedIssueItemViewModelSchema = z.object({
  id: z.string(),
  issueTitle: z.string(),
  statusName: z.string(),
  durationLabel: z.string(),
  severityLabel: z.string(),
  issueUrl: z.string(),
});

export const blockedIssuesViewModelSchema = z.object({
  items: z.array(blockedIssueItemViewModelSchema),
  emptyMessage: z.nullable(z.string()),
});

export type BlockedIssueItemViewModel = z.infer<
  typeof blockedIssueItemViewModelSchema
>;
export type BlockedIssuesViewModel = z.infer<
  typeof blockedIssuesViewModelSchema
>;
