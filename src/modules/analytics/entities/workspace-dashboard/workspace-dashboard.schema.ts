import { z } from 'zod';

export const teamSummarySchema = z.object({
  teamId: z.string().min(1),
  teamName: z.string().min(1),
});

export type TeamSummary = z.infer<typeof teamSummarySchema>;

export const activeCycleDataSchema = z.object({
  cycleId: z.string().min(1),
  cycleName: z.string().min(1),
  totalIssues: z.number().int().min(0),
  completedIssues: z.number().int().min(0),
  blockedIssues: z.number().int().min(0),
  totalPoints: z.number().int().min(0),
  completedPoints: z.number().int().min(0),
});

export type ActiveCycleData = z.infer<typeof activeCycleDataSchema>;
