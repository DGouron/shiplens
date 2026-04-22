import { describe, expect, it } from 'vitest';
import { type EstimationClassificationResponse } from '@/modules/analytics/entities/estimation-accuracy/estimation-accuracy.response.ts';
import { type Locale } from '@/modules/analytics/interface-adapters/presenters/cycle-metrics.translations.ts';
import { EstimationAccuracyPresenter } from '@/modules/analytics/interface-adapters/presenters/estimation-accuracy.presenter.ts';
import { estimationAccuracyTranslations } from '@/modules/analytics/interface-adapters/presenters/estimation-accuracy.translations.ts';
import { EstimationAccuracyResponseBuilder } from '../../../../builders/estimation-accuracy-response.builder.ts';

function makePresenter(locale: Locale = 'en') {
  return new EstimationAccuracyPresenter(
    estimationAccuracyTranslations[locale],
  );
}

function repeat(
  count: number,
  classification: EstimationClassificationResponse,
) {
  return Array.from({ length: count }, () => ({ classification }));
}

describe('EstimationAccuracyPresenter', () => {
  it('counts each classification from the issues array', () => {
    const viewModel = makePresenter().present(
      new EstimationAccuracyResponseBuilder()
        .withIssues([
          ...repeat(3, 'well-estimated'),
          ...repeat(1, 'over-estimated'),
          ...repeat(1, 'under-estimated'),
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
          ...repeat(3, 'well-estimated'),
          ...repeat(1, 'over-estimated'),
          ...repeat(1, 'under-estimated'),
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
          ...repeat(3, 'well-estimated'),
          ...repeat(1, 'over-estimated'),
          ...repeat(1, 'under-estimated'),
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

  describe('diagnosis', () => {
    it('flags health as healthy when at least 70% of tickets are well-estimated', () => {
      const viewModel = makePresenter().present(
        new EstimationAccuracyResponseBuilder()
          .withIssues([
            ...repeat(7, 'well-estimated'),
            ...repeat(2, 'under-estimated'),
            ...repeat(1, 'over-estimated'),
          ])
          .build(),
      );

      expect(viewModel.diagnosis.healthLevel).toBe('healthy');
      expect(viewModel.diagnosis.healthHeadline).toBe('Reliable estimations');
    });

    it('flags health as mixed when well-estimated share sits between 50% and 70%', () => {
      const viewModel = makePresenter().present(
        new EstimationAccuracyResponseBuilder()
          .withIssues([
            ...repeat(6, 'well-estimated'),
            ...repeat(3, 'under-estimated'),
            ...repeat(1, 'over-estimated'),
          ])
          .build(),
      );

      expect(viewModel.diagnosis.healthLevel).toBe('mixed');
      expect(viewModel.diagnosis.healthHeadline).toBe('Mixed signal');
    });

    it('flags health as needs-calibration when well-estimated share drops below 50%', () => {
      const viewModel = makePresenter().present(
        new EstimationAccuracyResponseBuilder()
          .withIssues([
            ...repeat(16, 'well-estimated'),
            ...repeat(14, 'under-estimated'),
            ...repeat(8, 'over-estimated'),
          ])
          .build(),
      );

      expect(viewModel.diagnosis.healthLevel).toBe('needs-calibration');
      expect(viewModel.diagnosis.healthHeadline).toBe('Needs calibration');
    });

    it('renders the accuracy summary with count, total and rounded percentage', () => {
      const viewModel = makePresenter().present(
        new EstimationAccuracyResponseBuilder()
          .withIssues([
            ...repeat(16, 'well-estimated'),
            ...repeat(14, 'under-estimated'),
            ...repeat(8, 'over-estimated'),
          ])
          .build(),
      );

      expect(viewModel.diagnosis.accuracySummary).toBe(
        '42% of tickets landed on target (16 out of 38)',
      );
    });

    it('describes the drift when under-estimated issues dominate', () => {
      const viewModel = makePresenter().present(
        new EstimationAccuracyResponseBuilder()
          .withIssues([
            ...repeat(16, 'well-estimated'),
            ...repeat(14, 'under-estimated'),
            ...repeat(8, 'over-estimated'),
          ])
          .build(),
      );

      expect(viewModel.diagnosis.showDriftSummary).toBe(true);
      expect(viewModel.diagnosis.driftSummary).toBe(
        '14 tickets took longer than planned, 8 finished faster',
      );
      expect(viewModel.diagnosis.recommendation).toBe(
        'Most tickets run over. Revisit your estimation ritual and tighten scoping.',
      );
    });

    it('describes the drift when over-estimated issues dominate', () => {
      const viewModel = makePresenter().present(
        new EstimationAccuracyResponseBuilder()
          .withIssues([
            ...repeat(6, 'well-estimated'),
            ...repeat(1, 'under-estimated'),
            ...repeat(3, 'over-estimated'),
          ])
          .build(),
      );

      expect(viewModel.diagnosis.showDriftSummary).toBe(true);
      expect(viewModel.diagnosis.driftSummary).toBe(
        '3 tickets finished faster than planned, 1 took longer',
      );
    });

    it('hides the drift summary when over and under counts are balanced', () => {
      const viewModel = makePresenter().present(
        new EstimationAccuracyResponseBuilder()
          .withIssues([
            ...repeat(3, 'well-estimated'),
            ...repeat(3, 'under-estimated'),
            ...repeat(3, 'over-estimated'),
          ])
          .build(),
      );

      expect(viewModel.diagnosis.showDriftSummary).toBe(false);
      expect(viewModel.diagnosis.driftSummary).toBe('');
    });

    it('recommends keeping the ritual when the team is healthy', () => {
      const viewModel = makePresenter().present(
        new EstimationAccuracyResponseBuilder()
          .withIssues([
            ...repeat(8, 'well-estimated'),
            ...repeat(1, 'under-estimated'),
            ...repeat(1, 'over-estimated'),
          ])
          .build(),
      );

      expect(viewModel.diagnosis.recommendation).toBe(
        'Keep the current estimation ritual — the team is well calibrated.',
      );
    });

    it('uses French labels for the diagnosis under the fr locale', () => {
      const viewModel = makePresenter('fr').present(
        new EstimationAccuracyResponseBuilder()
          .withIssues([
            ...repeat(16, 'well-estimated'),
            ...repeat(14, 'under-estimated'),
            ...repeat(8, 'over-estimated'),
          ])
          .build(),
      );

      expect(viewModel.diagnosis.healthHeadline).toBe('Calibrage a revoir');
      expect(viewModel.diagnosis.accuracySummary).toBe(
        '42% des tickets dans la cible (16 sur 38)',
      );
      expect(viewModel.diagnosis.driftSummary).toBe(
        '14 tickets ont depasse leur estimation, 8 ont ete boucles plus vite',
      );
    });
  });
});
