import { createGuard } from '@/shared/foundation/guard/guard.ts';
import { bottleneckAnalysisResponseSchema } from '../../entities/bottleneck-analysis/bottleneck-analysis.response.schema.ts';

export const bottleneckAnalysisResponseGuard = createGuard(
  bottleneckAnalysisResponseSchema,
  'BottleneckAnalysisResponse',
);
