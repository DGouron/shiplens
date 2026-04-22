import { type z } from 'zod';
import {
  type cycleThemeIssueRowResponseSchema,
  type cycleThemeIssuesResponseSchema,
  type topCycleThemeRowResponseSchema,
  type topCycleThemesResponseSchema,
} from './top-cycle-themes.response.schema.ts';

export type TopCycleThemeRowResponse = z.infer<
  typeof topCycleThemeRowResponseSchema
>;
export type TopCycleThemesResponse = z.infer<
  typeof topCycleThemesResponseSchema
>;
export type CycleThemeIssueRowResponse = z.infer<
  typeof cycleThemeIssueRowResponseSchema
>;
export type CycleThemeIssuesResponse = z.infer<
  typeof cycleThemeIssuesResponseSchema
>;
