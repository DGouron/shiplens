import { type z } from 'zod';
import {
  type sprintReportDetailResponseSchema,
  type sprintReportHistoryItemSchema,
  type sprintReportHistoryResponseSchema,
} from './sprint-report.schema.ts';

export type SprintReportHistoryItem = z.infer<
  typeof sprintReportHistoryItemSchema
>;
export type SprintReportHistoryResponse = z.infer<
  typeof sprintReportHistoryResponseSchema
>;
export type SprintReportDetailResponse = z.infer<
  typeof sprintReportDetailResponseSchema
>;
