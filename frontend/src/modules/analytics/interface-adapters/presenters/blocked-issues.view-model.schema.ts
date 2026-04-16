import { z } from 'zod';

export const blockedIssueItemViewModelSchema = z.object({
  id: z.string(),
  issueTitle: z.string(),
  statusName: z.string(),
  durationLabel: z.string(),
  severityLabel: z.string(),
  severityLevel: z.enum(['critical', 'warning']),
  issueUrl: z.string(),
  assigneeName: z.nullable(z.string()),
  memberHealthTrendsHref: z.nullable(z.string()),
  showMemberLink: z.boolean(),
});

export const blockedIssuesViewModelSchema = z.object({
  items: z.array(blockedIssueItemViewModelSchema),
  emptyMessage: z.nullable(z.string()),
  showList: z.boolean(),
  showEmptyMessage: z.boolean(),
});

export type BlockedIssueItemViewModel = z.infer<
  typeof blockedIssueItemViewModelSchema
>;
export type BlockedIssuesViewModel = z.infer<
  typeof blockedIssuesViewModelSchema
>;
