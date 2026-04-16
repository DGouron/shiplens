import { z } from 'zod';

export const CYCLE_REPORT_URL_PARAM = {
  teamId: 'teamId',
  cycleId: 'cycleId',
  memberName: 'memberName',
} as const;

export const cycleReportUrlQuerySchema = z.object({
  [CYCLE_REPORT_URL_PARAM.teamId]: z.string().nullable(),
  [CYCLE_REPORT_URL_PARAM.cycleId]: z.string().nullable(),
  [CYCLE_REPORT_URL_PARAM.memberName]: z.string().nullable(),
});

export type CycleReportUrlQuery = z.infer<typeof cycleReportUrlQuerySchema>;
