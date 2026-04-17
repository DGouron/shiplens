import { type z } from 'zod';
import {
  type driftGridEntrySchema,
  type driftGridResponseSchema,
} from './drift-grid.response.schema.ts';

export type DriftGridEntry = z.infer<typeof driftGridEntrySchema>;
export type DriftGridResponse = z.infer<typeof driftGridResponseSchema>;
