import { describe, expect, it } from 'vitest';
import { TopCycleProjectsPresenter } from '@/modules/analytics/interface-adapters/presenters/top-cycle-projects.presenter.ts';
import { topCycleProjectsTranslations } from '@/modules/analytics/interface-adapters/presenters/top-cycle-projects.translations.ts';
import { type TopCycleProjectsMetric } from '@/modules/analytics/interface-adapters/presenters/top-cycle-projects.view-model.schema.ts';
import { TopCycleProjectRowResponseBuilder } from '../../../../builders/top-cycle-project-row-response.builder.ts';

function makePresenter(
  metric: TopCycleProjectsMetric = 'count',
  locale: 'en' | 'fr' = 'en',
  isExpanded = false,
): TopCycleProjectsPresenter {
  return new TopCycleProjectsPresenter(
    topCycleProjectsTranslations[locale],
    metric,
    isExpanded,
  );
}

describe('TopCycleProjectsPresenter', () => {
  it('returns the no-active-cycle empty message when input status is no_active_cycle', () => {
    const viewModel = makePresenter().present({ status: 'no_active_cycle' });

    expect(viewModel.showEmptyMessage).toBe(true);
    expect(viewModel.showRows).toBe(false);
    expect(viewModel.emptyMessage).toBe(
      topCycleProjectsTranslations.en.emptyNoActiveCycle,
    );
  });

  it('returns the no-activity empty message when projects list is empty', () => {
    const viewModel = makePresenter().present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      projects: [],
    });

    expect(viewModel.showEmptyMessage).toBe(true);
    expect(viewModel.showRows).toBe(false);
    expect(viewModel.emptyMessage).toBe(
      topCycleProjectsTranslations.en.emptyNoActivity,
    );
  });

  it('orders rows by issueCount descending when metric is count', () => {
    const viewModel = makePresenter('count').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      projects: [
        new TopCycleProjectRowResponseBuilder()
          .withProjectId('a')
          .withIssueCount(5)
          .build(),
        new TopCycleProjectRowResponseBuilder()
          .withProjectId('b')
          .withIssueCount(2)
          .build(),
        new TopCycleProjectRowResponseBuilder()
          .withProjectId('c')
          .withIssueCount(3)
          .build(),
      ],
    });

    expect(viewModel.rankingRows.map((row) => row.projectId)).toEqual([
      'a',
      'c',
      'b',
    ]);
  });

  it('orders rows by totalPoints descending when metric is points', () => {
    const viewModel = makePresenter('points').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      projects: [
        new TopCycleProjectRowResponseBuilder()
          .withProjectId('a')
          .withIssueCount(5)
          .withTotalPoints(8)
          .build(),
        new TopCycleProjectRowResponseBuilder()
          .withProjectId('b')
          .withIssueCount(3)
          .withTotalPoints(15)
          .build(),
      ],
    });

    expect(viewModel.rankingRows.map((row) => row.projectId)).toEqual([
      'b',
      'a',
    ]);
  });

  it('orders rows by totalCycleTimeInHours descending when metric is time', () => {
    const viewModel = makePresenter('time').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      projects: [
        new TopCycleProjectRowResponseBuilder()
          .withProjectId('a')
          .withTotalCycleTimeInHours(10)
          .build(),
        new TopCycleProjectRowResponseBuilder()
          .withProjectId('b')
          .withTotalCycleTimeInHours(40)
          .build(),
      ],
    });

    expect(viewModel.rankingRows.map((row) => row.projectId)).toEqual([
      'b',
      'a',
    ]);
  });

  it('truncates the output to 5 rows when collapsed', () => {
    const projects = Array.from({ length: 8 }, (_, index) =>
      new TopCycleProjectRowResponseBuilder()
        .withProjectId(`p-${index}`)
        .withIssueCount(10 - index)
        .build(),
    );

    const viewModel = makePresenter('count').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      projects,
    });

    expect(viewModel.rankingRows).toHaveLength(5);
    expect(viewModel.showExpandButton).toBe(true);
    expect(viewModel.expandLabel).toBe(
      topCycleProjectsTranslations.en.showMoreLabel,
    );
  });

  it('reveals all rows when expanded', () => {
    const projects = Array.from({ length: 8 }, (_, index) =>
      new TopCycleProjectRowResponseBuilder()
        .withProjectId(`p-${index}`)
        .withIssueCount(10 - index)
        .build(),
    );

    const viewModel = makePresenter('count', 'en', true).present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      projects,
    });

    expect(viewModel.rankingRows).toHaveLength(8);
    expect(viewModel.showExpandButton).toBe(true);
    expect(viewModel.expandLabel).toBe(
      topCycleProjectsTranslations.en.showLessLabel,
    );
  });

  it('hides the expand button when 5 or fewer projects', () => {
    const projects = Array.from({ length: 3 }, (_, index) =>
      new TopCycleProjectRowResponseBuilder()
        .withProjectId(`p-${index}`)
        .withIssueCount(10 - index)
        .build(),
    );

    const viewModel = makePresenter('count').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      projects,
    });

    expect(viewModel.showExpandButton).toBe(false);
    expect(viewModel.rankingRows).toHaveLength(3);
  });

  it('labels the no-project bucket with the translated name', () => {
    const viewModel = makePresenter('count').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      projects: [
        new TopCycleProjectRowResponseBuilder()
          .withProjectId('__no_project__')
          .withProjectName('No project')
          .withIsNoProjectBucket(true)
          .withIssueCount(2)
          .build(),
      ],
    });

    expect(viewModel.rankingRows[0].projectName).toBe(
      topCycleProjectsTranslations.en.noProjectBucketLabel,
    );
    expect(viewModel.rankingRows[0].isNoProjectBucket).toBe(true);
  });

  it('formats the metric value label for time using formatDurationHours', () => {
    const viewModel = makePresenter('time').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      projects: [
        new TopCycleProjectRowResponseBuilder()
          .withProjectId('a')
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

    expect(viewModel.title).toBe(topCycleProjectsTranslations.fr.cardTitle);
    expect(viewModel.emptyMessage).toBe(
      topCycleProjectsTranslations.fr.emptyNoActiveCycle,
    );
  });

  it('exposes the metric toggle labels and the active metric', () => {
    const viewModel = makePresenter('points').present({
      status: 'no_active_cycle',
    });

    expect(viewModel.metricToggle.activeMetric).toBe('points');
    expect(viewModel.metricToggle.countLabel).toBe(
      topCycleProjectsTranslations.en.metricCountLabel,
    );
    expect(viewModel.metricToggle.pointsLabel).toBe(
      topCycleProjectsTranslations.en.metricPointsLabel,
    );
    expect(viewModel.metricToggle.timeLabel).toBe(
      topCycleProjectsTranslations.en.metricTimeLabel,
    );
  });
});
