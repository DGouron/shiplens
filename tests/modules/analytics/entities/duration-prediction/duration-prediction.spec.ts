import { DurationPrediction } from '@modules/analytics/entities/duration-prediction/duration-prediction.js';
import { describe, expect, it } from 'vitest';

describe('DurationPrediction', () => {
  it('computes P25 as optimistic, P50 as probable, P75 as pessimistic from cycle times', () => {
    const prediction = DurationPrediction.fromCycleTimes([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);

    expect(prediction.optimistic).toBe(3.5);
    expect(prediction.probable).toBe(6);
    expect(prediction.pessimistic).toBe(8.5);
  });

  it('returns high confidence when 5 or more similar issues', () => {
    const prediction = DurationPrediction.fromCycleTimes([1, 2, 3, 4, 5]);

    expect(prediction.confidence).toBe('high');
  });

  it('returns low confidence when fewer than 5 similar issues', () => {
    const prediction = DurationPrediction.fromCycleTimes([3, 5, 7]);

    expect(prediction.confidence).toBe('low');
  });

  it('exposes the similar issue count', () => {
    const prediction = DurationPrediction.fromCycleTimes([2, 4, 6]);

    expect(prediction.similarIssueCount).toBe(3);
  });

  it('handles a single cycle time by returning the same value for all percentiles', () => {
    const prediction = DurationPrediction.fromCycleTimes([5]);

    expect(prediction.optimistic).toBe(5);
    expect(prediction.probable).toBe(5);
    expect(prediction.pessimistic).toBe(5);
  });

  it('handles two cycle times', () => {
    const prediction = DurationPrediction.fromCycleTimes([2, 8]);

    expect(prediction.optimistic).toBe(3.5);
    expect(prediction.probable).toBe(5);
    expect(prediction.pessimistic).toBe(6.5);
  });

  it('sorts unsorted cycle times before computing percentiles', () => {
    const prediction = DurationPrediction.fromCycleTimes([10, 1, 5, 3, 8]);

    const predictionFromSorted = DurationPrediction.fromCycleTimes([
      1, 3, 5, 8, 10,
    ]);

    expect(prediction.optimistic).toBe(predictionFromSorted.optimistic);
    expect(prediction.probable).toBe(predictionFromSorted.probable);
    expect(prediction.pessimistic).toBe(predictionFromSorted.pessimistic);
  });

  it('ensures optimistic <= probable <= pessimistic', () => {
    const prediction = DurationPrediction.fromCycleTimes([
      2, 3, 4, 5, 6, 3, 4, 5, 2, 3, 4, 5, 6, 7, 3,
    ]);

    expect(prediction.optimistic).toBeLessThanOrEqual(prediction.probable);
    expect(prediction.probable).toBeLessThanOrEqual(prediction.pessimistic);
  });
});
