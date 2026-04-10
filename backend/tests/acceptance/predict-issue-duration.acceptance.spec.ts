import {
  InsufficientHistoryError,
  NoSimilarIssuesError,
} from '@modules/analytics/entities/duration-prediction/duration-prediction.errors.js';
import { StubDurationPredictionDataGateway } from '@modules/analytics/testing/good-path/stub.duration-prediction-data.gateway.js';
import { PredictIssueDurationUsecase } from '@modules/analytics/usecases/predict-issue-duration.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Predict Issue Duration (acceptance)', () => {
  let gateway: StubDurationPredictionDataGateway;
  let usecase: PredictIssueDurationUsecase;

  beforeEach(() => {
    gateway = new StubDurationPredictionDataGateway();
    usecase = new PredictIssueDurationUsecase(gateway);
  });

  describe('prediction requires minimum 2 completed cycles and similar issues', () => {
    it('nominal prediction: returns optimistic, probable, pessimistic durations with high confidence', async () => {
      gateway.completedCycleCount = 3;
      gateway.similarIssuesCycleTimes = [
        2, 3, 4, 5, 6, 3, 4, 5, 2, 3, 4, 5, 6, 7, 3,
      ];

      const result = await usecase.execute({
        teamId: 'team-1',
        issueExternalId: 'issue-1',
      });

      expect(result.optimistic).toBeGreaterThan(0);
      expect(result.probable).toBeGreaterThanOrEqual(result.optimistic);
      expect(result.pessimistic).toBeGreaterThanOrEqual(result.probable);
      expect(result.confidence).toBe('high');
      expect(result.similarIssueCount).toBe(15);
    });

    it('low confidence: returns prediction with low confidence when fewer than 5 similar issues', async () => {
      gateway.completedCycleCount = 2;
      gateway.similarIssuesCycleTimes = [3, 5, 7];

      const result = await usecase.execute({
        teamId: 'team-1',
        issueExternalId: 'issue-2',
      });

      expect(result.optimistic).toBeGreaterThan(0);
      expect(result.probable).toBeGreaterThanOrEqual(result.optimistic);
      expect(result.pessimistic).toBeGreaterThanOrEqual(result.probable);
      expect(result.confidence).toBe('low');
      expect(result.similarIssueCount).toBe(3);
    });

    it('insufficient history: rejects when fewer than 2 completed cycles', async () => {
      gateway.completedCycleCount = 1;
      gateway.similarIssuesCycleTimes = [];

      await expect(
        usecase.execute({ teamId: 'team-1', issueExternalId: 'issue-3' }),
      ).rejects.toThrow(InsufficientHistoryError);
    });

    it('no similar issues: rejects when no matching issues found in history', async () => {
      gateway.completedCycleCount = 3;
      gateway.similarIssuesCycleTimes = [];

      await expect(
        usecase.execute({ teamId: 'team-1', issueExternalId: 'issue-4' }),
      ).rejects.toThrow(NoSimilarIssuesError);
    });
  });
});
