import { z } from 'zod';

export const sprintReportSectionSchema = z.object({
  executiveSummary: z.string().min(1),
  trends: z.string().nullable(),
  highlights: z.string().min(1),
  risks: z.string().min(1),
  recommendations: z.string().min(1),
});

export type SprintReportSection = z.infer<typeof sprintReportSectionSchema>;

export const sprintReportPropsSchema = z.object({
  cycleId: z.string().min(1),
  teamId: z.string().min(1),
  cycleName: z.string().min(1),
  language: z.enum(['FR', 'EN']),
  sections: sprintReportSectionSchema,
});

export type SprintReportProps = z.infer<typeof sprintReportPropsSchema>;
