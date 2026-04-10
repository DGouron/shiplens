import { DriftingIssue } from '@modules/analytics/entities/drifting-issue/drifting-issue.js';
import { describe, expect, it } from 'vitest';

const PARIS = 'Europe/Paris';

function makeInput(overrides: Record<string, unknown> = {}) {
  return {
    issueExternalId: 'ISSUE-1',
    issueTitle: 'Fix login bug',
    issueUuid: 'uuid-1',
    teamId: 'team-1',
    points: 3,
    statusName: 'In Progress',
    statusType: 'started',
    startedAt: '2026-04-06T07:00:00Z', // Monday 9h Paris
    ...overrides,
  };
}

describe('DriftingIssue', () => {
  describe('drifting detection', () => {
    it('detects a drifting 1-point ticket (8h elapsed > 4h max)', () => {
      const input = makeInput({
        points: 1,
        startedAt: '2026-04-06T07:00:00Z', // Monday 9h Paris
      });
      const now = '2026-04-06T15:00:00Z'; // Monday 17h Paris = 8h elapsed

      const result = DriftingIssue.analyze(input, now, PARIS);

      expect(result).not.toBeNull();
      expect(result?.driftStatus).toBe('drifting');
      expect(result?.elapsedBusinessHours).toBe(8);
      expect(result?.expectedMaxHours).toBe(4);
    });

    it('detects a drifting 5-point ticket (32h elapsed > 20h max)', () => {
      const input = makeInput({
        points: 5,
        startedAt: '2026-04-06T07:00:00Z', // Monday 9h Paris
      });
      const now = '2026-04-09T12:00:00Z'; // Thursday 14h Paris = 32h elapsed

      const result = DriftingIssue.analyze(input, now, PARIS);

      expect(result).not.toBeNull();
      expect(result?.driftStatus).toBe('drifting');
      expect(result?.elapsedBusinessHours).toBe(32);
      expect(result?.expectedMaxHours).toBe(20);
    });

    it('reports on-track for a 3-point ticket with 6h elapsed (< 8h max)', () => {
      const input = makeInput({
        points: 3,
        startedAt: '2026-04-06T07:00:00Z', // Monday 9h Paris
      });
      const now = '2026-04-06T13:00:00Z'; // Monday 15h Paris = 6h elapsed

      const result = DriftingIssue.analyze(input, now, PARIS);

      expect(result).not.toBeNull();
      expect(result?.driftStatus).toBe('on-track');
      expect(result?.elapsedBusinessHours).toBe(6);
      expect(result?.expectedMaxHours).toBe(8);
      expect(result?.isAlert).toBe(false);
    });
  });

  describe('needs-splitting detection', () => {
    it('flags 8-point ticket as needs-splitting immediately', () => {
      const input = makeInput({ points: 8 });
      const now = '2026-04-06T07:00:00Z';

      const result = DriftingIssue.analyze(input, now, PARIS);

      expect(result).not.toBeNull();
      expect(result?.driftStatus).toBe('needs-splitting');
      expect(result?.needsSplitting).toBe(true);
      expect(result?.isAlert).toBe(true);
    });

    it('flags 13-point ticket as needs-splitting immediately', () => {
      const input = makeInput({ points: 13 });
      const now = '2026-04-06T07:00:00Z';

      const result = DriftingIssue.analyze(input, now, PARIS);

      expect(result).not.toBeNull();
      expect(result?.driftStatus).toBe('needs-splitting');
    });
  });

  describe('exclusions', () => {
    it('returns null for tickets without estimation', () => {
      const input = makeInput({ points: null });
      const now = '2026-04-10T07:00:00Z';

      const result = DriftingIssue.analyze(input, now, PARIS);

      expect(result).toBeNull();
    });

    it('returns null for completed tickets', () => {
      const input = makeInput({ statusType: 'completed' });
      const now = '2026-04-06T15:00:00Z';

      const result = DriftingIssue.analyze(input, now, PARIS);

      expect(result).toBeNull();
    });

    it('returns null for canceled tickets', () => {
      const input = makeInput({ statusType: 'canceled' });
      const now = '2026-04-06T15:00:00Z';

      const result = DriftingIssue.analyze(input, now, PARIS);

      expect(result).toBeNull();
    });

    it('returns null for tickets not yet started (no startedAt)', () => {
      const input = makeInput({ points: 3, startedAt: null });
      const now = '2026-04-06T15:00:00Z';

      const result = DriftingIssue.analyze(input, now, PARIS);

      expect(result).toBeNull();
    });
  });

  describe('business hours with weekend/evening', () => {
    it('counts only business hours across weekend (Fri 16h → Mon 10h = 3h)', () => {
      const input = makeInput({
        points: 1,
        startedAt: '2026-04-10T14:00:00Z', // Friday 16h Paris
      });
      const now = '2026-04-13T08:00:00Z'; // Monday 10h Paris

      const result = DriftingIssue.analyze(input, now, PARIS);

      expect(result).not.toBeNull();
      expect(result?.elapsedBusinessHours).toBe(3);
      expect(result?.driftStatus).toBe('on-track'); // 3h < 4h max
    });

    it('counts only business hours across evening (Mon 17h → Tue 10h = 2h)', () => {
      const input = makeInput({
        points: 1,
        startedAt: '2026-04-06T15:00:00Z', // Monday 17h Paris
      });
      const now = '2026-04-07T08:00:00Z'; // Tuesday 10h Paris

      const result = DriftingIssue.analyze(input, now, PARIS);

      expect(result).not.toBeNull();
      expect(result?.elapsedBusinessHours).toBe(2);
      expect(result?.driftStatus).toBe('on-track'); // 2h < 4h max
    });
  });

  describe('entity properties', () => {
    it('exposes all issue properties', () => {
      const input = makeInput();
      const now = '2026-04-06T13:00:00Z';

      const result = DriftingIssue.analyze(input, now, PARIS);

      expect(result?.issueExternalId).toBe('ISSUE-1');
      expect(result?.issueTitle).toBe('Fix login bug');
      expect(result?.issueUuid).toBe('uuid-1');
      expect(result?.teamId).toBe('team-1');
      expect(result?.points).toBe(3);
      expect(result?.statusName).toBe('In Progress');
    });
  });
});
