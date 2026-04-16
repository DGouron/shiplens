import { z } from 'zod';

export const teamOptionViewModelSchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
});

export const cycleOptionViewModelSchema = z.object({
  cycleId: z.string(),
  label: z.string(),
  status: z.enum(['in_progress', 'completed']),
});

export const sectionPlaceholderViewModelSchema = z.object({
  id: z.enum([
    'metrics',
    'bottlenecks',
    'blocked',
    'estimation',
    'drifting',
    'ai-report',
  ]),
  title: z.string(),
  canRenderContent: z.boolean(),
});

export const cycleReportShellViewModelSchema = z.object({
  heading: z.string(),
  teamSelector: z.object({
    label: z.string(),
    placeholder: z.string(),
    selectedTeamId: z.nullable(z.string()),
    options: z.array(teamOptionViewModelSchema),
  }),
  cycleSelector: z.nullable(
    z.object({
      label: z.string(),
      placeholder: z.string(),
      selectedCycleId: z.nullable(z.string()),
      options: z.array(cycleOptionViewModelSchema),
    }),
  ),
  emptyPrompt: z.nullable(z.string()),
  sectionPlaceholders: z.array(sectionPlaceholderViewModelSchema),
});

export type TeamOptionViewModel = z.infer<typeof teamOptionViewModelSchema>;
export type CycleOptionViewModel = z.infer<typeof cycleOptionViewModelSchema>;
export type SectionPlaceholderViewModel = z.infer<
  typeof sectionPlaceholderViewModelSchema
>;
export type SectionPlaceholderId = SectionPlaceholderViewModel['id'];
export type CycleReportShellViewModel = z.infer<
  typeof cycleReportShellViewModelSchema
>;
