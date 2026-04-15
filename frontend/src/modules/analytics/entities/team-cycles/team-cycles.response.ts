import { type z } from 'zod';
import {
  type cycleSummaryResponseSchema,
  type teamCyclesResponseSchema,
} from './team-cycles.response.schema.ts';

export type CycleSummaryResponse = z.infer<typeof cycleSummaryResponseSchema>;
export type TeamCyclesResponse = z.infer<typeof teamCyclesResponseSchema>;
