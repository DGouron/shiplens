import { z } from 'zod';

const MIN_THEME_NAME_LENGTH = 1;
const MAX_THEME_NAME_LENGTH = 60;
const MIN_THEMES = 1;
const MAX_THEMES = 5;

export const cycleThemeSchema = z.object({
  name: z.string().min(MIN_THEME_NAME_LENGTH).max(MAX_THEME_NAME_LENGTH),
  issueExternalIds: z.array(z.string().min(1)).min(1),
});

export const cycleThemeSetPropsSchema = z.object({
  cycleId: z.string().min(1),
  teamId: z.string().min(1),
  language: z.enum(['EN', 'FR']),
  themes: z.array(cycleThemeSchema).min(MIN_THEMES).max(MAX_THEMES),
  generatedAt: z.string().min(1),
});

export const themeIssueDetailSchema = z.object({
  externalId: z.string().min(1),
  title: z.string().min(1),
  assigneeName: z.string().nullable(),
  points: z.number().nullable(),
  statusName: z.string().min(1),
  linearUrl: z.string().nullable(),
});

export const themeCandidateIssueSchema = z.object({
  externalId: z.string().min(1),
  title: z.string().min(1),
  labels: z.array(z.string()),
  points: z.number().nullable(),
  statusName: z.string().min(1),
  assigneeName: z.string().nullable(),
  totalCycleTimeInHours: z.number().nullable(),
  linearUrl: z.string().nullable(),
});

export const activeCycleLocatorSchema = z.object({
  cycleId: z.string().min(1),
  cycleName: z.string().min(1),
});

export type CycleTheme = z.infer<typeof cycleThemeSchema>;
export type CycleThemeSetProps = z.infer<typeof cycleThemeSetPropsSchema>;
export type ThemeIssueDetail = z.infer<typeof themeIssueDetailSchema>;
export type ThemeCandidateIssue = z.infer<typeof themeCandidateIssueSchema>;
export type ActiveCycleLocator = z.infer<typeof activeCycleLocatorSchema>;
