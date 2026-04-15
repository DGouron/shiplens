import { z } from 'zod';

export const healthTierSchema = z.enum([
  'healthy',
  'warning',
  'danger',
  'idle',
]);

export const activeTeamCardViewModelSchema = z.object({
  kind: z.literal('active'),
  teamId: z.string(),
  teamName: z.string(),
  cycleName: z.string(),
  completionPercentage: z.number(),
  healthTier: healthTierSchema,
  ringStrokeColor: z.string(),
  ringDashOffset: z.number(),
  velocityText: z.string(),
  blockedIssuesCount: z.number(),
  blockedAlert: z.boolean(),
  reportLink: z.nullable(z.string()),
});

export const idleTeamCardViewModelSchema = z.object({
  kind: z.literal('idle'),
  teamId: z.string(),
  teamName: z.string(),
  noActiveCycleMessage: z.string(),
});

export const teamCardViewModelSchema = z.discriminatedUnion('kind', [
  activeTeamCardViewModelSchema,
  idleTeamCardViewModelSchema,
]);

export const syncStatusViewModelSchema = z.object({
  lastSyncLabel: z.string(),
  isLate: z.boolean(),
  lateWarning: z.nullable(z.string()),
  hasSyncHistory: z.boolean(),
});

export const dashboardViewModelSchema = z.object({
  teams: z.array(teamCardViewModelSchema),
  synchronization: syncStatusViewModelSchema,
});

export type HealthTier = z.infer<typeof healthTierSchema>;
export type ActiveTeamCardViewModel = z.infer<
  typeof activeTeamCardViewModelSchema
>;
export type IdleTeamCardViewModel = z.infer<typeof idleTeamCardViewModelSchema>;
export type TeamCardViewModel = z.infer<typeof teamCardViewModelSchema>;
export type SyncStatusViewModel = z.infer<typeof syncStatusViewModelSchema>;
export type DashboardViewModel = z.infer<typeof dashboardViewModelSchema>;
