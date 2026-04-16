import { type z } from 'zod';
import {
  type statusListResponseSchema,
  type timezoneResponseSchema,
} from './team-settings.response.schema.ts';

export type TimezoneResponse = z.infer<typeof timezoneResponseSchema>;
export type StatusListResponse = z.infer<typeof statusListResponseSchema>;
