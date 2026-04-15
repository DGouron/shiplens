import { z } from 'zod';

export const teamDashboardDtoSchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
  hasActiveCycle: z.boolean(),
  cycleName: z.nullable(z.string()),
  completionRate: z.string(),
  blockedIssuesCount: z.number(),
  blockedAlert: z.boolean(),
  currentVelocity: z.number(),
  velocityTrendLabel: z.string(),
  reportLink: z.nullable(z.string()),
  noActiveCycleMessage: z.nullable(z.string()),
});

export const synchronizationDtoSchema = z.object({
  lastSyncDate: z.nullable(z.string()),
  isLate: z.boolean(),
  lateWarning: z.nullable(z.string()),
  nextSync: z.string(),
});

export const workspaceDashboardDataDtoSchema = z.object({
  teams: z.array(teamDashboardDtoSchema),
  synchronization: synchronizationDtoSchema,
});

export const workspaceDashboardEmptyDtoSchema = z.object({
  status: z.enum(['not_connected', 'no_teams']),
  message: z.string(),
});

export const workspaceDashboardResponseSchema = z.union([
  workspaceDashboardDataDtoSchema,
  workspaceDashboardEmptyDtoSchema,
]);
