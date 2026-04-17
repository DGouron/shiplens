import { z } from 'zod';

export const breadcrumbSchema = z.object({
  label: z.string(),
  href: z.nullable(z.string()),
});

export const languageSectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  currentLanguage: z.string(),
  options: z.array(z.object({ value: z.string(), label: z.string() })),
});

export const teamOptionSchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
});

export const teamSelectorSchema = z.object({
  placeholder: z.string(),
  showLoading: z.boolean(),
  teams: z.array(teamOptionSchema),
  selectedTeamId: z.nullable(z.string()),
});

export const timezoneSectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  currentTimezone: z.string(),
  showEmptyState: z.boolean(),
  emptyStateMessage: z.string(),
});

export const statusToggleSchema = z.object({
  statusName: z.string(),
  isExcluded: z.boolean(),
  toggleLabel: z.string(),
});

export const excludedStatusesSectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  showEmptyState: z.boolean(),
  emptyStateMessage: z.string(),
  showNoStatusesMessage: z.boolean(),
  noStatusesMessage: z.string(),
  statusToggles: z.array(statusToggleSchema),
});

export const driftGridRowSchema = z.object({
  points: z.number(),
  maxDuration: z.string(),
});

export const driftGridSectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  headerPoints: z.string(),
  headerDuration: z.string(),
  rows: z.array(driftGridRowSchema),
  note: z.string(),
});

export const settingsViewModelSchema = z.object({
  pageTitle: z.string(),
  breadcrumbs: z.array(breadcrumbSchema),
  language: languageSectionSchema,
  teamSelector: teamSelectorSchema,
  timezone: timezoneSectionSchema,
  excludedStatuses: excludedStatusesSectionSchema,
  driftGrid: driftGridSectionSchema,
  toastMessage: z.nullable(z.string()),
});

export type BreadcrumbItem = z.infer<typeof breadcrumbSchema>;
export type LanguageSectionViewModel = z.infer<typeof languageSectionSchema>;
export type TeamOption = z.infer<typeof teamOptionSchema>;
export type TeamSelectorViewModel = z.infer<typeof teamSelectorSchema>;
export type TimezoneSectionViewModel = z.infer<typeof timezoneSectionSchema>;
export type StatusToggle = z.infer<typeof statusToggleSchema>;
export type ExcludedStatusesSectionViewModel = z.infer<
  typeof excludedStatusesSectionSchema
>;
export type DriftGridRow = z.infer<typeof driftGridRowSchema>;
export type DriftGridSectionViewModel = z.infer<typeof driftGridSectionSchema>;
export type SettingsViewModel = z.infer<typeof settingsViewModelSchema>;
