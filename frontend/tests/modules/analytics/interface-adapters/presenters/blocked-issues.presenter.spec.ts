import { describe, expect, it } from 'vitest';
import { BlockedIssuesPresenter } from '@/modules/analytics/interface-adapters/presenters/blocked-issues.presenter.ts';
import { blockedIssuesTranslations } from '@/modules/analytics/interface-adapters/presenters/blocked-issues.translations.ts';
import { type Locale } from '@/modules/analytics/interface-adapters/presenters/cycle-metrics.translations.ts';
import { BlockedIssueAlertResponseBuilder } from '../../../../builders/blocked-issue-alert-response.builder.ts';

function makePresenter(selectedTeamId: string, locale: Locale = 'en') {
  return new BlockedIssuesPresenter(
    blockedIssuesTranslations[locale],
    selectedTeamId,
  );
}

describe('BlockedIssuesPresenter', () => {
  it('filters alerts to the selected team', () => {
    const viewModel = makePresenter('team-alpha').present([
      new BlockedIssueAlertResponseBuilder()
        .withId('alert-1')
        .withTeamId('team-alpha')
        .build(),
      new BlockedIssueAlertResponseBuilder()
        .withId('alert-2')
        .withTeamId('team-beta')
        .build(),
      new BlockedIssueAlertResponseBuilder()
        .withId('alert-3')
        .withTeamId('team-alpha')
        .build(),
    ]);

    expect(viewModel.items.map((item) => item.id)).toEqual([
      'alert-1',
      'alert-3',
    ]);
  });

  it('returns an empty items array and an empty message when no alerts match the team', () => {
    const viewModel = makePresenter('team-alpha').present([
      new BlockedIssueAlertResponseBuilder().withTeamId('team-beta').build(),
    ]);

    expect(viewModel.items).toEqual([]);
    expect(viewModel.emptyMessage).toBe(
      blockedIssuesTranslations.en.emptyMessage,
    );
  });

  it('formats durations via the duration-hours utility', () => {
    const viewModel = makePresenter('team-alpha').present([
      new BlockedIssueAlertResponseBuilder()
        .withId('alert-short')
        .withTeamId('team-alpha')
        .withDurationHours(12)
        .build(),
      new BlockedIssueAlertResponseBuilder()
        .withId('alert-long')
        .withTeamId('team-alpha')
        .withDurationHours(72)
        .build(),
    ]);

    const labelsById = new Map(
      viewModel.items.map((item) => [item.id, item.durationLabel]),
    );
    expect(labelsById.get('alert-short')).toBe('12h');
    expect(labelsById.get('alert-long')).toBe('3.0 days');
  });

  it('maps severity to a translated label', () => {
    const viewModel = makePresenter('team-alpha').present([
      new BlockedIssueAlertResponseBuilder()
        .withId('alert-warn')
        .withTeamId('team-alpha')
        .withSeverity('warning')
        .build(),
      new BlockedIssueAlertResponseBuilder()
        .withId('alert-crit')
        .withTeamId('team-alpha')
        .withSeverity('critical')
        .build(),
    ]);

    const labelsById = new Map(
      viewModel.items.map((item) => [item.id, item.severityLabel]),
    );
    expect(labelsById.get('alert-warn')).toBe(
      blockedIssuesTranslations.en.severityWarning,
    );
    expect(labelsById.get('alert-crit')).toBe(
      blockedIssuesTranslations.en.severityCritical,
    );
  });

  it('uses French labels under the fr locale', () => {
    const viewModel = makePresenter('team-alpha', 'fr').present([
      new BlockedIssueAlertResponseBuilder()
        .withTeamId('team-alpha')
        .withSeverity('warning')
        .withDurationHours(72)
        .build(),
    ]);

    expect(viewModel.items[0]?.severityLabel).toBe(
      blockedIssuesTranslations.fr.severityWarning,
    );
    expect(viewModel.items[0]?.durationLabel).toBe('3.0 jours');
  });
});
