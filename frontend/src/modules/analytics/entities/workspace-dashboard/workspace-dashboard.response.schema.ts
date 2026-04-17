import { z } from 'zod';

export const teamDashboardResponseSchema = z.object({
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

export const synchronizationResponseSchema = z.object({
  lastSyncDate: z.nullable(z.string()),
  isLate: z.boolean(),
  lateWarning: z.nullable(z.string()),
  nextSync: z.string(),
});

export const workspaceDashboardDataResponseSchema = z.object({
  workspaceId: z.string(),
  teams: z.array(teamDashboardResponseSchema),
  synchronization: synchronizationResponseSchema,
});

export const workspaceDashboardEmptyResponseSchema = z.object({
  status: z.enum(['not_connected', 'no_teams']),
  message: z.string(),
});

export const workspaceDashboardResponseSchema = z.union([
  workspaceDashboardDataResponseSchema,
  workspaceDashboardEmptyResponseSchema,
]);
