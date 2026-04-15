import { createGuard } from '@/shared/foundation/guard/guard.ts';
import { teamCyclesResponseSchema } from '../../entities/team-cycles/team-cycles.response.schema.ts';

export const teamCyclesResponseGuard = createGuard(
  teamCyclesResponseSchema,
  'TeamCyclesResponse',
);
