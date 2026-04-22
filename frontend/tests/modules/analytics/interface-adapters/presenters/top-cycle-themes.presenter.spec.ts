import { describe, expect, it } from 'vitest';
import { TopCycleThemesPresenter } from '@/modules/analytics/interface-adapters/presenters/top-cycle-themes.presenter.ts';
import { topCycleThemesTranslations } from '@/modules/analytics/interface-adapters/presenters/top-cycle-themes.translations.ts';
import { type TopCycleThemesMetric } from '@/modules/analytics/interface-adapters/presenters/top-cycle-themes.view-model.schema.ts';
import { TopCycleThemeRowResponseBuilder } from '../../../../builders/top-cycle-theme-row-response.builder.ts';

function makePresenter(
  metric: TopCycleThemesMetric = 'count',
  locale: 'en' | 'fr' = 'en',
): TopCycleThemesPresenter {
  return new TopCycleThemesPresenter(
    topCycleThemesTranslations[locale],
    metric,
  );
}

describe('TopCycleThemesPresenter', () => {
  it('returns the no-active-cycle empty message with neutral tone when input status is no_active_cycle', () => {
    const viewModel = makePresenter().present({ status: 'no_active_cycle' });

    expect(viewModel.showEmptyMessage).toBe(true);
    expect(viewModel.showRows).toBe(false);
    expect(viewModel.showMetricToggle).toBe(false);
    expect(viewModel.showRefreshButton).toBe(false);
    expect(viewModel.emptyTone).toBe('neutral');
    expect(viewModel.emptyMessage).toBe(
      topCycleThemesTranslations.en.emptyNoActiveCycle,
    );
  });

  it('returns the below-threshold empty message with neutral tone and hidden refresh button', () => {
    const viewModel = makePresenter().present({
      status: 'below_threshold',
      issueCount: 7,
    });

    expect(viewModel.showEmptyMessage).toBe(true);
    expect(viewModel.showRows).toBe(false);
    expect(viewModel.showMetricToggle).toBe(false);
    expect(viewModel.showRefreshButton).toBe(false);
    expect(viewModel.emptyTone).toBe('neutral');
    expect(viewModel.emptyMessage).toBe(
      topCycleThemesTranslations.en.emptyBelowThreshold,
    );
  });

  it('returns the ai-unavailable empty message with warning tone and visible refresh button', () => {
    const viewModel = makePresenter().present({ status: 'ai_unavailable' });

    expect(viewModel.showEmptyMessage).toBe(true);
    expect(viewModel.showRows).toBe(false);
    expect(viewModel.showMetricToggle).toBe(false);
    expect(viewModel.showRefreshButton).toBe(true);
    expect(viewModel.emptyTone).toBe('warning');
    expect(viewModel.emptyMessage).toBe(
      topCycleThemesTranslations.en.emptyAiUnavailable,
    );
  });

  it('renders rows with visible metric toggle and visible refresh button when status is ready', () => {
    const viewModel = makePresenter().present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      language: 'EN',
      fromCache: false,
      themes: [
        new TopCycleThemeRowResponseBuilder()
          .withName('Auth refactor')
          .withIssueCount(5)
          .build(),
      ],
    });

    expect(viewModel.showRows).toBe(true);
    expect(viewModel.showEmptyMessage).toBe(false);
    expect(viewModel.showMetricToggle).toBe(true);
    expect(viewModel.showRefreshButton).toBe(true);
    expect(viewModel.rankingRows).toHaveLength(1);
  });

  it('orders rows by issueCount descending when metric is count', () => {
    const viewModel = makePresenter('count').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      language: 'EN',
      fromCache: false,
      themes: [
        new TopCycleThemeRowResponseBuilder()
          .withName('Auth refactor')
          .withIssueCount(5)
          .build(),
        new TopCycleThemeRowResponseBuilder()
          .withName('Payments bugs')
          .withIssueCount(2)
          .build(),
        new TopCycleThemeRowResponseBuilder()
          .withName('Tech debt')
          .withIssueCount(3)
          .build(),
      ],
    });

    expect(viewModel.rankingRows.map((row) => row.themeName)).toEqual([
      'Auth refactor',
      'Tech debt',
      'Payments bugs',
    ]);
  });

  it('orders rows by totalPoints descending when metric is points', () => {
    const viewModel = makePresenter('points').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      language: 'EN',
      fromCache: false,
      themes: [
        new TopCycleThemeRowResponseBuilder()
          .withName('Auth refactor')
          .withIssueCount(7)
          .withTotalPoints(12)
          .build(),
        new TopCycleThemeRowResponseBuilder()
          .withName('Payments bugs')
          .withIssueCount(4)
          .withTotalPoints(30)
          .build(),
      ],
    });

    expect(viewModel.rankingRows.map((row) => row.themeName)).toEqual([
      'Payments bugs',
      'Auth refactor',
    ]);
  });

  it('orders rows by totalCycleTimeInHours descending when metric is time', () => {
    const viewModel = makePresenter('time').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      language: 'EN',
      fromCache: false,
      themes: [
        new TopCycleThemeRowResponseBuilder()
          .withName('Auth refactor')
          .withTotalCycleTimeInHours(10)
          .build(),
        new TopCycleThemeRowResponseBuilder()
          .withName('Payments bugs')
          .withTotalCycleTimeInHours(40)
          .build(),
      ],
    });

    expect(viewModel.rankingRows.map((row) => row.themeName)).toEqual([
      'Payments bugs',
      'Auth refactor',
    ]);
  });

  it('breaks ties by theme name ascending (localeCompare)', () => {
    const viewModel = makePresenter('count').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      language: 'EN',
      fromCache: false,
      themes: [
        new TopCycleThemeRowResponseBuilder()
          .withName('Payments bugs')
          .withIssueCount(3)
          .build(),
        new TopCycleThemeRowResponseBuilder()
          .withName('Auth refactor')
          .withIssueCount(3)
          .build(),
      ],
    });

    expect(viewModel.rankingRows.map((row) => row.themeName)).toEqual([
      'Auth refactor',
      'Payments bugs',
    ]);
  });

  it('caps rows at 5 defensively even if backend sends more', () => {
    const themes = Array.from({ length: 8 }, (_, index) =>
      new TopCycleThemeRowResponseBuilder()
        .withName(`Theme ${index}`)
        .withIssueCount(10 - index)
        .build(),
    );

    const viewModel = makePresenter('count').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      language: 'EN',
      fromCache: false,
      themes,
    });

    expect(viewModel.rankingRows).toHaveLength(5);
  });

  it('renders only the available rows when backend returns fewer than 5 themes', () => {
    const viewModel = makePresenter('count').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      language: 'EN',
      fromCache: false,
      themes: [
        new TopCycleThemeRowResponseBuilder()
          .withName('Auth refactor')
          .withIssueCount(5)
          .build(),
        new TopCycleThemeRowResponseBuilder()
          .withName('Tech debt')
          .withIssueCount(3)
          .build(),
      ],
    });

    expect(viewModel.rankingRows).toHaveLength(2);
  });

  it('renders the count metric label as the plain number', () => {
    const viewModel = makePresenter('count').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      language: 'EN',
      fromCache: false,
      themes: [
        new TopCycleThemeRowResponseBuilder()
          .withName('Auth refactor')
          .withIssueCount(5)
          .build(),
      ],
    });

    expect(viewModel.rankingRows[0].metricValueLabel).toBe('5');
  });

  it('formats the metric value label for time using formatDurationHours', () => {
    const viewModel = makePresenter('time').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      language: 'EN',
      fromCache: false,
      themes: [
        new TopCycleThemeRowResponseBuilder()
          .withName('Auth refactor')
          .withTotalCycleTimeInHours(72)
          .build(),
      ],
    });

    expect(viewModel.rankingRows[0].metricValueLabel).toBe('3.0 days');
  });

  it('uses French translations under the fr locale', () => {
    const viewModel = makePresenter('count', 'fr').present({
      status: 'no_active_cycle',
    });

    expect(viewModel.title).toBe(topCycleThemesTranslations.fr.cardTitle);
    expect(viewModel.emptyMessage).toBe(
      topCycleThemesTranslations.fr.emptyNoActiveCycle,
    );
    expect(viewModel.refreshLabel).toBe(
      topCycleThemesTranslations.fr.refreshLabel,
    );
  });

  it('exposes the metric toggle labels and the active metric', () => {
    const viewModel = makePresenter('points').present({
      status: 'no_active_cycle',
    });

    expect(viewModel.metricToggle.activeMetric).toBe('points');
    expect(viewModel.metricToggle.countLabel).toBe(
      topCycleThemesTranslations.en.metricCountLabel,
    );
    expect(viewModel.metricToggle.pointsLabel).toBe(
      topCycleThemesTranslations.en.metricPointsLabel,
    );
    expect(viewModel.metricToggle.timeLabel).toBe(
      topCycleThemesTranslations.en.metricTimeLabel,
    );
  });

  it('exposes the refresh label for the UI', () => {
    const viewModel = makePresenter().present({ status: 'ai_unavailable' });

    expect(viewModel.refreshLabel).toBe(
      topCycleThemesTranslations.en.refreshLabel,
    );
  });
});
