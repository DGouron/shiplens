import { z } from 'zod';

export const TOLERANCE_PERCENTAGE_POINTS = 10;
export const EARLY_PHASE_UPPER_BOUND = 0.25;
export const MID_PHASE_UPPER_BOUND = 0.75;

export const phaseLabelSchema = z.enum([
  'not-started',
  'early',
  'mid',
  'late',
  'complete',
]);

export type PhaseLabel = z.infer<typeof phaseLabelSchema>;

export const verdictSchema = z.enum([
  'ahead',
  'on-track',
  'behind',
  'not-applicable',
]);

export type Verdict = z.infer<typeof verdictSchema>;
