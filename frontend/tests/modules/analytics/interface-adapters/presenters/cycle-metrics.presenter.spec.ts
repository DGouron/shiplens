import { describe, expect, it } from 'vitest';
import { CycleMetricsPresenter } from '@/modules/analytics/interface-adapters/presenters/cycle-metrics.presenter.ts';
import {
  cycleMetricsTranslations,
  type Locale,
} from '@/modules/analytics/interface-adapters/presenters/cycle-metrics.translations.ts';
import { type CycleMetricsCardId } from '@/modules/analytics/interface-adapters/presenters/cycle-metrics.view-model.schema.ts';
import { CycleMetricsResponseBuilder } from '../../../../builders/cycle-metrics-response.builder.ts';

function makePresenter(locale: Locale = 'en') {
  return new CycleMetricsPresenter(cycleMetricsTranslations[locale]);
}

function cardById(
  cards: Array<{
    id: CycleMetricsCardId;
    label: string;
    value: string;
    isAlert: boolean;
  }>,
  id: CycleMetricsCardId,
) {
  const card = cards.find((item) => item.id === id);
  if (!card) {
    throw new Error(`Card not found: ${id}`);
  }
  return card;
}

describe('CycleMetricsPresenter', () => {
  it('formats velocity as "{completed}/{planned} points"', () => {
    const viewModel = makePresenter().present(
      new CycleMetricsResponseBuilder()
        .withVelocity({ completedPoints: 8, plannedPoints: 12 })
        .build(),
    );

    expect(cardById(viewModel.cards, 'velocity').value).toBe('8/12 points');
  });

  it('formats throughput count with "issues" unit', () => {
    const viewModel = makePresenter().present(
      new CycleMetricsResponseBuilder().withThroughput(15).build(),
    );

    expect(cardById(viewModel.cards, 'throughput').value).toBe('15 issues');
  });

  it('formats completion rate as a percentage', () => {
    const viewModel = makePresenter().present(
      new CycleMetricsResponseBuilder().withCompletionRate(75).build(),
    );

    expect(cardById(viewModel.cards, 'completionRate').value).toBe('75%');
  });

  it('formats scope creep count with "issues added" unit', () => {
    const viewModel = makePresenter().present(
      new CycleMetricsResponseBuilder().withScopeCreep(4).build(),
    );

    expect(cardById(viewModel.cards, 'scopeCreep').value).toBe(
      '4 issues added',
    );
  });

  it('rounds cycle and lead times to one decimal place', () => {
    const viewModel = makePresenter().present(
      new CycleMetricsResponseBuilder()
        .withAverageCycleTimeInDays(2.56)
        .withAverageLeadTimeInDays(7.44)
        .build(),
    );

    expect(cardById(viewModel.cards, 'averageCycleTime').value).toBe(
      '2.6 days',
    );
    expect(cardById(viewModel.cards, 'averageLeadTime').value).toBe('7.4 days');
  });

  it('drops trailing zero for whole-number cycle and lead times', () => {
    const viewModel = makePresenter().present(
      new CycleMetricsResponseBuilder()
        .withAverageCycleTimeInDays(7)
        .withAverageLeadTimeInDays(3.0)
        .build(),
    );

    expect(cardById(viewModel.cards, 'averageCycleTime').value).toBe('7 days');
    expect(cardById(viewModel.cards, 'averageLeadTime').value).toBe('3 days');
  });

  it('displays "Not available" when average cycle time is null', () => {
    const viewModel = makePresenter().present(
      new CycleMetricsResponseBuilder()
        .withAverageCycleTimeInDays(null)
        .withAverageLeadTimeInDays(null)
        .build(),
    );

    expect(cardById(viewModel.cards, 'averageCycleTime').value).toBe(
      'Not available',
    );
    expect(cardById(viewModel.cards, 'averageLeadTime').value).toBe(
      'Not available',
    );
  });

  it('flags scope creep card as alert when count exceeds 30', () => {
    const viewModel = makePresenter().present(
      new CycleMetricsResponseBuilder().withScopeCreep(31).build(),
    );

    expect(cardById(viewModel.cards, 'scopeCreep').isAlert).toBe(true);
  });

  it('does NOT flag scope creep card when count equals 30', () => {
    const viewModel = makePresenter().present(
      new CycleMetricsResponseBuilder().withScopeCreep(30).build(),
    );

    expect(cardById(viewModel.cards, 'scopeCreep').isAlert).toBe(false);
  });

  it('renders zero values for a cycle with no issues', () => {
    const viewModel = makePresenter().present(
      new CycleMetricsResponseBuilder()
        .withVelocity({ completedPoints: 0, plannedPoints: 0 })
        .withThroughput(0)
        .withCompletionRate(0)
        .withScopeCreep(0)
        .withAverageCycleTimeInDays(null)
        .withAverageLeadTimeInDays(null)
        .build(),
    );

    expect(cardById(viewModel.cards, 'velocity').value).toBe('0/0 points');
    expect(cardById(viewModel.cards, 'throughput').value).toBe('0 issues');
    expect(cardById(viewModel.cards, 'completionRate').value).toBe('0%');
    expect(cardById(viewModel.cards, 'scopeCreep').value).toBe(
      '0 issues added',
    );
  });

  it('uses French labels under the fr locale', () => {
    const viewModel = makePresenter('fr').present(
      new CycleMetricsResponseBuilder().build(),
    );

    expect(cardById(viewModel.cards, 'velocity').label).toBe('Velocite');
    expect(cardById(viewModel.cards, 'throughput').label).toBe('Debit');
  });

  it('produces cards in a fixed order', () => {
    const viewModel = makePresenter().present(
      new CycleMetricsResponseBuilder().build(),
    );

    expect(viewModel.cards.map((card) => card.id)).toEqual([
      'velocity',
      'throughput',
      'completionRate',
      'scopeCreep',
      'averageCycleTime',
      'averageLeadTime',
    ]);
  });

  it('does not flag non-scope-creep cards as alert', () => {
    const viewModel = makePresenter().present(
      new CycleMetricsResponseBuilder().withScopeCreep(100).build(),
    );

    for (const card of viewModel.cards) {
      if (card.id === 'scopeCreep') continue;
      expect(card.isAlert).toBe(false);
    }
  });
});
