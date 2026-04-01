import { describe, it, expect, beforeEach } from 'vitest';
import { CalculateEstimationAccuracyUsecase } from '@modules/analytics/usecases/calculate-estimation-accuracy.usecase.js';
import { StubEstimationAccuracyDataGateway } from '@modules/analytics/testing/good-path/stub.estimation-accuracy-data.gateway.js';

describe('CalculateEstimationAccuracyUsecase', () => {
  let gateway: StubEstimationAccuracyDataGateway;
  let usecase: CalculateEstimationAccuracyUsecase;

  beforeEach(() => {
    gateway = new StubEstimationAccuracyDataGateway();
    usecase = new CalculateEstimationAccuracyUsecase(gateway);
  });

  it('returns estimation accuracy entity for a cycle', async () => {
    gateway.estimationData = {
      cycleId: 'cycle-1',
      teamId: 'team-1',
      issues: [
        {
          externalId: 'issue-1',
          title: 'Task 1',
          points: 3,
          cycleTimeInDays: 2,
          assigneeName: 'Alice',
          labelNames: ['frontend'],
        },
      ],
      excludedWithoutEstimation: 2,
      excludedWithoutCycleTime: 1,
    };

    const result = await usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' });

    expect(result.ratioPerIssue()).toHaveLength(1);
    expect(result.ratioPerIssue()[0].ratio).toBe(1.5);
    expect(result.excludedWithoutEstimation).toBe(2);
    expect(result.excludedWithoutCycleTime).toBe(1);
  });
});
