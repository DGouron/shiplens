import { z } from 'zod';

export const cycleAssigneeIssueRowViewModelSchema = z.object({
  externalId: z.string(),
  title: z.string(),
  pointsLabel: z.string(),
  cycleTimeLabel: z.string(),
  statusName: z.string(),
  linearUrl: z.string(),
  linearLinkLabel: z.string(),
});

export const cycleAssigneeIssuesDrawerViewModelSchema = z.object({
  isOpen: z.boolean(),
  title: z.string(),
  closeLabel: z.string(),
  issueRows: z.array(cycleAssigneeIssueRowViewModelSchema),
  emptyMessage: z.nullable(z.string()),
  showIssues: z.boolean(),
  showEmptyMessage: z.boolean(),
  showLoading: z.boolean(),
  showError: z.boolean(),
  errorMessage: z.nullable(z.string()),
  loadingMessage: z.nullable(z.string()),
});

export type CycleAssigneeIssueRowViewModel = z.infer<
  typeof cycleAssigneeIssueRowViewModelSchema
>;
export type CycleAssigneeIssuesDrawerViewModel = z.infer<
  typeof cycleAssigneeIssuesDrawerViewModelSchema
>;
