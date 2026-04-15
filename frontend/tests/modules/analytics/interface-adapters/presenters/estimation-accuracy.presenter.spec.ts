import { describe, expect, it } from 'vitest';
import { type Locale } from '@/modules/analytics/interface-adapters/presenters/cycle-metrics.translations.ts';
import { EstimationAccuracyPresenter } from '@/modules/analytics/interface-adapters/presenters/estimation-accuracy.presenter.ts';
import { estimationAccuracyTranslations } from '@/modules/analytics/interface-adapters/presenters/estimation-accuracy.translations.ts';
import { EstimationAccuracyResponseBuilder } from '../../../../builders/estimation-accuracy-response.builder.ts';

function makePresenter(locale: Locale = 'en') {
  return new EstimationAccuracyPresenter(
    estimationAccuracyTranslations[locale],
  );
}

describe('EstimationAccuracyPresenter', () => {
  it('counts each classification from the issues array', () => {
    const viewModel = makePresenter().present(
      new EstimationAccuracyResponseBuilder()
        .withIssues([
          { classification: 'well-estimated' },
          { classification: 'well-estimated' },
          { classification: 'well-estimated' },
          { classification: 'over-estimated' },
          { classification: 'under-estimated' },
        ])
        .build(),
    );

    expect(viewModel.donut.wellEstimated.count).toBe(3);
    expect(viewModel.donut.overEstimated.count).toBe(1);
    expect(viewModel.donut.underEstimated.count).toBe(1);
  });

  it('computes percentages rounded to the nearest integer', () => {
    const viewModel = makePresenter().present(
      new EstimationAccuracyResponseBuilder()
        .withIssues([
          { classification: 'well-estimated' },
          { classification: 'well-estimated' },
          { classification: 'well-estimated' },
          { classification: 'over-estimated' },
          { classification: 'under-estimated' },
        ])
        .build(),
    );

    expect(viewModel.donut.wellEstimated.percentage).toBe(60);
    expect(viewModel.donut.overEstimated.percentage).toBe(20);
    expect(viewModel.donut.underEstimated.percentage).toBe(20);
  });

  it('formats bucket labels through the translations function', () => {
    const viewModel = makePresenter().present(
      new EstimationAccuracyResponseBuilder()
        .withIssues([
          { classification: 'well-estimated' },
          { classification: 'well-estimated' },
          { classification: 'well-estimated' },
          { classification: 'over-estimated' },
          { classification: 'under-estimated' },
        ])
        .build(),
    );

    expect(viewModel.donut.wellEstimated.label).toBe('Well estimated: 3 (60%)');
    expect(viewModel.donut.overEstimated.label).toBe('Over-estimated: 1 (20%)');
    expect(viewModel.donut.underEstimated.label).toBe(
      'Under-estimated: 1 (20%)',
    );
  });

  it('flags showEmptyMessage true and showContent false when there are no issues and no exclusions', () => {
    const viewModel = makePresenter().present(
      new EstimationAccuracyResponseBuilder()
        .withIssues([])
        .withExcludedWithoutEstimation(0)
        .withExcludedWithoutCycleTime(0)
        .build(),
    );

    expect(viewModel.showEmptyMessage).toBe(true);
    expect(viewModel.showContent).toBe(false);
    expect(viewModel.emptyMessage).toBe(
      estimationAccuracyTranslations.en.emptyMessage,
    );
  });

  it('flags showContent true when at least one issue is present', () => {
    const viewModel = makePresenter().present(
      new EstimationAccuracyResponseBuilder()
        .withIssues([{ classification: 'well-estimated' }])
        .build(),
    );

    expect(viewModel.showContent).toBe(true);
    expect(viewModel.showEmptyMessage).toBe(false);
    expect(viewModel.emptyMessage).toBeNull();
  });

  it('flags showExclusionWithoutEstimation true when the count is positive', () => {
    const viewModel = makePresenter().present(
      new EstimationAccuracyResponseBuilder()
        .withExcludedWithoutEstimation(3)
        .withExcludedWithoutCycleTime(0)
        .build(),
    );

    expect(viewModel.showExclusionWithoutEstimation).toBe(true);
    expect(viewModel.showExclusionWithoutCycleTime).toBe(false);
    expect(viewModel.exclusions.withoutEstimation.count).toBe(3);
    expect(viewModel.exclusions.withoutEstimation.label).toBe(
      'Excluded (no estimation): 3',
    );
  });

  it('flags showExclusionWithoutCycleTime true when the count is positive', () => {
    const viewModel = makePresenter().present(
      new EstimationAccuracyResponseBuilder()
        .withExcludedWithoutEstimation(0)
        .withExcludedWithoutCycleTime(2)
        .build(),
    );

    expect(viewModel.showExclusionWithoutCycleTime).toBe(true);
    expect(viewModel.showExclusionWithoutEstimation).toBe(false);
    expect(viewModel.exclusions.withoutCycleTime.label).toBe(
      'Excluded (no cycle time): 2',
    );
  });

  it('does not show the empty message when exclusions are the only data present', () => {
    const viewModel = makePresenter().present(
      new EstimationAccuracyResponseBuilder()
        .withIssues([])
        .withExcludedWithoutEstimation(3)
        .withExcludedWithoutCycleTime(0)
        .build(),
    );

    expect(viewModel.showEmptyMessage).toBe(false);
    expect(viewModel.showContent).toBe(false);
    expect(viewModel.showExclusionWithoutEstimation).toBe(true);
  });

  it('exposes the team score through the translations', () => {
    const viewModel = makePresenter().present(
      new EstimationAccuracyResponseBuilder()
        .withTeamScore({
          issueCount: 10,
          averageRatio: 1.2,
          daysPerPoint: 1.75,
          classification: 'over-estimated',
        })
        .build(),
    );

    expect(viewModel.teamScore.classification).toBe('over-estimated');
    expect(viewModel.teamScore.classificationLabel).toBe('Over-estimated');
    expect(viewModel.teamScore.daysPerPointLabel).toBe('Days per point: 1.75');
    expect(viewModel.teamScore.issueCountLabel).toBe('Issues analysed: 10');
  });

  it('exposes the total label on the donut', () => {
    const viewModel = makePresenter().present(
      new EstimationAccuracyResponseBuilder()
        .withIssues([
          { classification: 'well-estimated' },
          { classification: 'over-estimated' },
        ])
        .build(),
    );

    expect(viewModel.donut.totalLabel).toBe('Total: 2 issues');
  });

  it('uses French labels under the fr locale', () => {
    const viewModel = makePresenter('fr').present(
      new EstimationAccuracyResponseBuilder()
        .withIssues([{ classification: 'well-estimated' }])
        .withExcludedWithoutEstimation(1)
        .build(),
    );

    expect(viewModel.donut.wellEstimated.label).toBe(
      'Bien estimees : 1 (100%)',
    );
    expect(viewModel.exclusions.withoutEstimation.label).toBe(
      'Exclues (sans estimation) : 1',
    );
  });
});
