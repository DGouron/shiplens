import {
  DRIFT_GRID,
  getMaxBusinessHours,
  requiresSplitting,
} from '@modules/analytics/entities/drifting-issue/drift-grid.js';
import { describe, expect, it } from 'vitest';

describe('drift grid', () => {
  describe('getMaxBusinessHours', () => {
    it('returns 4h for 1 point', () => {
      expect(getMaxBusinessHours(1)).toBe(4);
    });

    it('returns 6h for 2 points', () => {
      expect(getMaxBusinessHours(2)).toBe(6);
    });

    it('returns 8h for 3 points', () => {
      expect(getMaxBusinessHours(3)).toBe(8);
    });

    it('returns 20h for 5 points', () => {
      expect(getMaxBusinessHours(5)).toBe(20);
    });

    it('returns null for unknown point values', () => {
      expect(getMaxBusinessHours(4)).toBeNull();
      expect(getMaxBusinessHours(7)).toBeNull();
    });

    it('returns null for 8+ points (handled by requiresSplitting)', () => {
      expect(getMaxBusinessHours(8)).toBeNull();
      expect(getMaxBusinessHours(13)).toBeNull();
    });
  });

  describe('requiresSplitting', () => {
    it('returns true for 8 points', () => {
      expect(requiresSplitting(8)).toBe(true);
    });

    it('returns true for 13 points', () => {
      expect(requiresSplitting(13)).toBe(true);
    });

    it('returns true for 21 points', () => {
      expect(requiresSplitting(21)).toBe(true);
    });

    it('returns false for 5 points or less', () => {
      expect(requiresSplitting(1)).toBe(false);
      expect(requiresSplitting(2)).toBe(false);
      expect(requiresSplitting(3)).toBe(false);
      expect(requiresSplitting(5)).toBe(false);
    });
  });

  describe('DRIFT_GRID', () => {
    it('exposes the full grid for display', () => {
      expect(DRIFT_GRID).toEqual([
        { points: 1, maxBusinessHours: 4 },
        { points: 2, maxBusinessHours: 6 },
        { points: 3, maxBusinessHours: 8 },
        { points: 5, maxBusinessHours: 20 },
      ]);
    });
  });
});
