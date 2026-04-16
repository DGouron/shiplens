import { describe, expect, it } from 'vitest';
import { MemberHealthTrendsPresenter } from '@/modules/analytics/interface-adapters/presenters/member-health-trends.presenter.ts';
import {
  type Locale,
  memberHealthTrendsTranslations,
} from '@/modules/analytics/interface-adapters/presenters/member-health-trends.translations.ts';
import { type HealthSignalId } from '@/modules/analytics/interface-adapters/presenters/member-health-trends.view-model.schema.ts';
import { MemberHealthResponseBuilder } from '../../../../builders/member-health-response.builder.ts';

function makePresenter(locale: Locale = 'en') {
  return new MemberHealthTrendsPresenter(
    memberHealthTrendsTranslations[locale],
  );
}

function makeInput(
  overrides: Partial<{
    teamId: string;
    cycleCount: number;
  }> = {},
) {
  return {
    response: new MemberHealthResponseBuilder().build(),
    teamId: overrides.teamId ?? 'team-1',
    cycleCount: overrides.cycleCount ?? 5,
  };
}

describe('MemberHealthTrendsPresenter', () => {
  it('produces 5 signals in fixed order', () => {
    const viewModel = makePresenter().present(makeInput());

    expect(viewModel.signals.map((signal) => signal.id)).toEqual([
      'estimationScore',
      'underestimationRatio',
      'averageCycleTime',
      'driftingTickets',
      'medianReviewTime',
    ]);
  });

  it('maps signal labels from translations', () => {
    const viewModel = makePresenter().present(makeInput());

    const estimationSignal = viewModel.signals.find(
      (signal) => signal.id === 'estimationScore',
    );
    expect(estimationSignal?.label).toBe('Estimation Score');
    expect(estimationSignal?.description).toBe(
      'Percentage of issues correctly estimated — actual effort fell within the expected range. A rising score means the member is getting better at sizing work.',
    );
  });

  it('maps signal value and trend from the response', () => {
    const response = new MemberHealthResponseBuilder()
      .withEstimationScore({
        value: '78%',
        trend: 'rising',
        indicator: 'green',
      })
      .build();
    const viewModel = makePresenter().present({
      response,
      teamId: 'team-1',
      cycleCount: 5,
    });

    const signal = viewModel.signals.find(
      (signal) => signal.id === 'estimationScore',
    );
    expect(signal?.value).toBe('78%');
    expect(signal?.trendDirection).toBe('rising');
    expect(signal?.indicatorColor).toBe('green');
  });

  it('sets indicatorColor to null and showNotApplicableNote to true for not-applicable signals', () => {
    const response = new MemberHealthResponseBuilder()
      .withEstimationScore({
        value: 'Not applicable',
        trend: null,
        indicator: 'not-applicable',
      })
      .build();
    const viewModel = makePresenter().present({
      response,
      teamId: 'team-1',
      cycleCount: 5,
    });

    const signal = viewModel.signals.find(
      (signal) => signal.id === 'estimationScore',
    );
    expect(signal?.indicatorColor).toBeNull();
    expect(signal?.showNotApplicableNote).toBe(true);
    expect(signal?.showNotEnoughHistoryNote).toBe(false);
  });

  it('sets indicatorColor to null and showNotEnoughHistoryNote to true for not-enough-history signals', () => {
    const response = new MemberHealthResponseBuilder()
      .withEstimationScore({
        value: '60%',
        trend: null,
        indicator: 'not-enough-history',
      })
      .build();
    const viewModel = makePresenter().present({
      response,
      teamId: 'team-1',
      cycleCount: 5,
    });

    const signal = viewModel.signals.find(
      (signal) => signal.id === 'estimationScore',
    );
    expect(signal?.indicatorColor).toBeNull();
    expect(signal?.showNotEnoughHistoryNote).toBe(true);
    expect(signal?.showNotApplicableNote).toBe(false);
  });

  it('builds the page title with member name and health trends suffix', () => {
    const response = new MemberHealthResponseBuilder()
      .withMemberName('Alice')
      .build();
    const viewModel = makePresenter().present({
      response,
      teamId: 'team-1',
      cycleCount: 5,
    });

    expect(viewModel.pageTitle).toBe('Alice — Health Trends');
    expect(viewModel.memberName).toBe('Alice');
  });

  it('builds breadcrumbs with Shiplens, Cycle Report, and member name', () => {
    const response = new MemberHealthResponseBuilder()
      .withMemberName('Alice')
      .build();
    const viewModel = makePresenter().present({
      response,
      teamId: 'team-1',
      cycleCount: 5,
    });

    expect(viewModel.breadcrumbs).toEqual([
      { label: 'Shiplens', href: '/dashboard' },
      { label: 'Cycle Report', href: '/cycle-report?teamId=team-1' },
      { label: 'Alice', href: null },
    ]);
  });

  it('builds the back link with the correct cycle-report URL', () => {
    const viewModel = makePresenter().present(makeInput({ teamId: 'team-42' }));

    expect(viewModel.backToReportHref).toBe('/cycle-report?teamId=team-42');
    expect(viewModel.backToReportLabel).toBe('Back to cycle report');
  });

  it('builds the subtitle with the cycle count', () => {
    const viewModel = makePresenter().present(makeInput({ cycleCount: 3 }));

    expect(viewModel.subtitle).toBe(
      'Health signals computed over the last 3 completed cycles',
    );
  });

  it('builds the subtitle with a different cycle count', () => {
    const viewModel = makePresenter().present(makeInput({ cycleCount: 7 }));

    expect(viewModel.subtitle).toBe(
      'Health signals computed over the last 7 completed cycles',
    );
  });

  it('builds 4 legend items', () => {
    const viewModel = makePresenter().present(makeInput());

    expect(viewModel.legendItems).toEqual([
      { indicator: 'green', label: 'Favorable trend' },
      { indicator: 'orange', label: 'First deviation or mixed' },
      { indicator: 'red', label: 'Unfavorable for 2+ sprints' },
      { indicator: 'gray', label: 'Not enough data' },
    ]);
  });

  it('exposes notice intro and minimum from translations', () => {
    const viewModel = makePresenter().present(makeInput());

    expect(viewModel.noticeIntro).toBe(
      "This dashboard tracks how a team member's work patterns evolve over completed sprints. Each signal compares recent cycles to detect improving or worsening trends.",
    );
    expect(viewModel.noticeMinimum).toBe('3 completed sprints');
  });

  it('exposes cycle count options and selected cycle count', () => {
    const viewModel = makePresenter().present(makeInput({ cycleCount: 5 }));

    expect(viewModel.cycleCountOptions).toEqual([3, 5, 8, 10]);
    expect(viewModel.selectedCycleCount).toBe(5);
  });

  it('exposes the completed sprints label', () => {
    const viewModel = makePresenter().present(makeInput());

    expect(viewModel.completedSprintsLabel).toBe(
      'Completed sprints to analyze:',
    );
  });

  it('uses French labels under the fr locale', () => {
    const response = new MemberHealthResponseBuilder()
      .withMemberName('Alice')
      .build();
    const viewModel = makePresenter('fr').present({
      response,
      teamId: 'team-1',
      cycleCount: 5,
    });

    expect(viewModel.pageTitle).toBe('Alice — Tendances de sante');
    expect(viewModel.backToReportLabel).toBe('Retour au rapport de cycle');
    const signal = viewModel.signals.find(
      (signal) => signal.id === 'estimationScore',
    );
    expect(signal?.label).toBe("Score d'estimation");
  });

  it('maps all 5 signal descriptions from translations', () => {
    const viewModel = makePresenter().present(makeInput());

    const descriptions = viewModel.signals.map((signal) => signal.id);
    const expectedIds: HealthSignalId[] = [
      'estimationScore',
      'underestimationRatio',
      'averageCycleTime',
      'driftingTickets',
      'medianReviewTime',
    ];
    expect(descriptions).toEqual(expectedIds);

    for (const signal of viewModel.signals) {
      expect(signal.description.length).toBeGreaterThan(0);
    }
  });

  it('populates notApplicableNote and notEnoughHistoryNote from translations', () => {
    const response = new MemberHealthResponseBuilder()
      .withEstimationScore({
        value: 'Not applicable',
        trend: null,
        indicator: 'not-applicable',
      })
      .build();
    const viewModel = makePresenter().present({
      response,
      teamId: 'team-1',
      cycleCount: 5,
    });

    const signal = viewModel.signals.find(
      (signal) => signal.id === 'estimationScore',
    );
    expect(signal?.notApplicableNote).toBe(
      'Not applicable — this member has no estimated issues in the analyzed sprints',
    );
    expect(signal?.notEnoughHistoryNote).toBe(
      'Not enough history — at least 3 completed sprints are needed to compute a trend',
    );
  });
});
