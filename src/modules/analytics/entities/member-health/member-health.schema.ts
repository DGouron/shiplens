import { z } from 'zod';

export const memberHealthCycleSnapshotSchema = z.object({
  cycleId: z.string().min(1),
  estimationScorePercent: z.number().nullable(),
  underestimationRatioPercent: z.number().nullable(),
  averageCycleTimeInDays: z.number().nullable(),
  driftingTicketCount: z.number().nullable(),
  medianReviewTimeInHours: z.number().nullable(),
});

export type MemberHealthCycleSnapshot = z.infer<
  typeof memberHealthCycleSnapshotSchema
>;

export const memberHealthPropsSchema = z.object({
  teamId: z.string().min(1),
  memberName: z.string().min(1),
  cycleSnapshots: z.array(memberHealthCycleSnapshotSchema),
});

export type MemberHealthProps = z.infer<typeof memberHealthPropsSchema>;
