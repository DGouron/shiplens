import { z } from 'zod';

export const aiReportViewModelSchema = z.object({
  showReport: z.boolean(),
  showEmpty: z.boolean(),
  reportMarkdown: z.string(),
  generatedAtLabel: z.string(),
  emptyMessage: z.string(),
  generateLabel: z.string(),
  generatingLabel: z.string(),
  exportLabel: z.string(),
  copyLabel: z.string(),
  exportFilename: z.string(),
  isGenerating: z.boolean(),
  copyConfirmation: z.nullable(z.string()),
});

export type AiReportViewModel = z.infer<typeof aiReportViewModelSchema>;
