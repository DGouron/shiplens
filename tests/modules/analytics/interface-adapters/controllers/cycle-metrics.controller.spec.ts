import { describe, it, expect, beforeEach } from 'vitest';
import { CycleMetricsController } from '@modules/analytics/interface-adapters/controllers/cycle-metrics.controller.js';
import { CalculateCycleMetricsUsecase } from '@modules/analytics/usecases/calculate-cycle-metrics.usecase.js';
import { CycleMetricsPresenter } from '@modules/analytics/interface-adapters/presenters/cycle-metrics.presenter.js';
import { StubCycleMetricsDataGateway } from '@modules/analytics/testing/good-path/stub.cycle-metrics-data.gateway.js';

describe('CycleMetricsController', () => {
  let gateway: StubCycleMetricsDataGateway;
  let controller: CycleMetricsController;

  beforeEach(() => {
    gateway = new StubCycleMetricsDataGateway();
    const usecase = new CalculateCycleMetricsUsecase(gateway);
    const presenter = new CycleMetricsPresenter();
    controller = new CycleMetricsController(usecase, presenter);
  });

  it('returns formatted metrics for a completed cycle', async () => {
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

    const result = await controller.getMetrics('cycle-1', 'team-1');

    expect(result.velocity).toBe('5/5 points');
    expect(result.throughput).toBe('1 issues');
    expect(result.completionRate).toBe('100%');
  });

  it('includes trend when requested', async () => {
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
    gateway.previousCompletedCycleCount = 3;
    gateway.previousVelocities = [18, 20, 22];

    const result = await controller.getMetrics('cycle-1', 'team-1', 'true');

    expect(result.trend).toBeDefined();
    expect(result.trend?.previousVelocities).toEqual([18, 20, 22]);
  });
});
