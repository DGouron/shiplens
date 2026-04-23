import { describe, expect, it } from 'vitest';
import { BottleneckAnalysisPresenter } from '@/modules/analytics/interface-adapters/presenters/bottleneck-analysis.presenter.ts';
import { bottleneckAnalysisTranslations } from '@/modules/analytics/interface-adapters/presenters/bottleneck-analysis.translations.ts';
import { type Locale } from '@/modules/analytics/interface-adapters/presenters/cycle-metrics.translations.ts';
import { BottleneckAnalysisResponseBuilder } from '../../../../builders/bottleneck-analysis-response.builder.ts';

function makePresenter(
  locale: Locale = 'en',
  selectedMemberName: string | null = null,
) {
  return new BottleneckAnalysisPresenter(
    bottleneckAnalysisTranslations[locale],
    selectedMemberName,
  );
}

describe('BottleneckAnalysisPresenter', () => {
  it('sorts status distribution by median hours descending', () => {
    const viewModel = makePresenter().present(
      new BottleneckAnalysisResponseBuilder()
        .withStatusDistribution([
          { statusName: 'Todo', medianHours: 3 },
          { statusName: 'In Review', medianHours: 48 },
          { statusName: 'In Progress', medianHours: 12 },
        ])
        .withBottleneckStatus('In Review')
        .build(),
    );

    expect(viewModel.rows.map((row) => row.statusName)).toEqual([
      'In Review',
      'In Progress',
      'Todo',
    ]);
  });

  it('formats median hours via the duration-hours utility', () => {
    const viewModel = makePresenter().present(
      new BottleneckAnalysisResponseBuilder()
        .withStatusDistribution([
          { statusName: 'Done', medianHours: 0 },
          { statusName: 'Todo', medianHours: 0.4 },
          { statusName: 'In Progress', medianHours: 12 },
          { statusName: 'In Review', medianHours: 72 },
        ])
        .withBottleneckStatus('In Review')
        .build(),
    );

    const labelsByStatus = new Map(
      viewModel.rows.map((row) => [row.statusName, row.medianHoursLabel]),
    );
    expect(labelsByStatus.get('Done')).toBe('0h');
    expect(labelsByStatus.get('Todo')).toBe('0.4h');
    expect(labelsByStatus.get('In Progress')).toBe('12h');
    expect(labelsByStatus.get('In Review')).toBe('3.0 days');
  });

  it('flags the row whose statusName matches bottleneckStatus as the bottleneck', () => {
    const viewModel = makePresenter().present(
      new BottleneckAnalysisResponseBuilder()
        .withStatusDistribution([
          { statusName: 'In Progress', medianHours: 12 },
          { statusName: 'In Review', medianHours: 30 },
        ])
        .withBottleneckStatus('In Review')
        .build(),
    );

    const reviewRow = viewModel.rows.find(
      (row) => row.statusName === 'In Review',
    );
    const inProgressRow = viewModel.rows.find(
      (row) => row.statusName === 'In Progress',
    );
    expect(reviewRow?.isBottleneck).toBe(true);
    expect(inProgressRow?.isBottleneck).toBe(false);
  });

  it('returns an empty rows array and an empty message for a cycle with no tracked statuses', () => {
    const viewModel = makePresenter().present(
      new BottleneckAnalysisResponseBuilder()
        .withStatusDistribution([])
        .withBottleneckStatus('')
        .build(),
    );

    expect(viewModel.rows).toEqual([]);
    expect(viewModel.emptyMessage).toBe(
      bottleneckAnalysisTranslations.en.emptyMessage,
    );
  });

  it('uses the selected member assignee breakdown rather than the team-wide distribution when a member is filtered', () => {
    const viewModel = makePresenter('en', 'gauthier@mentorgoal.com').present(
      new BottleneckAnalysisResponseBuilder()
        .withStatusDistribution([
          { statusName: 'In Progress', medianHours: 12 },
          { statusName: 'In Review', medianHours: 30 },
        ])
        .withBottleneckStatus('In Review')
        .withAssigneeBreakdown([
          {
            assigneeName: 'gauthier@mentorgoal.com',
            statusMedians: [
              { statusName: 'In Progress', medianHours: 40 },
              { statusName: 'In Review', medianHours: 10 },
            ],
          },
          {
            assigneeName: 'alice@mentorgoal.com',
            statusMedians: [
              { statusName: 'In Progress', medianHours: 5 },
              { statusName: 'In Review', medianHours: 60 },
            ],
          },
        ])
        .build(),
    );

    expect(viewModel.rows.map((row) => row.statusName)).toEqual([
      'In Progress',
      'In Review',
    ]);
    const inProgressRow = viewModel.rows.find(
      (row) => row.statusName === 'In Progress',
    );
    expect(inProgressRow?.medianHoursLabel).toBe('1.7 days');
    expect(inProgressRow?.isBottleneck).toBe(true);
  });

  it('returns an empty view model when the selected member has no assignee breakdown entry', () => {
    const viewModel = makePresenter('en', 'ghost@mentorgoal.com').present(
      new BottleneckAnalysisResponseBuilder()
        .withStatusDistribution([
          { statusName: 'In Progress', medianHours: 12 },
        ])
        .withBottleneckStatus('In Progress')
        .withAssigneeBreakdown([
          {
            assigneeName: 'alice@mentorgoal.com',
            statusMedians: [{ statusName: 'In Review', medianHours: 60 }],
          },
        ])
        .build(),
    );

    expect(viewModel.rows).toEqual([]);
    expect(viewModel.showEmptyMessage).toBe(true);
  });

  it('uses French labels under the fr locale', () => {
    const viewModel = makePresenter('fr').present(
      new BottleneckAnalysisResponseBuilder()
        .withStatusDistribution([{ statusName: 'In Review', medianHours: 72 }])
        .withBottleneckStatus('In Review')
        .build(),
    );

    expect(viewModel.bottleneckHeadline).toContain('Goulot principal');
    expect(viewModel.rows[0]?.medianHoursLabel).toBe('3.0 jours');
  });
});
