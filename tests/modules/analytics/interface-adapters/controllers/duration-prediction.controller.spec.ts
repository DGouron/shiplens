import { describe, it, expect, beforeEach } from 'vitest';
import { DurationPredictionController } from '@modules/analytics/interface-adapters/controllers/duration-prediction.controller.js';
import { PredictIssueDurationUsecase } from '@modules/analytics/usecases/predict-issue-duration.usecase.js';
import { DurationPredictionPresenter } from '@modules/analytics/interface-adapters/presenters/duration-prediction.presenter.js';
import { StubDurationPredictionDataGateway } from '@modules/analytics/testing/good-path/stub.duration-prediction-data.gateway.js';
import { InsufficientHistoryError } from '@modules/analytics/entities/duration-prediction/duration-prediction.errors.js';
import { NoSimilarIssuesError } from '@modules/analytics/entities/duration-prediction/duration-prediction.errors.js';

describe('DurationPredictionController', () => {
  let gateway: StubDurationPredictionDataGateway;
  let controller: DurationPredictionController;

  beforeEach(() => {
    gateway = new StubDurationPredictionDataGateway();
    const usecase = new PredictIssueDurationUsecase(gateway);
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
