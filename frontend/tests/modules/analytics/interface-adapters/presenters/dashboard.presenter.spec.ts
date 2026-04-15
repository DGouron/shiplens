import { describe, expect, it } from 'vitest';
import { DashboardPresenter } from '@/modules/analytics/interface-adapters/presenters/dashboard.presenter.ts';
import { dashboardTranslations } from '@/modules/analytics/interface-adapters/presenters/dashboard.translations.ts';
import { SynchronizationDtoBuilder } from '../../../../builders/synchronization-dto.builder.ts';
import { TeamDashboardDtoBuilder } from '../../../../builders/team-dashboard-dto.builder.ts';
import { WorkspaceDashboardDtoBuilder } from '../../../../builders/workspace-dashboard-dto.builder.ts';

describe('DashboardPresenter', () => {
  const englishTranslations = dashboardTranslations.en;

  it('maps an active team with 75% completion and no blocked issues to a healthy card', () => {
    const dto = new WorkspaceDashboardDtoBuilder()
      .withTeams([
        new TeamDashboardDtoBuilder()
          .withTeamId('team-1')
          .withTeamName('Alpha')
          .withCompletionRate('75%')
          .withBlockedIssuesCount(0)
          .withBlockedAlert(false)
          .build(),
      ])
      .build();
    const presenter = new DashboardPresenter('en', englishTranslations);

    const viewModel = presenter.present(dto);

    expect(viewModel.teams[0]).toEqual({
      kind: 'active',
      teamId: 'team-1',
      teamName: 'Alpha',
      cycleName: 'Cycle 12',
      completionPercentage: 75,
      healthTier: 'healthy',
      ringStrokeColor: 'var(--success)',
      ringDashOffset: 25,
      velocityText: '12 pts (En hausse)',
      blockedIssuesCount: 0,
      blockedAlert: false,
      reportLink: '/cycle-report?teamId=team-1',
    });
  });

  it('maps a 45% completion team to a warning card', () => {
    const dto = new WorkspaceDashboardDtoBuilder()
      .withTeams([
        new TeamDashboardDtoBuilder()
          .withCompletionRate('45%')
          .withBlockedAlert(false)
          .build(),
      ])
      .build();
    const presenter = new DashboardPresenter('en', englishTranslations);

    const viewModel = presenter.present(dto);

    const team = viewModel.teams[0];
    expect(team.kind).toBe('active');
    if (team.kind === 'active') {
      expect(team.healthTier).toBe('warning');
      expect(team.ringStrokeColor).toBe('var(--warning)');
    }
  });

  it('maps a 20% completion team to a danger card', () => {
    const dto = new WorkspaceDashboardDtoBuilder()
      .withTeams([
        new TeamDashboardDtoBuilder()
          .withCompletionRate('20%')
          .withBlockedAlert(false)
          .build(),
      ])
      .build();
    const presenter = new DashboardPresenter('en', englishTranslations);

    const viewModel = presenter.present(dto);

    const team = viewModel.teams[0];
    expect(team.kind).toBe('active');
    if (team.kind === 'active') {
      expect(team.healthTier).toBe('danger');
      expect(team.ringStrokeColor).toBe('var(--danger)');
    }
  });

  it('maps a blocked-alert team to a danger card regardless of completion', () => {
    const dto = new WorkspaceDashboardDtoBuilder()
      .withTeams([
        new TeamDashboardDtoBuilder()
          .withCompletionRate('90%')
          .withBlockedAlert(true)
          .build(),
      ])
      .build();
    const presenter = new DashboardPresenter('en', englishTranslations);

    const viewModel = presenter.present(dto);

    const team = viewModel.teams[0];
    expect(team.kind).toBe('active');
    if (team.kind === 'active') {
      expect(team.healthTier).toBe('danger');
      expect(team.ringStrokeColor).toBe('var(--danger)');
    }
  });

  it('maps a team without active cycle to an idle card', () => {
    const dto = new WorkspaceDashboardDtoBuilder()
      .withTeams([
        new TeamDashboardDtoBuilder()
          .withTeamId('team-idle')
          .withTeamName('Sleepers')
          .withoutActiveCycle()
          .build(),
      ])
      .build();
    const presenter = new DashboardPresenter('en', englishTranslations);

    const viewModel = presenter.present(dto);

    expect(viewModel.teams[0]).toEqual({
      kind: 'idle',
      teamId: 'team-idle',
      teamName: 'Sleepers',
      noActiveCycleMessage: 'Aucun cycle actif',
    });
  });

  it('falls back to the translation when no noActiveCycleMessage is provided', () => {
    const dto = new WorkspaceDashboardDtoBuilder()
      .withTeams([
        {
          teamId: 'team-idle',
          teamName: 'Sleepers',
          hasActiveCycle: false,
          cycleName: null,
          completionRate: '0%',
          blockedIssuesCount: 0,
          blockedAlert: false,
          currentVelocity: 0,
          velocityTrendLabel: '',
          reportLink: null,
          noActiveCycleMessage: null,
        },
      ])
      .build();
    const presenter = new DashboardPresenter('en', englishTranslations);

    const viewModel = presenter.present(dto);

    const team = viewModel.teams[0];
    expect(team.kind).toBe('idle');
    if (team.kind === 'idle') {
      expect(team.noActiveCycleMessage).toBe('No active cycle');
    }
  });

  it('formats the last sync label with the translation prefix and a locale-formatted date', () => {
    const dto = new WorkspaceDashboardDtoBuilder()
      .withSynchronization(
        new SynchronizationDtoBuilder()
          .withLastSyncDate('2026-04-15T08:00:00.000Z')
          .withIsLate(false)
          .build(),
      )
      .build();
    const presenter = new DashboardPresenter('en', englishTranslations);

    const viewModel = presenter.present(dto);

    const expectedDate = new Intl.DateTimeFormat('en').format(
      new Date('2026-04-15T08:00:00.000Z'),
    );
    expect(viewModel.synchronization.lastSyncLabel).toBe(
      `Last sync: ${expectedDate}`,
    );
    expect(viewModel.synchronization.hasSyncHistory).toBe(true);
    expect(viewModel.synchronization.isLate).toBe(false);
    expect(viewModel.synchronization.lateWarning).toBeNull();
  });

  it('uses the neverSynced label when lastSyncDate is null', () => {
    const dto = new WorkspaceDashboardDtoBuilder()
      .withSynchronization(
        new SynchronizationDtoBuilder().withLastSyncDate(null).build(),
      )
      .build();
    const presenter = new DashboardPresenter('en', englishTranslations);

    const viewModel = presenter.present(dto);

    expect(viewModel.synchronization.lastSyncLabel).toBe('Never synced');
    expect(viewModel.synchronization.hasSyncHistory).toBe(false);
  });

  it('exposes the lateWarning translation when the synchronization is late', () => {
    const dto = new WorkspaceDashboardDtoBuilder()
      .withSynchronization(
        new SynchronizationDtoBuilder().withIsLate(true).build(),
      )
      .build();
    const presenter = new DashboardPresenter('en', englishTranslations);

    const viewModel = presenter.present(dto);

    expect(viewModel.synchronization.isLate).toBe(true);
    expect(viewModel.synchronization.lateWarning).toBe('Last sync is late');
  });

  it('uses the French translations when the locale is fr', () => {
    const dto = new WorkspaceDashboardDtoBuilder()
      .withTeams([new TeamDashboardDtoBuilder().withoutActiveCycle().build()])
      .withSynchronization(
        new SynchronizationDtoBuilder().withLastSyncDate(null).build(),
      )
      .build();
    const presenter = new DashboardPresenter('fr', dashboardTranslations.fr);

    const viewModel = presenter.present(dto);

    expect(viewModel.synchronization.lastSyncLabel).toBe('Jamais synchronise');
  });
});
