import { createGuard } from '@/shared/foundation/guard/guard.ts';
import {
  sprintReportDetailResponseSchema,
  sprintReportHistoryResponseSchema,
} from '../../entities/sprint-report/sprint-report.schema.ts';

export const sprintReportHistoryResponseGuard = createGuard(
  sprintReportHistoryResponseSchema,
  'SprintReportHistoryResponse',
);

export const sprintReportDetailResponseGuard = createGuard(
  sprintReportDetailResponseSchema,
  'SprintReportDetailResponse',
);
