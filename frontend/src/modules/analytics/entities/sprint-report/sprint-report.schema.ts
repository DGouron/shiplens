import { z } from 'zod';

export const sprintReportHistoryItemSchema = z.object({
  id: z.string(),
  cycleId: z.string(),
  cycleName: z.string(),
  language: z.string(),
  generatedAt: z.string(),
});

export const sprintReportHistoryResponseSchema = z.object({
  reports: z.array(sprintReportHistoryItemSchema),
});

export const sprintReportDetailResponseSchema = z.object({
  id: z.string(),
  cycleId: z.string(),
  cycleName: z.string(),
  language: z.string(),
  generatedAt: z.string(),
  markdown: z.string(),
  plainText: z.string(),
});
