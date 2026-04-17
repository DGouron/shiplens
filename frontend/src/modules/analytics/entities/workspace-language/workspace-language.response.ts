import { type z } from 'zod';
import { type workspaceLanguageResponseSchema } from './workspace-language.response.schema.ts';

export type WorkspaceLanguageResponse = z.infer<
  typeof workspaceLanguageResponseSchema
>;
