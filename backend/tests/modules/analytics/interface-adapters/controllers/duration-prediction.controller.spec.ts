import {
  InsufficientHistoryError,
  NoSimilarIssuesError,
} from '@modules/analytics/entities/duration-prediction/duration-prediction.errors.js';
import { DurationPredictionController } from '@modules/analytics/interface-adapters/controllers/duration-prediction.controller.js';
import { DurationPredictionPresenter } from '@modules/analytics/interface-adapters/presenters/duration-prediction.presenter.js';
import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubDurationPredictionDataGateway } from '@modules/analytics/testing/good-path/stub.duration-prediction-data.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { PredictIssueDurationUsecase } from '@modules/analytics/usecases/predict-issue-duration.usecase.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('DurationPredictionController', () => {
  let gateway: StubDurationPredictionDataGateway;
  let controller: DurationPredictionController;

  beforeEach(() => {
    gateway = new StubDurationPredictionDataGateway();
    const resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
      new StubWorkflowConfigGateway(),
      new StubAvailableStatusesGateway(),
    );
    const usecase = new PredictIssueDurationUsecase(
      gateway,
      resolveWorkflowConfig,
    );
    const presenter = new DurationPredictionPresenter();
    controller = new DurationPredictionController(usecase, presenter);
  });

  it('returns duration prediction DTO for a valid issue', async () => {
    gateway.completedCycleCount = 3;
    gateway.similarIssuesCycleTimes = [2, 3, 4, 5, 6];

    const result = await controller.getDurationPrediction('team-1', 'issue-1');

    expect(result.optimistic).toBe(3);
    expect(result.probable).toBe(4);
    expect(result.pessimistic).toBe(5);
    expect(result.confidence).toBe('high');
    expect(result.similarIssueCount).toBe(5);
  });

  it('propagates InsufficientHistoryError', async () => {
    gateway.completedCycleCount = 1;

    await expect(
      controller.getDurationPrediction('team-1', 'issue-1'),
    ).rejects.toThrow(InsufficientHistoryError);
  });

  it('propagates NoSimilarIssuesError', async () => {
    gateway.completedCycleCount = 3;
    gateway.similarIssuesCycleTimes = [];

    await expect(
      controller.getDurationPrediction('team-1', 'issue-1'),
    ).rejects.toThrow(NoSimilarIssuesError);
  });
});
