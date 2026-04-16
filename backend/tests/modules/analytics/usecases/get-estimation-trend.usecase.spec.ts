import { InsufficientHistoryForTrendError } from '@modules/analytics/entities/estimation-accuracy/estimation-accuracy.errors.js';
import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubEstimationAccuracyDataGateway } from '@modules/analytics/testing/good-path/stub.estimation-accuracy-data.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { GetEstimationTrendUsecase } from '@modules/analytics/usecases/get-estimation-trend.usecase.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('GetEstimationTrendUsecase', () => {
  let gateway: StubEstimationAccuracyDataGateway;
  let usecase: GetEstimationTrendUsecase;

  beforeEach(() => {
    gateway = new StubEstimationAccuracyDataGateway();
    const workflowConfigGateway = new StubWorkflowConfigGateway();
    const availableStatusesGateway = new StubAvailableStatusesGateway();
    const resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
      workflowConfigGateway,
      availableStatusesGateway,
    );
    usecase = new GetEstimationTrendUsecase(gateway, resolveWorkflowConfig);
  });

  it('returns trend with average ratio per cycle', async () => {
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

    const trend = await usecase.execute({ teamId: 'team-1' });

    expect(trend).toHaveLength(2);
    expect(trend[0].cycleId).toBe('cycle-1');
    expect(trend[0].averageRatio).toBe(1.5);
    expect(trend[1].cycleId).toBe('cycle-2');
    expect(trend[1].averageRatio).toBe(1);
  });

  it('throws InsufficientHistoryForTrendError when less than 2 cycles', async () => {
    gateway.completedCycleIds = ['cycle-1'];

    await expect(usecase.execute({ teamId: 'team-1' })).rejects.toThrow(
      InsufficientHistoryForTrendError,
    );
  });

  it('throws InsufficientHistoryForTrendError when no cycles', async () => {
    gateway.completedCycleIds = [];

    await expect(usecase.execute({ teamId: 'team-1' })).rejects.toThrow(
      InsufficientHistoryForTrendError,
    );
  });
});
