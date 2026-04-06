import { z } from 'zod';

export const workspaceLanguageSchema = z.enum(['en', 'fr']);

export type Locale = z.infer<typeof workspaceLanguageSchema>;
