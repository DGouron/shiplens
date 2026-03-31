import { createGuard } from '@shared/foundation/guard/guard.js';
import { sprintReportPropsSchema } from './sprint-report.schema.js';

export const sprintReportGuard = createGuard(
  sprintReportPropsSchema,
  'SprintReport',
);
