import { DurationPredictionPresenter } from '@modules/analytics/interface-adapters/presenters/duration-prediction.presenter.js';
import { describe, expect, it } from 'vitest';
import { DurationPredictionBuilder } from '../../../../builders/duration-prediction.builder.js';

describe('DurationPredictionPresenter', () => {
  const presenter = new DurationPredictionPresenter();

  it('presents a duration prediction as a DTO', () => {
    const prediction = new DurationPredictionBuilder()
      .withCycleTimes([2, 3, 4, 5, 6])
      .build();

    const dto = presenter.present(prediction);

    expect(dto.optimistic).toBe(prediction.optimistic);
    expect(dto.probable).toBe(prediction.probable);
    expect(dto.pessimistic).toBe(prediction.pessimistic);
    expect(dto.confidence).toBe('high');
    expect(dto.similarIssueCount).toBe(5);
  });

  it('presents low confidence prediction', () => {
    const prediction = new DurationPredictionBuilder()
      .withCycleTimes([3, 5, 7])
      .build();

    const dto = presenter.present(prediction);

    expect(dto.confidence).toBe('low');
    expect(dto.similarIssueCount).toBe(3);
  });
});
