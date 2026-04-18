import { describe, expect, it } from 'vitest';
import { TopCycleAssigneesPresenter } from '@/modules/analytics/interface-adapters/presenters/top-cycle-assignees.presenter.ts';
import { topCycleAssigneesTranslations } from '@/modules/analytics/interface-adapters/presenters/top-cycle-assignees.translations.ts';
import { type TopCycleAssigneesMetric } from '@/modules/analytics/interface-adapters/presenters/top-cycle-assignees.view-model.schema.ts';
import { TopCycleAssigneeRowResponseBuilder } from '../../../../builders/top-cycle-assignee-row-response.builder.ts';

function makePresenter(
  metric: TopCycleAssigneesMetric = 'count',
  locale: 'en' | 'fr' = 'en',
): TopCycleAssigneesPresenter {
  return new TopCycleAssigneesPresenter(
    topCycleAssigneesTranslations[locale],
    metric,
  );
}

describe('TopCycleAssigneesPresenter', () => {
  it('returns the no-active-cycle empty message when input status is no_active_cycle', () => {
    const viewModel = makePresenter().present({ status: 'no_active_cycle' });

    expect(viewModel.showEmptyMessage).toBe(true);
    expect(viewModel.showRows).toBe(false);
    expect(viewModel.emptyMessage).toBe(
      topCycleAssigneesTranslations.en.emptyNoActiveCycle,
    );
  });

  it('returns the no-completed-work empty message when assignees list is empty', () => {
    const viewModel = makePresenter().present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      assignees: [],
    });

    expect(viewModel.showEmptyMessage).toBe(true);
    expect(viewModel.showRows).toBe(false);
    expect(viewModel.emptyMessage).toBe(
      topCycleAssigneesTranslations.en.emptyNoCompletedWork,
    );
  });

  it('orders rows by issueCount descending when metric is count', () => {
    const viewModel = makePresenter('count').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      assignees: [
        new TopCycleAssigneeRowResponseBuilder()
          .withAssigneeName('Alice')
          .withIssueCount(5)
          .build(),
        new TopCycleAssigneeRowResponseBuilder()
          .withAssigneeName('Bob')
          .withIssueCount(2)
          .build(),
        new TopCycleAssigneeRowResponseBuilder()
          .withAssigneeName('Charlie')
          .withIssueCount(3)
          .build(),
      ],
    });

    expect(viewModel.rankingRows.map((row) => row.assigneeName)).toEqual([
      'Alice',
      'Charlie',
      'Bob',
    ]);
  });

  it('orders rows by totalPoints descending when metric is points', () => {
    const viewModel = makePresenter('points').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      assignees: [
        new TopCycleAssigneeRowResponseBuilder()
          .withAssigneeName('Alice')
          .withIssueCount(5)
          .withTotalPoints(15)
          .build(),
        new TopCycleAssigneeRowResponseBuilder()
          .withAssigneeName('Bob')
          .withIssueCount(3)
          .withTotalPoints(24)
          .build(),
      ],
    });

    expect(viewModel.rankingRows.map((row) => row.assigneeName)).toEqual([
      'Bob',
      'Alice',
    ]);
  });

  it('orders rows by totalCycleTimeInHours descending when metric is time', () => {
    const viewModel = makePresenter('time').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      assignees: [
        new TopCycleAssigneeRowResponseBuilder()
          .withAssigneeName('Alice')
          .withTotalCycleTimeInHours(10)
          .build(),
        new TopCycleAssigneeRowResponseBuilder()
          .withAssigneeName('Bob')
          .withTotalCycleTimeInHours(40)
          .build(),
      ],
    });

    expect(viewModel.rankingRows.map((row) => row.assigneeName)).toEqual([
      'Bob',
      'Alice',
    ]);
  });

  it('breaks ties by assigneeName ascending (localeCompare)', () => {
    const viewModel = makePresenter('count').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      assignees: [
        new TopCycleAssigneeRowResponseBuilder()
          .withAssigneeName('Bob')
          .withIssueCount(3)
          .build(),
        new TopCycleAssigneeRowResponseBuilder()
          .withAssigneeName('Alice')
          .withIssueCount(3)
          .build(),
      ],
    });

    expect(viewModel.rankingRows.map((row) => row.assigneeName)).toEqual([
      'Alice',
      'Bob',
    ]);
  });

  it('caps rows at 5 defensively even if backend sends more', () => {
    const assignees = Array.from({ length: 8 }, (_, index) =>
      new TopCycleAssigneeRowResponseBuilder()
        .withAssigneeName(`Assignee ${index}`)
        .withIssueCount(10 - index)
        .build(),
    );

    const viewModel = makePresenter('count').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      assignees,
    });

    expect(viewModel.rankingRows).toHaveLength(5);
  });

  it('renders the count metric label as the plain number', () => {
    const viewModel = makePresenter('count').present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      assignees: [
        new TopCycleAssigneeRowResponseBuilder()
          .withAssigneeName('Alice')
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
      assignees: [
        new TopCycleAssigneeRowResponseBuilder()
          .withAssigneeName('Alice')
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

    expect(viewModel.title).toBe(topCycleAssigneesTranslations.fr.cardTitle);
    expect(viewModel.emptyMessage).toBe(
      topCycleAssigneesTranslations.fr.emptyNoActiveCycle,
    );
  });

  it('exposes the metric toggle labels and the active metric', () => {
    const viewModel = makePresenter('points').present({
      status: 'no_active_cycle',
    });

    expect(viewModel.metricToggle.activeMetric).toBe('points');
    expect(viewModel.metricToggle.countLabel).toBe(
      topCycleAssigneesTranslations.en.metricCountLabel,
    );
    expect(viewModel.metricToggle.pointsLabel).toBe(
      topCycleAssigneesTranslations.en.metricPointsLabel,
    );
    expect(viewModel.metricToggle.timeLabel).toBe(
      topCycleAssigneesTranslations.en.metricTimeLabel,
    );
  });
});
