import { z } from 'zod';

export const workspaceLanguageResponseSchema = z.object({
  language: z.string(),
});
