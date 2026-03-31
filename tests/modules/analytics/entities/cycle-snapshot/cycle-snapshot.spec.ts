import { describe, it, expect } from 'vitest';
import { CycleSnapshot } from '@modules/analytics/entities/cycle-snapshot/cycle-snapshot.js';
import { CycleNotCompletedError } from '@modules/analytics/entities/cycle-snapshot/cycle-snapshot.errors.js';
import { NoCycleIssuesError } from '@modules/analytics/entities/cycle-snapshot/cycle-snapshot.errors.js';

describe('CycleSnapshot', () => {
  const completedCycleProps = {
    cycleId: 'cycle-1',
    teamId: 'team-1',
    cycleName: 'Sprint 10',
    startsAt: '2026-01-01T00:00:00Z',
    endsAt: '2026-01-14T00:00:00Z',
    issues: [
      {
        externalId: 'issue-1',
        title: 'Issue 1',
        statusName: 'Done',
        points: 3,
        createdAt: '2026-01-01T00:00:00Z',
        completedAt: '2026-01-10T00:00:00Z',
        startedAt: '2026-01-05T00:00:00Z',
      },
      {
        externalId: 'issue-2',
        title: 'Issue 2',
        statusName: 'In Progress',
        points: 2,
        createdAt: '2026-01-01T00:00:00Z',
        completedAt: null,
        startedAt: '2026-01-05T00:00:00Z',
      },
    ],
  };

  it('creates a cycle snapshot from valid props', () => {
    const snapshot = CycleSnapshot.create(completedCycleProps);

    expect(snapshot.cycleId).toBe('cycle-1');
    expect(snapshot.teamId).toBe('team-1');
    expect(snapshot.cycleName).toBe('Sprint 10');
  });

  it('throws CycleNotCompletedError when cycle end date is in the future', () => {
    expect(() =>
      CycleSnapshot.create({
        ...completedCycleProps,
        endsAt: '2099-12-31T00:00:00Z',
      }),
    ).toThrow(CycleNotCompletedError);
  });

  it('throws NoCycleIssuesError when cycle has no issues', () => {
    expect(() =>
      CycleSnapshot.create({
        ...completedCycleProps,
        issues: [],
      }),
    ).toThrow(NoCycleIssuesError);
  });

  describe('velocity', () => {
    it('computes completed points vs planned points', () => {
      const snapshot = CycleSnapshot.create({
        ...completedCycleProps,
        issues: [
          {
            externalId: 'issue-1',
            title: 'Issue 1',
            statusName: 'Done',
            points: 3,
            createdAt: '2026-01-01T00:00:00Z',
            completedAt: '2026-01-10T00:00:00Z',
            startedAt: '2026-01-05T00:00:00Z',
          },
          {
            externalId: 'issue-2',
            title: 'Issue 2',
            statusName: 'In Progress',
            points: 2,
            createdAt: '2026-01-01T00:00:00Z',
            completedAt: null,
            startedAt: '2026-01-05T00:00:00Z',
          },
        ],
      });

      expect(snapshot.completedPoints).toBe(3);
      expect(snapshot.plannedPoints).toBe(5);
    });

    it('treats null points as zero', () => {
      const snapshot = CycleSnapshot.create({
        ...completedCycleProps,
        issues: [
          {
            externalId: 'issue-1',
            title: 'Issue 1',
            statusName: 'Done',
            points: null,
            createdAt: '2026-01-01T00:00:00Z',
            completedAt: '2026-01-10T00:00:00Z',
            startedAt: '2026-01-05T00:00:00Z',
          },
        ],
      });

      expect(snapshot.completedPoints).toBe(0);
      expect(snapshot.plannedPoints).toBe(0);
    });
  });

  describe('throughput', () => {
    it('counts completed issues', () => {
      const snapshot = CycleSnapshot.create(completedCycleProps);

      expect(snapshot.throughput).toBe(1);
    });
  });

  describe('completion rate', () => {
    it('computes percentage based on initial scope', () => {
      const snapshot = CycleSnapshot.create({
        ...completedCycleProps,
        issues: [
          {
            externalId: 'issue-1',
            title: 'Issue 1',
            statusName: 'Done',
            points: 3,
            createdAt: '2026-01-01T00:00:00Z',
            completedAt: '2026-01-10T00:00:00Z',
            startedAt: '2026-01-05T00:00:00Z',
          },
          {
            externalId: 'issue-2',
            title: 'Issue 2',
            statusName: 'In Progress',
            points: 2,
            createdAt: '2026-01-01T00:00:00Z',
            completedAt: null,
            startedAt: null,
          },
          {
            externalId: 'issue-3',
            title: 'Issue 3 (added after start)',
            statusName: 'Done',
            points: 1,
            createdAt: '2026-01-05T00:00:00Z',
            completedAt: '2026-01-12T00:00:00Z',
            startedAt: '2026-01-06T00:00:00Z',
          },
        ],
      });

      expect(snapshot.completionRate).toBe(50);
    });
  });

  describe('scope creep', () => {
    it('counts issues created after cycle start date', () => {
      const snapshot = CycleSnapshot.create({
        ...completedCycleProps,
        issues: [
          {
            externalId: 'issue-1',
            title: 'Issue 1',
            statusName: 'Done',
            points: 3,
            createdAt: '2026-01-01T00:00:00Z',
            completedAt: '2026-01-10T00:00:00Z',
            startedAt: '2026-01-05T00:00:00Z',
          },
          {
            externalId: 'issue-added',
            title: 'Added Issue',
            statusName: 'Done',
            points: 1,
            createdAt: '2026-01-05T00:00:00Z',
            completedAt: '2026-01-12T00:00:00Z',
            startedAt: '2026-01-06T00:00:00Z',
          },
        ],
      });

      expect(snapshot.scopeCreep).toBe(1);
    });
  });

  describe('cycle time', () => {
    it('computes average days between started and completed', () => {
      const snapshot = CycleSnapshot.create({
        ...completedCycleProps,
        issues: [
          {
            externalId: 'issue-1',
            title: 'Issue 1',
            statusName: 'Done',
            points: 3,
            createdAt: '2026-01-01T00:00:00Z',
            completedAt: '2026-01-10T00:00:00Z',
            startedAt: '2026-01-05T00:00:00Z',
          },
          {
            externalId: 'issue-2',
            title: 'Issue 2',
            statusName: 'Done',
            points: 2,
            createdAt: '2026-01-02T00:00:00Z',
            completedAt: '2026-01-12T00:00:00Z',
            startedAt: '2026-01-06T00:00:00Z',
          },
        ],
      });

      expect(snapshot.averageCycleTimeInDays).toBe(5.5);
    });

    it('excludes issues without startedAt from cycle time', () => {
      const snapshot = CycleSnapshot.create({
        ...completedCycleProps,
        issues: [
          {
            externalId: 'issue-1',
            title: 'Issue 1',
            statusName: 'Done',
            points: 3,
            createdAt: '2026-01-01T00:00:00Z',
            completedAt: '2026-01-10T00:00:00Z',
            startedAt: '2026-01-05T00:00:00Z',
          },
          {
            externalId: 'issue-2',
            title: 'Issue 2',
            statusName: 'Done',
            points: 2,
            createdAt: '2026-01-02T00:00:00Z',
            completedAt: '2026-01-08T00:00:00Z',
            startedAt: null,
          },
        ],
      });

      expect(snapshot.averageCycleTimeInDays).toBe(5);
    });

    it('returns null when no issues have cycle time data', () => {
      const snapshot = CycleSnapshot.create({
        ...completedCycleProps,
        issues: [
          {
            externalId: 'issue-1',
            title: 'Issue 1',
            statusName: 'In Progress',
            points: 3,
            createdAt: '2026-01-01T00:00:00Z',
            completedAt: null,
            startedAt: null,
          },
        ],
      });

      expect(snapshot.averageCycleTimeInDays).toBeNull();
    });
  });

  describe('lead time', () => {
    it('computes average days between creation and completion', () => {
      const snapshot = CycleSnapshot.create({
        ...completedCycleProps,
        issues: [
          {
            externalId: 'issue-1',
            title: 'Issue 1',
            statusName: 'Done',
            points: 3,
            createdAt: '2026-01-01T00:00:00Z',
            completedAt: '2026-01-10T00:00:00Z',
            startedAt: '2026-01-05T00:00:00Z',
          },
          {
            externalId: 'issue-2',
            title: 'Issue 2',
            statusName: 'Done',
            points: 2,
            createdAt: '2026-01-02T00:00:00Z',
            completedAt: '2026-01-12T00:00:00Z',
            startedAt: '2026-01-06T00:00:00Z',
          },
        ],
      });

      expect(snapshot.averageLeadTimeInDays).toBe(9.5);
    });

    it('returns null when no issues are completed', () => {
      const snapshot = CycleSnapshot.create({
        ...completedCycleProps,
        issues: [
          {
            externalId: 'issue-1',
            title: 'Issue 1',
            statusName: 'In Progress',
            points: 3,
            createdAt: '2026-01-01T00:00:00Z',
            completedAt: null,
            startedAt: null,
          },
        ],
      });

      expect(snapshot.averageLeadTimeInDays).toBeNull();
    });
  });
});
