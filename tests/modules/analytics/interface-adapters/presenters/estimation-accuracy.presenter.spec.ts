import { describe, it, expect } from 'vitest';
import { EstimationAccuracyPresenter } from '@modules/analytics/interface-adapters/presenters/estimation-accuracy.presenter.js';
import { EstimationAccuracyBuilder } from '../../../../builders/estimation-accuracy.builder.js';

describe('EstimationAccuracyPresenter', () => {
  const presenter = new EstimationAccuracyPresenter();

  it('presents estimation accuracy as formatted DTO', () => {
    const accuracy = new EstimationAccuracyBuilder()
      .withIssues([
        { externalId: 'issue-1', title: 'Task 1', points: 3, cycleTimeInDays: 2, assigneeName: 'Alice', labelNames: ['frontend'] },
        { externalId: 'issue-2', title: 'Task 2', points: 1, cycleTimeInDays: 5, assigneeName: 'Bob', labelNames: ['backend'] },
      ])
      .withExcludedWithoutEstimation(3)
      .withExcludedWithoutCycleTime(2)
      .build();

    const result = presenter.present(accuracy);

    expect(result.issues).toHaveLength(2);
    expect(result.issues[0].ratio).toBe(1.5);
    expect(result.issues[0].classification).toBe('well-estimated');
    expect(result.issues[1].ratio).toBe(0.2);
    expect(result.issues[1].classification).toBe('under-estimated');
    expect(result.teamScore.issueCount).toBe(2);
    expect(result.excludedWithoutEstimation).toBe(3);
    expect(result.excludedWithoutCycleTime).toBe(2);
  });

  it('presents developer scores', () => {
    const accuracy = new EstimationAccuracyBuilder()
      .withIssues([
        { externalId: 'issue-1', title: 'Task 1', points: 3, cycleTimeInDays: 2, assigneeName: 'Alice', labelNames: [] },
        { externalId: 'issue-2', title: 'Task 2', points: 2, cycleTimeInDays: 2, assigneeName: 'Bob', labelNames: [] },
      ])
      .build();

    const result = presenter.present(accuracy);

    expect(result.developerScores).toHaveLength(2);
    expect(result.developerScores[0].developerName).toBe('Alice');
    expect(result.developerScores[1].developerName).toBe('Bob');
  });

  it('presents label scores', () => {
    const accuracy = new EstimationAccuracyBuilder()
      .withIssues([
        { externalId: 'issue-1', title: 'Task 1', points: 3, cycleTimeInDays: 2, assigneeName: 'Alice', labelNames: ['frontend'] },
      ])
      .build();

    const result = presenter.present(accuracy);

    expect(result.labelScores).toHaveLength(1);
    expect(result.labelScores[0].labelName).toBe('frontend');
  });
});
