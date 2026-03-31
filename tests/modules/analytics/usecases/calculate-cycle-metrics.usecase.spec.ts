import { describe, it, expect, beforeEach } from 'vitest';
import { CalculateCycleMetricsUsecase } from '@modules/analytics/usecases/calculate-cycle-metrics.usecase.js';
import { StubCycleMetricsDataGateway } from '@modules/analytics/testing/good-path/stub.cycle-metrics-data.gateway.js';
import { CycleNotCompletedError } from '@modules/analytics/entities/cycle-snapshot/cycle-snapshot.errors.js';
import { NoCycleIssuesError } from '@modules/analytics/entities/cycle-snapshot/cycle-snapshot.errors.js';
import { InsufficientHistoryError } from '@modules/analytics/entities/cycle-snapshot/cycle-snapshot.errors.js';

describe('CalculateCycleMetricsUsecase', () => {
  let gateway: StubCycleMetricsDataGateway;
  let usecase: CalculateCycleMetricsUsecase;

  beforeEach(() => {
    gateway = new StubCycleMetricsDataGateway();
    usecase = new CalculateCycleMetricsUsecase(gateway);
  });

  it('returns metrics for a completed cycle', async () => {
    gateway.snapshotData = {
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
          points: 5,
          createdAt: '2026-01-01T00:00:00Z',
          completedAt: '2026-01-10T00:00:00Z',
          startedAt: '2026-01-05T00:00:00Z',
        },
      ],
    };

    const result = await usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' });

    expect(result.velocity.completedPoints).toBe(5);
    expect(result.velocity.plannedPoints).toBe(5);
    expect(result.throughput).toBe(1);
    expect(result.completionRate).toBe(100);
    expect(result.scopeCreep).toBe(0);
  });

  it('throws CycleNotCompletedError for future cycle', async () => {
    gateway.snapshotData = {
      cycleId: 'cycle-1',
      teamId: 'team-1',
      cycleName: 'Sprint 10',
      startsAt: '2026-01-01T00:00:00Z',
      endsAt: '2099-12-31T00:00:00Z',
      issues: [],
    };

    await expect(
      usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' }),
    ).rejects.toThrow(CycleNotCompletedError);
  });

  it('throws NoCycleIssuesError for empty cycle', async () => {
    gateway.snapshotData = {
      cycleId: 'cycle-1',
      teamId: 'team-1',
      cycleName: 'Sprint 10',
      startsAt: '2026-01-01T00:00:00Z',
      endsAt: '2026-01-14T00:00:00Z',
      issues: [],
    };

    await expect(
      usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' }),
    ).rejects.toThrow(NoCycleIssuesError);
  });

  it('includes trend when requested and enough history exists', async () => {
    gateway.snapshotData = {
      cycleId: 'cycle-4',
      teamId: 'team-1',
      cycleName: 'Sprint 13',
      startsAt: '2026-03-01T00:00:00Z',
      endsAt: '2026-03-14T00:00:00Z',
      issues: [
        {
          externalId: 'issue-1',
          title: 'Issue 1',
          statusName: 'Done',
          points: 3,
          createdAt: '2026-03-01T00:00:00Z',
          completedAt: '2026-03-10T00:00:00Z',
          startedAt: '2026-03-05T00:00:00Z',
        },
      ],
    };
    gateway.previousCompletedCycleCount = 3;
    gateway.previousVelocities = [18, 20, 22];

    const result = await usecase.execute({
      cycleId: 'cycle-4',
      teamId: 'team-1',
      includeTrend: true,
    });

    expect(result.trend).toBeDefined();
    expect(result.trend?.previousVelocities).toEqual([18, 20, 22]);
  });

  it('throws InsufficientHistoryError when trend requested with insufficient history', async () => {
    gateway.snapshotData = {
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
      ],
    };
    gateway.previousCompletedCycleCount = 2;
    gateway.previousVelocities = [18, 20];

    await expect(
      usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1', includeTrend: true }),
    ).rejects.toThrow(InsufficientHistoryError);
  });

  it('does not include trend when not requested', async () => {
    gateway.snapshotData = {
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
      ],
    };

    const result = await usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' });

    expect(result.trend).toBeUndefined();
  });
});
