import { z } from 'zod';

export const cycleThemeIssueRowViewModelSchema = z.object({
  externalId: z.string(),
  title: z.string(),
  assigneeLabel: z.string(),
  pointsLabel: z.string(),
  statusName: z.string(),
  linearUrl: z.string(),
  linearLinkLabel: z.string(),
  showLinearLink: z.boolean(),
});

export const cycleThemeIssuesDrawerViewModelSchema = z.object({
  isOpen: z.boolean(),
  title: z.string(),
  closeLabel: z.string(),
  issueRows: z.array(cycleThemeIssueRowViewModelSchema),
  emptyMessage: z.nullable(z.string()),
  showIssues: z.boolean(),
  showEmptyMessage: z.boolean(),
  showLoading: z.boolean(),
  showError: z.boolean(),
  errorMessage: z.nullable(z.string()),
  loadingMessage: z.nullable(z.string()),
});

export type CycleThemeIssueRowViewModel = z.infer<
  typeof cycleThemeIssueRowViewModelSchema
>;
export type CycleThemeIssuesDrawerViewModel = z.infer<
  typeof cycleThemeIssuesDrawerViewModelSchema
>;
