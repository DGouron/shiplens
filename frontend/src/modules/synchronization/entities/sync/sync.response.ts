import { type z } from 'zod';
import {
  type syncAvailableTeamResponseSchema,
  type syncProjectResponseSchema,
  type syncSelectedProjectResponseSchema,
  type syncSelectedTeamResponseSchema,
  type syncSelectionResponseSchema,
} from './sync.response.schema.ts';

export type SyncProjectResponse = z.infer<typeof syncProjectResponseSchema>;
export type SyncAvailableTeamResponse = z.infer<
  typeof syncAvailableTeamResponseSchema
>;
export type SyncSelectedTeamResponse = z.infer<
  typeof syncSelectedTeamResponseSchema
>;
export type SyncSelectedProjectResponse = z.infer<
  typeof syncSelectedProjectResponseSchema
>;
export type SyncSelectionResponse = z.infer<typeof syncSelectionResponseSchema>;
