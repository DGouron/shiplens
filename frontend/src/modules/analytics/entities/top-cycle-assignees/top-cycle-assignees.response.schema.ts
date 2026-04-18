import { z } from 'zod';

export const topCycleAssigneeRowResponseSchema = z.object({
  assigneeName: z.string(),
  issueCount: z.number(),
  totalPoints: z.number(),
  totalCycleTimeInHours: z.nullable(z.number()),
});

export const topCycleAssigneesResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('no_active_cycle') }),
  z.object({
    status: z.literal('ready'),
    cycleId: z.string(),
    cycleName: z.string(),
    assignees: z.array(topCycleAssigneeRowResponseSchema),
  }),
]);

export const cycleAssigneeIssueRowResponseSchema = z.object({
  externalId: z.string(),
  title: z.string(),
  points: z.nullable(z.number()),
  totalCycleTimeInHours: z.nullable(z.number()),
  statusName: z.string(),
});

export const cycleAssigneeIssuesResponseSchema = z.discriminatedUnion(
  'status',
  [
    z.object({ status: z.literal('no_active_cycle') }),
    z.object({
      status: z.literal('ready'),
      cycleId: z.string(),
      assigneeName: z.string(),
      issues: z.array(cycleAssigneeIssueRowResponseSchema),
    }),
  ],
);
