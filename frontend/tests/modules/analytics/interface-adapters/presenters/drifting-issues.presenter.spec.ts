import { describe, expect, it } from 'vitest';
import { type Locale } from '@/modules/analytics/interface-adapters/presenters/cycle-metrics.translations.ts';
import { DriftingIssuesPresenter } from '@/modules/analytics/interface-adapters/presenters/drifting-issues.presenter.ts';
import { driftingIssuesTranslations } from '@/modules/analytics/interface-adapters/presenters/drifting-issues.translations.ts';
import { DriftingIssueResponseBuilder } from '../../../../builders/drifting-issue-response.builder.ts';

function makePresenter(
  locale: Locale = 'en',
  selectedMemberName: string | null = null,
) {
  return new DriftingIssuesPresenter(
    driftingIssuesTranslations[locale],
    selectedMemberName,
  );
}

describe('DriftingIssuesPresenter', () => {
  it('maps every response issue to a row keyed by issueExternalId', () => {
    const viewModel = makePresenter().present([
      new DriftingIssueResponseBuilder()
        .withIssueExternalId('LIN-1')
        .withIssueTitle('First story')
        .build(),
      new DriftingIssueResponseBuilder()
        .withIssueExternalId('LIN-2')
        .withIssueTitle('Second story')
        .build(),
    ]);

    expect(viewModel.rows.map((row) => row.id)).toEqual(['LIN-1', 'LIN-2']);
    expect(viewModel.rows.map((row) => row.title)).toEqual([
      'First story',
      'Second story',
    ]);
  });

  it('sets showEmptyMessage true and showList false when there are no issues', () => {
    const viewModel = makePresenter().present([]);

    expect(viewModel.showEmptyMessage).toBe(true);
    expect(viewModel.showList).toBe(false);
    expect(viewModel.emptyMessage).toBe(
      driftingIssuesTranslations.en.emptyMessage,
    );
    expect(viewModel.rows).toEqual([]);
  });

  it('sets showList true and showEmptyMessage false when there is at least one issue', () => {
    const viewModel = makePresenter().present([
      new DriftingIssueResponseBuilder().build(),
    ]);

    expect(viewModel.showList).toBe(true);
    expect(viewModel.showEmptyMessage).toBe(false);
    expect(viewModel.emptyMessage).toBeNull();
  });

  it('formats elapsed and expected durations through the duration-hours utility', () => {
    const viewModel = makePresenter().present([
      new DriftingIssueResponseBuilder()
        .withElapsedBusinessHours(72)
        .withExpectedMaxHours(24)
        .build(),
    ]);

    expect(viewModel.rows[0]?.elapsedLabel).toBe('Elapsed: 3.0 days');
    expect(viewModel.rows[0]?.expectedLabel).toBe('Expected: 24h');
  });

  it('falls back to the translated unavailable label when expectedMaxHours is null', () => {
    const viewModel = makePresenter().present([
      new DriftingIssueResponseBuilder()
        .withElapsedBusinessHours(72)
        .withExpectedMaxHours(null)
        .build(),
    ]);

    expect(viewModel.rows[0]?.expectedLabel).toBe('Expected: Not available');
  });

  it('formats the points label using the translations function', () => {
    const viewModel = makePresenter().present([
      new DriftingIssueResponseBuilder().withPoints(5).build(),
    ]);

    expect(viewModel.rows[0]?.pointsLabel).toBe('5 points');
  });

  it('translates the drifting drift status label', () => {
    const viewModel = makePresenter().present([
      new DriftingIssueResponseBuilder().withDriftStatus('drifting').build(),
    ]);

    expect(viewModel.rows[0]?.driftLabel).toBe('Drifting');
  });

  it('translates the needs-splitting drift status label', () => {
    const viewModel = makePresenter().present([
      new DriftingIssueResponseBuilder()
        .withDriftStatus('needs-splitting')
        .build(),
    ]);

    expect(viewModel.rows[0]?.driftLabel).toBe('Needs splitting');
  });

  it('passes through unknown drift status values verbatim', () => {
    const viewModel = makePresenter().present([
      new DriftingIssueResponseBuilder().withDriftStatus('unknown').build(),
    ]);

    expect(viewModel.rows[0]?.driftLabel).toBe('unknown');
  });

  it('uses French labels under the fr locale', () => {
    const viewModel = makePresenter('fr').present([
      new DriftingIssueResponseBuilder()
        .withElapsedBusinessHours(72)
        .withExpectedMaxHours(null)
        .withPoints(3)
        .withDriftStatus('drifting')
        .build(),
    ]);

    expect(viewModel.rows[0]?.elapsedLabel).toBe('Ecoule: 3.0 jours');
    expect(viewModel.rows[0]?.expectedLabel).toBe('Attendu: Non disponible');
    expect(viewModel.rows[0]?.driftLabel).toBe('En derive');
  });

  it('filters rows to the selected member when a memberName is provided', () => {
    const viewModel = makePresenter('en', 'Alice').present([
      new DriftingIssueResponseBuilder()
        .withIssueExternalId('LIN-alice')
        .withAssigneeName('Alice')
        .build(),
      new DriftingIssueResponseBuilder()
        .withIssueExternalId('LIN-bob')
        .withAssigneeName('Bob')
        .build(),
    ]);

    expect(viewModel.rows.map((row) => row.id)).toEqual(['LIN-alice']);
  });

  it('excludes rows without an assignee when a memberName is selected', () => {
    const viewModel = makePresenter('en', 'Alice').present([
      new DriftingIssueResponseBuilder()
        .withIssueExternalId('LIN-alice')
        .withAssigneeName('Alice')
        .build(),
      new DriftingIssueResponseBuilder()
        .withIssueExternalId('LIN-unassigned')
        .withAssigneeName(null)
        .build(),
    ]);

    expect(viewModel.rows.map((row) => row.id)).toEqual(['LIN-alice']);
  });

  it('exposes the assigneeName and a member-health-trends href when assignee is present', () => {
    const viewModel = makePresenter().present([
      new DriftingIssueResponseBuilder()
        .withTeamId('team-alpha')
        .withAssigneeName('Alice')
        .build(),
    ]);

    expect(viewModel.rows[0]?.assigneeName).toBe('Alice');
    expect(viewModel.rows[0]?.showMemberLink).toBe(true);
    expect(viewModel.rows[0]?.memberHealthTrendsHref).toBe(
      '/member-health-trends?teamId=team-alpha&memberName=Alice',
    );
  });

  it('emits a null href and showMemberLink false when the assignee is missing', () => {
    const viewModel = makePresenter().present([
      new DriftingIssueResponseBuilder().withAssigneeName(null).build(),
    ]);

    expect(viewModel.rows[0]?.assigneeName).toBeNull();
    expect(viewModel.rows[0]?.showMemberLink).toBe(false);
    expect(viewModel.rows[0]?.memberHealthTrendsHref).toBeNull();
  });

  it('excludes epic-like issues (null, zero, or 21+ points) from the drift list', () => {
    const viewModel = makePresenter().present([
      new DriftingIssueResponseBuilder()
        .withIssueExternalId('real-drift')
        .withPoints(3)
        .build(),
      new DriftingIssueResponseBuilder()
        .withIssueExternalId('epic-null')
        .withPoints(null)
        .build(),
      new DriftingIssueResponseBuilder()
        .withIssueExternalId('epic-zero')
        .withPoints(0)
        .build(),
      new DriftingIssueResponseBuilder()
        .withIssueExternalId('epic-twenty-one')
        .withPoints(21)
        .build(),
    ]);

    expect(viewModel.rows.map((row) => row.id)).toEqual(['real-drift']);
  });

  it('formats the assignee display label as the capitalized local part of the email', () => {
    const viewModel = makePresenter().present([
      new DriftingIssueResponseBuilder()
        .withAssigneeName('gauthier@mentorgoal.com')
        .build(),
    ]);

    expect(viewModel.rows[0]?.assigneeLabel).toBe('Gauthier');
    expect(viewModel.rows[0]?.assigneeName).toBe('gauthier@mentorgoal.com');
  });

  it('emits a null assigneeLabel when the assignee is missing', () => {
    const viewModel = makePresenter().present([
      new DriftingIssueResponseBuilder().withAssigneeName(null).build(),
    ]);

    expect(viewModel.rows[0]?.assigneeLabel).toBeNull();
  });
});
