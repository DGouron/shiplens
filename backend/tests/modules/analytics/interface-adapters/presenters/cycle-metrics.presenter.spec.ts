import { CycleMetricsPresenter } from '@modules/analytics/interface-adapters/presenters/cycle-metrics.presenter.js';
import { describe, expect, it } from 'vitest';

describe('CycleMetricsPresenter', () => {
  const presenter = new CycleMetricsPresenter();

  it('presents metrics as raw numeric DTO', () => {
    const result = presenter.present({
      velocity: { completedPoints: 21, plannedPoints: 25 },
      throughput: 8,
      completionRate: 80,
      scopeCreep: 3,
      averageCycleTimeInDays: 5.5,
      averageLeadTimeInDays: 9.5,
    });

    expect(result.velocity).toEqual({ completedPoints: 21, plannedPoints: 25 });
    expect(result.throughput).toBe(8);
    expect(result.completionRate).toBe(80);
    expect(result.scopeCreep).toBe(3);
    expect(result.averageCycleTimeInDays).toBe(5.5);
    expect(result.averageLeadTimeInDays).toBe(9.5);
    expect(result.trend).toBeUndefined();
  });

  it('preserves null cycle time and lead time for cycles with no completed issues', () => {
    const result = presenter.present({
      velocity: { completedPoints: 0, plannedPoints: 5 },
      throughput: 0,
      completionRate: 0,
      scopeCreep: 0,
      averageCycleTimeInDays: null,
      averageLeadTimeInDays: null,
    });

    expect(result.averageCycleTimeInDays).toBeNull();
    expect(result.averageLeadTimeInDays).toBeNull();
  });

  it('preserves floating-point precision for cycle and lead times', () => {
    const result = presenter.present({
      velocity: { completedPoints: 10, plannedPoints: 20 },
      throughput: 5,
      completionRate: 50,
      scopeCreep: 0,
      averageCycleTimeInDays: 2.5556056215524032,
      averageLeadTimeInDays: 7.123456789,
    });

    expect(result.averageCycleTimeInDays).toBe(2.5556056215524032);
    expect(result.averageLeadTimeInDays).toBe(7.123456789);
  });

  it('presents trend when included', () => {
    const result = presenter.present({
      velocity: { completedPoints: 21, plannedPoints: 25 },
      throughput: 8,
      completionRate: 80,
      scopeCreep: 0,
      averageCycleTimeInDays: 5,
      averageLeadTimeInDays: 9,
      trend: { previousVelocities: [18, 20, 22] },
    });

    expect(result.trend).toBeDefined();
    expect(result.trend?.previousVelocities).toEqual([18, 20, 22]);
  });
});
