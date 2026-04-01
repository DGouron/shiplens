import { describe, it, expect, beforeEach } from 'vitest';
import { PredictIssueDurationUsecase } from '@modules/analytics/usecases/predict-issue-duration.usecase.js';
import { StubDurationPredictionDataGateway } from '@modules/analytics/testing/good-path/stub.duration-prediction-data.gateway.js';
import { InsufficientHistoryError } from '@modules/analytics/entities/duration-prediction/duration-prediction.errors.js';
import { NoSimilarIssuesError } from '@modules/analytics/entities/duration-prediction/duration-prediction.errors.js';

describe('PredictIssueDurationUsecase', () => {
  let gateway: StubDurationPredictionDataGateway;
  let usecase: PredictIssueDurationUsecase;

  beforeEach(() => {
    gateway = new StubDurationPredictionDataGateway();
    usecase = new PredictIssueDurationUsecase(gateway);
  });

  it('returns a duration prediction from similar issues cycle times', async () => {
    gateway.completedCycleCount = 3;
    gateway.similarIssuesCycleTimes = [2, 3, 4, 5, 6];

    const result = await usecase.execute({
      teamId: 'team-1',
      issueExternalId: 'issue-1',
    });

    expect(result.optimistic).toBe(3);
    expect(result.probable).toBe(4);
    expect(result.pessimistic).toBe(5);
    expect(result.confidence).toBe('high');
    expect(result.similarIssueCount).toBe(5);
  });

  it('throws InsufficientHistoryError when fewer than 2 completed cycles', async () => {
    gateway.completedCycleCount = 1;

    await expect(
      usecase.execute({ teamId: 'team-1', issueExternalId: 'issue-1' }),
    ).rejects.toThrow(InsufficientHistoryError);
  });

  it('throws NoSimilarIssuesError when no similar issues found', async () => {
    gateway.completedCycleCount = 3;
    gateway.similarIssuesCycleTimes = [];

    await expect(
      usecase.execute({ teamId: 'team-1', issueExternalId: 'issue-1' }),
    ).rejects.toThrow(NoSimilarIssuesError);
  });

  it('returns low confidence when fewer than 5 similar issues', async () => {
    gateway.completedCycleCount = 2;
    gateway.similarIssuesCycleTimes = [3, 5, 7];

    const result = await usecase.execute({
      teamId: 'team-1',
      issueExternalId: 'issue-2',
    });

    expect(result.confidence).toBe('low');
    expect(result.similarIssueCount).toBe(3);
  });
});
