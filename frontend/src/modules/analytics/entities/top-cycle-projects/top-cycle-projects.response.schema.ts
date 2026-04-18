import { z } from 'zod';

export const NO_PROJECT_BUCKET_ID = '__no_project__';

export const topCycleProjectRowResponseSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  isNoProjectBucket: z.boolean(),
  issueCount: z.number(),
  totalPoints: z.number(),
  totalCycleTimeInHours: z.nullable(z.number()),
});

export const topCycleProjectsResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('no_active_cycle') }),
  z.object({
    status: z.literal('ready'),
    cycleId: z.string(),
    cycleName: z.string(),
    projects: z.array(topCycleProjectRowResponseSchema),
  }),
]);

export const cycleProjectIssueRowResponseSchema = z.object({
  externalId: z.string(),
  title: z.string(),
  assigneeName: z.nullable(z.string()),
  points: z.nullable(z.number()),
  statusName: z.string(),
});

export const cycleProjectIssuesResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('no_active_cycle') }),
  z.object({
    status: z.literal('ready'),
    cycleId: z.string(),
    projectId: z.string(),
    projectName: z.string(),
    isNoProjectBucket: z.boolean(),
    issues: z.array(cycleProjectIssueRowResponseSchema),
  }),
]);
