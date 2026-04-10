import { InsufficientHistoryForTrendError } from '@modules/analytics/entities/estimation-accuracy/estimation-accuracy.errors.js';
import { EstimationAccuracyController } from '@modules/analytics/interface-adapters/controllers/estimation-accuracy.controller.js';
import { EstimationAccuracyPresenter } from '@modules/analytics/interface-adapters/presenters/estimation-accuracy.presenter.js';
import { StubEstimationAccuracyDataGateway } from '@modules/analytics/testing/good-path/stub.estimation-accuracy-data.gateway.js';
import { CalculateEstimationAccuracyUsecase } from '@modules/analytics/usecases/calculate-estimation-accuracy.usecase.js';
import { GetEstimationTrendUsecase } from '@modules/analytics/usecases/get-estimation-trend.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('EstimationAccuracyController', () => {
  let gateway: StubEstimationAccuracyDataGateway;
  let controller: EstimationAccuracyController;

  beforeEach(() => {
    gateway = new StubEstimationAccuracyDataGateway();
    const calculateAccuracy = new CalculateEstimationAccuracyUsecase(gateway);
    const getEstimationTrend = new GetEstimationTrendUsecase(gateway);
    const presenter = new EstimationAccuracyPresenter();
    controller = new EstimationAccuracyController(
      calculateAccuracy,
      getEstimationTrend,
      presenter,
    );
  });

  it('returns estimation accuracy for a cycle', async () => {
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
      excludedWithoutEstimation: 1,
      excludedWithoutCycleTime: 0,
    };

    const result = await controller.getEstimationAccuracy('team-1', 'cycle-1');

    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].ratio).toBe(1.5);
    expect(result.teamScore.issueCount).toBe(1);
    expect(result.excludedWithoutEstimation).toBe(1);
  });

  it('returns estimation trend for a team', async () => {
    gateway.completedCycleIds = ['cycle-1', 'cycle-2'];
    gateway.estimationDataByCycle = {
      'cycle-1': {
        cycleId: 'cycle-1',
        teamId: 'team-1',
        issues: [
          {
            externalId: 'i-1',
            title: 'T1',
            points: 3,
            cycleTimeInDays: 2,
            assigneeName: 'Alice',
            labelNames: [],
          },
        ],
        excludedWithoutEstimation: 0,
        excludedWithoutCycleTime: 0,
      },
      'cycle-2': {
        cycleId: 'cycle-2',
        teamId: 'team-1',
        issues: [
          {
            externalId: 'i-2',
            title: 'T2',
            points: 2,
            cycleTimeInDays: 2,
            assigneeName: 'Alice',
            labelNames: [],
          },
        ],
        excludedWithoutEstimation: 0,
        excludedWithoutCycleTime: 0,
      },
    };

    const result = await controller.getEstimationTrend('team-1');

    expect(result).toHaveLength(2);
    expect(result[0].cycleId).toBe('cycle-1');
    expect(result[1].cycleId).toBe('cycle-2');
  });

  it('propagates InsufficientHistoryForTrendError for trend', async () => {
    gateway.completedCycleIds = ['cycle-1'];

    await expect(controller.getEstimationTrend('team-1')).rejects.toThrow(
      InsufficientHistoryForTrendError,
    );
  });
});
