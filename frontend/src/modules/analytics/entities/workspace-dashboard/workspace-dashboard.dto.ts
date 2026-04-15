import { type z } from 'zod';
import {
  type synchronizationDtoSchema,
  type teamDashboardDtoSchema,
  type workspaceDashboardDataDtoSchema,
  type workspaceDashboardEmptyDtoSchema,
  type workspaceDashboardResponseSchema,
} from './workspace-dashboard.dto.schema.ts';

export type TeamDashboardDto = z.infer<typeof teamDashboardDtoSchema>;
export type SynchronizationDto = z.infer<typeof synchronizationDtoSchema>;
export type WorkspaceDashboardDataDto = z.infer<
  typeof workspaceDashboardDataDtoSchema
>;
export type WorkspaceDashboardEmptyDto = z.infer<
  typeof workspaceDashboardEmptyDtoSchema
>;
export type WorkspaceDashboardDto = z.infer<
  typeof workspaceDashboardResponseSchema
>;
