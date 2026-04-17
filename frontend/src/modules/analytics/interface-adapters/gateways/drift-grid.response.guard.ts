import { createGuard } from '@/shared/foundation/guard/guard.ts';
import { driftGridResponseSchema } from '../../entities/drift-grid/drift-grid.response.schema.ts';

export const driftGridResponseGuard = createGuard(
  driftGridResponseSchema,
  'DriftGridResponse',
);
