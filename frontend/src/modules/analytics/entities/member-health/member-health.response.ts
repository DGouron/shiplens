import { type z } from 'zod';
import {
  type memberHealthResponseSchema,
  type memberHealthSignalResponseSchema,
  type signalIndicatorSchema,
  type trendSchema,
} from './member-health.response.schema.ts';

export type Trend = z.infer<typeof trendSchema>;
export type SignalIndicator = z.infer<typeof signalIndicatorSchema>;
export type MemberHealthSignalResponse = z.infer<
  typeof memberHealthSignalResponseSchema
>;
export type MemberHealthResponse = z.infer<typeof memberHealthResponseSchema>;
