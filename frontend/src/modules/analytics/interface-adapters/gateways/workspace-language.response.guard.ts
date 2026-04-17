import { createGuard } from '@/shared/foundation/guard/guard.ts';
import { workspaceLanguageResponseSchema } from '../../entities/workspace-language/workspace-language.response.schema.ts';

export const workspaceLanguageResponseGuard = createGuard(
  workspaceLanguageResponseSchema,
  'WorkspaceLanguageResponse',
);
