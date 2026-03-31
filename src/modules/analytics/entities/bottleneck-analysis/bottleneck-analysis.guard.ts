import { createGuard } from '@shared/foundation/guard/guard.js';
import { bottleneckAnalysisSchema } from './bottleneck-analysis.schema.js';

export const bottleneckAnalysisGuard = createGuard(
  bottleneckAnalysisSchema,
  'BottleneckAnalysis',
);
