import { type z } from 'zod';
import {
  type synchronizationResponseSchema,
  type teamDashboardResponseSchema,
  type workspaceDashboardDataResponseSchema,
  type workspaceDashboardEmptyResponseSchema,
  type workspaceDashboardResponseSchema,
} from './workspace-dashboard.response.schema.ts';

export type TeamDashboardResponse = z.infer<typeof teamDashboardResponseSchema>;
export type SynchronizationResponse = z.infer<
  typeof synchronizationResponseSchema
>;
export type WorkspaceDashboardDataResponse = z.infer<
  typeof workspaceDashboardDataResponseSchema
>;
export type WorkspaceDashboardEmptyResponse = z.infer<
  typeof workspaceDashboardEmptyResponseSchema
>;
export type WorkspaceDashboardResponse = z.infer<
  typeof workspaceDashboardResponseSchema
>;
