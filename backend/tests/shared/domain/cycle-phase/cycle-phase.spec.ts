import { InvalidCyclePhaseRangeError } from '@shared/domain/cycle-phase/cycle-phase.errors.js';
import { describe, expect, it } from 'vitest';
import { CyclePhaseBuilder } from '../../../builders/cycle-phase.builder.js';

describe('CyclePhase', () => {
  describe('early phase', () => {
    it('classifies day 2 of 14 as early phase', () => {
      const phase = new CyclePhaseBuilder()
        .withCycleDurationDays(14)
        .withDayOfCycle(2)
        .build();

      expect(phase.label).toBe('early');
    });

    it('expects 14 percent completion at day 2 of 14', () => {
      const phase = new CyclePhaseBuilder()
        .withCycleDurationDays(14)
        .withDayOfCycle(2)
        .build();

      expect(phase.expectedCompletionRate()).toBeCloseTo(14.2857, 3);
    });

    it('returns on-track verdict when actual 13.4% matches expected 14%', () => {
      const phase = new CyclePhaseBuilder()
        .withCycleDurationDays(14)
        .withDayOfCycle(2)
        .build();

      expect(phase.verdict(13.4, phase.expectedCompletionRate())).toBe(
        'on-track',
      );
    });

    it('returns ahead verdict when actual 35% beats expected 14% by more than tolerance', () => {
      const phase = new CyclePhaseBuilder()
        .withCycleDurationDays(14)
        .withDayOfCycle(2)
        .build();

      expect(phase.verdict(35, phase.expectedCompletionRate())).toBe('ahead');
    });
  });

  describe('mid phase', () => {
    it('classifies day 7 of 14 as mid phase', () => {
      const phase = new CyclePhaseBuilder()
        .withCycleDurationDays(14)
        .withDayOfCycle(7)
        .build();

      expect(phase.label).toBe('mid');
    });

    it('returns behind verdict when actual 20% trails expected 50% by more than tolerance', () => {
      const phase = new CyclePhaseBuilder()
        .withCycleDurationDays(14)
        .withDayOfCycle(7)
        .build();

      expect(phase.verdict(20, 50)).toBe('behind');
    });
  });

  describe('late phase', () => {
    it('classifies day 12 of 14 as late phase', () => {
      const phase = new CyclePhaseBuilder()
        .withCycleDurationDays(14)
        .withDayOfCycle(12)
        .build();

      expect(phase.label).toBe('late');
    });

    it('returns on-track verdict when actual 80% is within tolerance of expected 86%', () => {
      const phase = new CyclePhaseBuilder()
        .withCycleDurationDays(14)
        .withDayOfCycle(12)
        .build();

      expect(phase.verdict(80, 85.71)).toBe('on-track');
    });
  });

  describe('not-started phase', () => {
    it('classifies a cycle whose now is before startsAt as not-started', () => {
      const phase = new CyclePhaseBuilder()
        .withStartsAt(new Date('2026-02-01T00:00:00Z'))
        .withEndsAt(new Date('2026-02-15T00:00:00Z'))
        .withNow(new Date('2026-01-20T00:00:00Z'))
        .build();

      expect(phase.label).toBe('not-started');
    });

    it('returns elapsedTimeRatio 0 for not-started phase', () => {
      const phase = new CyclePhaseBuilder()
        .withStartsAt(new Date('2026-02-01T00:00:00Z'))
        .withEndsAt(new Date('2026-02-15T00:00:00Z'))
        .withNow(new Date('2026-01-20T00:00:00Z'))
        .build();

      expect(phase.elapsedTimeRatio).toBe(0);
    });

    it('returns not-applicable verdict for not-started phase regardless of actual', () => {
      const phase = new CyclePhaseBuilder()
        .withStartsAt(new Date('2026-02-01T00:00:00Z'))
        .withEndsAt(new Date('2026-02-15T00:00:00Z'))
        .withNow(new Date('2026-01-20T00:00:00Z'))
        .build();

      expect(phase.verdict(50, 0)).toBe('not-applicable');
    });

    it('returns 0 expected completion rate for not-started phase', () => {
      const phase = new CyclePhaseBuilder()
        .withStartsAt(new Date('2026-02-01T00:00:00Z'))
        .withEndsAt(new Date('2026-02-15T00:00:00Z'))
        .withNow(new Date('2026-01-20T00:00:00Z'))
        .build();

      expect(phase.expectedCompletionRate()).toBe(0);
    });
  });

  describe('complete phase', () => {
    it('classifies a cycle whose now is past endsAt as complete', () => {
      const phase = new CyclePhaseBuilder()
        .withCycleDurationDays(14)
        .withDayOfCycle(20)
        .build();

      expect(phase.label).toBe('complete');
    });

    it('returns elapsedTimeRatio 1 for complete phase', () => {
      const phase = new CyclePhaseBuilder()
        .withCycleDurationDays(14)
        .withDayOfCycle(14)
        .build();

      expect(phase.elapsedTimeRatio).toBe(1);
    });

    it('caps elapsedTimeRatio at 1 when now overshoots endsAt', () => {
      const phase = new CyclePhaseBuilder()
        .withCycleDurationDays(14)
        .withDayOfCycle(20)
        .build();

      expect(phase.elapsedTimeRatio).toBe(1);
    });
  });

  describe('verdict tolerance edges', () => {
    it('treats actual exactly 10pp above expected as on-track', () => {
      const phase = new CyclePhaseBuilder().build();

      expect(phase.verdict(60, 50)).toBe('on-track');
    });

    it('treats actual exactly 10pp below expected as on-track', () => {
      const phase = new CyclePhaseBuilder().build();

      expect(phase.verdict(40, 50)).toBe('on-track');
    });

    it('treats actual more than 10pp above expected as ahead', () => {
      const phase = new CyclePhaseBuilder().build();

      expect(phase.verdict(60.01, 50)).toBe('ahead');
    });

    it('treats actual more than 10pp below expected as behind', () => {
      const phase = new CyclePhaseBuilder().build();

      expect(phase.verdict(39.99, 50)).toBe('behind');
    });
  });

  describe('expected delivered points', () => {
    it('expected delivered points scales committed points by elapsed ratio', () => {
      const phase = new CyclePhaseBuilder()
        .withCycleDurationDays(14)
        .withDayOfCycle(7)
        .build();

      expect(phase.expectedDeliveredPoints(40)).toBe(20);
    });
  });

  describe('invalid range', () => {
    it('throws InvalidCyclePhaseRangeError when endsAt equals startsAt', () => {
      const sameInstant = new Date('2026-01-01T00:00:00Z');

      expect(() =>
        new CyclePhaseBuilder()
          .withStartsAt(sameInstant)
          .withEndsAt(sameInstant)
          .withNow(sameInstant)
          .build(),
      ).toThrow(InvalidCyclePhaseRangeError);
    });

    it('throws InvalidCyclePhaseRangeError when endsAt precedes startsAt', () => {
      expect(() =>
        new CyclePhaseBuilder()
          .withStartsAt(new Date('2026-01-15T00:00:00Z'))
          .withEndsAt(new Date('2026-01-01T00:00:00Z'))
          .withNow(new Date('2026-01-10T00:00:00Z'))
          .build(),
      ).toThrow(InvalidCyclePhaseRangeError);
    });
  });

  describe('phase boundaries', () => {
    it('treats elapsedTimeRatio 0.25 as mid phase', () => {
      const phase = new CyclePhaseBuilder()
        .withStartsAt(new Date('2026-01-01T00:00:00Z'))
        .withEndsAt(new Date('2026-01-05T00:00:00Z'))
        .withNow(new Date('2026-01-02T00:00:00Z'))
        .build();

      expect(phase.elapsedTimeRatio).toBe(0.25);
      expect(phase.label).toBe('mid');
    });

    it('treats elapsedTimeRatio 0.7499 as mid phase', () => {
      const startsAt = new Date('2026-01-01T00:00:00Z');
      const endsAt = new Date('2026-01-11T00:00:00Z');
      const elapsedMs = (endsAt.getTime() - startsAt.getTime()) * 0.7499;
      const now = new Date(startsAt.getTime() + elapsedMs);

      const phase = new CyclePhaseBuilder()
        .withStartsAt(startsAt)
        .withEndsAt(endsAt)
        .withNow(now)
        .build();

      expect(phase.label).toBe('mid');
    });

    it('treats elapsedTimeRatio 0.75 as late phase', () => {
      const phase = new CyclePhaseBuilder()
        .withStartsAt(new Date('2026-01-01T00:00:00Z'))
        .withEndsAt(new Date('2026-01-05T00:00:00Z'))
        .withNow(new Date('2026-01-04T00:00:00Z'))
        .build();

      expect(phase.elapsedTimeRatio).toBe(0.75);
      expect(phase.label).toBe('late');
    });

    it('treats elapsedTimeRatio 0.999 as late phase', () => {
      const startsAt = new Date('2026-01-01T00:00:00Z');
      const endsAt = new Date('2026-01-11T00:00:00Z');
      const elapsedMs = (endsAt.getTime() - startsAt.getTime()) * 0.999;
      const now = new Date(startsAt.getTime() + elapsedMs);

      const phase = new CyclePhaseBuilder()
        .withStartsAt(startsAt)
        .withEndsAt(endsAt)
        .withNow(now)
        .build();

      expect(phase.label).toBe('late');
    });

    it('treats elapsedTimeRatio exactly 1 as complete phase', () => {
      const phase = new CyclePhaseBuilder()
        .withStartsAt(new Date('2026-01-01T00:00:00Z'))
        .withEndsAt(new Date('2026-01-05T00:00:00Z'))
        .withNow(new Date('2026-01-05T00:00:00Z'))
        .build();

      expect(phase.elapsedTimeRatio).toBe(1);
      expect(phase.label).toBe('complete');
    });
  });
});
