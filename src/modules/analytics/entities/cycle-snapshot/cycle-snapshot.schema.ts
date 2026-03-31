import { z } from 'zod';

export const cycleIssueSchema = z.object({
  externalId: z.string().min(1),
  title: z.string().min(1),
  statusName: z.string().min(1),
  points: z.number().nullable(),
  createdAt: z.string().min(1),
  completedAt: z.string().nullable(),
  startedAt: z.string().nullable(),
});

export type CycleIssue = z.infer<typeof cycleIssueSchema>;

export const cycleSnapshotSchema = z.object({
  cycleId: z.string().min(1),
  teamId: z.string().min(1),
  cycleName: z.string().min(1),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  issues: z.array(cycleIssueSchema),
});

export type CycleSnapshotProps = z.infer<typeof cycleSnapshotSchema>;
