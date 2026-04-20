import { z } from 'zod';

export const topCycleThemeRowResponseSchema = z.object({
  name: z.string(),
  issueCount: z.number(),
  totalPoints: z.number(),
  totalCycleTimeInHours: z.nullable(z.number()),
});

export const topCycleThemesResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('no_active_cycle') }),
  z.object({
    status: z.literal('below_threshold'),
    issueCount: z.number(),
  }),
  z.object({ status: z.literal('ai_unavailable') }),
  z.object({
    status: z.literal('ready'),
    cycleId: z.string(),
    cycleName: z.string(),
    language: z.enum(['EN', 'FR']),
    fromCache: z.boolean(),
    themes: z.array(topCycleThemeRowResponseSchema),
  }),
]);

export const cycleThemeIssueRowResponseSchema = z.object({
  externalId: z.string(),
  title: z.string(),
  assigneeName: z.nullable(z.string()),
  points: z.nullable(z.number()),
  statusName: z.string(),
  linearUrl: z.nullable(z.string()),
});

export const cycleThemeIssuesResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('no_active_cycle') }),
  z.object({ status: z.literal('theme_not_found') }),
  z.object({
    status: z.literal('ready'),
    cycleId: z.string(),
    cycleName: z.string(),
    themeName: z.string(),
    issues: z.array(cycleThemeIssueRowResponseSchema),
  }),
]);
