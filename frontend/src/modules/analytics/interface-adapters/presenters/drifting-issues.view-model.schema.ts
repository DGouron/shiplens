import { z } from 'zod';

export const driftingIssueRowViewModelSchema = z.object({
  id: z.string(),
  title: z.string(),
  statusName: z.string(),
  driftLabel: z.string(),
  elapsedLabel: z.string(),
  expectedLabel: z.string(),
  pointsLabel: z.string(),
  issueUrl: z.string(),
});

export const driftingIssuesViewModelSchema = z.object({
  rows: z.array(driftingIssueRowViewModelSchema),
  emptyMessage: z.nullable(z.string()),
  showList: z.boolean(),
  showEmptyMessage: z.boolean(),
});

export type DriftingIssueRowViewModel = z.infer<
  typeof driftingIssueRowViewModelSchema
>;
export type DriftingIssuesViewModel = z.infer<
  typeof driftingIssuesViewModelSchema
>;
