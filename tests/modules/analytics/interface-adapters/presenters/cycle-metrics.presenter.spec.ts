import { describe, it, expect } from 'vitest';
import { CycleMetricsPresenter } from '@modules/analytics/interface-adapters/presenters/cycle-metrics.presenter.js';

describe('CycleMetricsPresenter', () => {
  const presenter = new CycleMetricsPresenter();

  it('presents metrics as formatted DTO', () => {
    const result = presenter.present({
      velocity: { completedPoints: 21, plannedPoints: 25 },
      throughput: 8,
      completionRate: 80,
      scopeCreep: 3,
      averageCycleTimeInDays: 5.5,
      averageLeadTimeInDays: 9.5,
    });

    expect(result.velocity).toBe('21/25 points');
    expect(result.throughput).toBe('8 issues');
    expect(result.completionRate).toBe('80%');
    expect(result.scopeCreep).toBe('3 issues ajoutees');
    expect(result.averageCycleTime).toBe('5.5 jours');
    expect(result.averageLeadTime).toBe('9.5 jours');
    expect(result.trend).toBeUndefined();
  });

  it('presents null cycle time and lead time as not available', () => {
    const result = presenter.present({
      velocity: { completedPoints: 0, plannedPoints: 5 },
      throughput: 0,
      completionRate: 0,
      scopeCreep: 0,
      averageCycleTimeInDays: null,
      averageLeadTimeInDays: null,
    });

    expect(result.averageCycleTime).toBe('Non disponible');
    expect(result.averageLeadTime).toBe('Non disponible');
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
