import { z } from 'zod';

export const memberDigestViewModelSchema = z.object({
  showDigest: z.boolean(),
  showEmpty: z.boolean(),
  showGenerateButton: z.boolean(),
  digestMarkdown: z.string(),
  emptyMessage: z.string(),
  generateLabel: z.string(),
  generatingLabel: z.string(),
  copyLabel: z.string(),
  isGenerating: z.boolean(),
  copyConfirmation: z.nullable(z.string()),
  memberName: z.string(),
});

export type MemberDigestViewModel = z.infer<typeof memberDigestViewModelSchema>;
