import { z } from 'zod';

export const cycleProjectIssueRowViewModelSchema = z.object({
  externalId: z.string(),
  title: z.string(),
  assigneeLabel: z.string(),
  pointsLabel: z.string(),
  statusName: z.string(),
  linearUrl: z.string(),
  linearLinkLabel: z.string(),
});

export const cycleProjectIssuesDrawerViewModelSchema = z.object({
  isOpen: z.boolean(),
  title: z.string(),
  closeLabel: z.string(),
  issueRows: z.array(cycleProjectIssueRowViewModelSchema),
  emptyMessage: z.nullable(z.string()),
  showIssues: z.boolean(),
  showEmptyMessage: z.boolean(),
  showLoading: z.boolean(),
  showError: z.boolean(),
  errorMessage: z.nullable(z.string()),
  loadingMessage: z.nullable(z.string()),
});

export type CycleProjectIssueRowViewModel = z.infer<
  typeof cycleProjectIssueRowViewModelSchema
>;
export type CycleProjectIssuesDrawerViewModel = z.infer<
  typeof cycleProjectIssuesDrawerViewModelSchema
>;
