import { describe, expect, it } from 'vitest';
import { DashboardPresenter } from '@/modules/analytics/interface-adapters/presenters/dashboard.presenter.ts';
import { dashboardTranslations } from '@/modules/analytics/interface-adapters/presenters/dashboard.translations.ts';
import { SynchronizationResponseBuilder } from '../../../../builders/synchronization-response.builder.ts';
import { TeamDashboardResponseBuilder } from '../../../../builders/team-dashboard-response.builder.ts';
import { WorkspaceDashboardResponseBuilder } from '../../../../builders/workspace-dashboard-response.builder.ts';

describe('DashboardPresenter', () => {
  const englishTranslations = dashboardTranslations.en;

  it('maps an active team with 75% completion and no blocked issues to a healthy card', () => {
    const dto = new WorkspaceDashboardResponseBuilder()
      .withTeams([
        new TeamDashboardResponseBuilder()
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
      isSelected: true,
    });
  });

  it('maps a 45% completion team to a warning card', () => {
    const dto = new WorkspaceDashboardResponseBuilder()
      .withTeams([
        new TeamDashboardResponseBuilder()
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
    const dto = new WorkspaceDashboardResponseBuilder()
      .withTeams([
        new TeamDashboardResponseBuilder()
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
    const dto = new WorkspaceDashboardResponseBuilder()
      .withTeams([
        new TeamDashboardResponseBuilder()
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
    const dto = new WorkspaceDashboardResponseBuilder()
      .withTeams([
        new TeamDashboardResponseBuilder()
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
      isSelected: true,
    });
  });

  it('falls back to the translation when no noActiveCycleMessage is provided', () => {
    const dto = new WorkspaceDashboardResponseBuilder()
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
    const dto = new WorkspaceDashboardResponseBuilder()
      .withSynchronization(
        new SynchronizationResponseBuilder()
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
    const dto = new WorkspaceDashboardResponseBuilder()
      .withSynchronization(
        new SynchronizationResponseBuilder().withLastSyncDate(null).build(),
      )
      .build();
    const presenter = new DashboardPresenter('en', englishTranslations);

    const viewModel = presenter.present(dto);

    expect(viewModel.synchronization.lastSyncLabel).toBe('Never synced');
    expect(viewModel.synchronization.hasSyncHistory).toBe(false);
  });

  it('exposes the lateWarning translation when the synchronization is late', () => {
    const dto = new WorkspaceDashboardResponseBuilder()
      .withSynchronization(
        new SynchronizationResponseBuilder().withIsLate(true).build(),
      )
      .build();
    const presenter = new DashboardPresenter('en', englishTranslations);

    const viewModel = presenter.present(dto);

    expect(viewModel.synchronization.isLate).toBe(true);
    expect(viewModel.synchronization.lateWarning).toBe('Last sync is late');
  });

  it('uses the French translations when the locale is fr', () => {
    const dto = new WorkspaceDashboardResponseBuilder()
      .withTeams([
        new TeamDashboardResponseBuilder().withoutActiveCycle().build(),
      ])
      .withSynchronization(
        new SynchronizationResponseBuilder().withLastSyncDate(null).build(),
      )
      .build();
    const presenter = new DashboardPresenter('fr', dashboardTranslations.fr);

    const viewModel = presenter.present(dto);

    expect(viewModel.synchronization.lastSyncLabel).toBe('Jamais synchronise');
  });

  it('selects the alphabetical first team when no persisted selection is provided', () => {
    const dto = new WorkspaceDashboardResponseBuilder()
      .withTeams([
        new TeamDashboardResponseBuilder()
          .withTeamId('team-bravo')
          .withTeamName('Bravo')
          .build(),
        new TeamDashboardResponseBuilder()
          .withTeamId('team-alpha')
          .withTeamName('Alpha')
          .build(),
        new TeamDashboardResponseBuilder()
          .withTeamId('team-charlie')
          .withTeamName('Charlie')
          .build(),
      ])
      .build();
    const presenter = new DashboardPresenter('en', englishTranslations);

    const viewModel = presenter.present(dto, { persistedTeamId: null });

    expect(viewModel.selectedTeamId).toBe('team-alpha');
  });

  it('restores the persisted selection when the team still exists', () => {
    const dto = new WorkspaceDashboardResponseBuilder()
      .withTeams([
        new TeamDashboardResponseBuilder()
          .withTeamId('team-alpha')
          .withTeamName('Alpha')
          .build(),
        new TeamDashboardResponseBuilder()
          .withTeamId('team-bravo')
          .withTeamName('Bravo')
          .build(),
      ])
      .build();
    const presenter = new DashboardPresenter('en', englishTranslations);

    const viewModel = presenter.present(dto, {
      persistedTeamId: 'team-bravo',
    });

    expect(viewModel.selectedTeamId).toBe('team-bravo');
  });

  it('falls back to alphabetical first when the persisted id no longer exists', () => {
    const dto = new WorkspaceDashboardResponseBuilder()
      .withTeams([
        new TeamDashboardResponseBuilder()
          .withTeamId('team-alpha')
          .withTeamName('Alpha')
          .build(),
        new TeamDashboardResponseBuilder()
          .withTeamId('team-bravo')
          .withTeamName('Bravo')
          .build(),
      ])
      .build();
    const presenter = new DashboardPresenter('en', englishTranslations);

    const viewModel = presenter.present(dto, {
      persistedTeamId: 'team-deleted',
    });

    expect(viewModel.selectedTeamId).toBe('team-alpha');
  });

  it('has a null selectedTeamId when the workspace has no teams', () => {
    const dto = new WorkspaceDashboardResponseBuilder().withTeams([]).build();
    const presenter = new DashboardPresenter('en', englishTranslations);

    const viewModel = presenter.present(dto, { persistedTeamId: null });

    expect(viewModel.selectedTeamId).toBeNull();
  });

  it('flags exactly one team as selected', () => {
    const dto = new WorkspaceDashboardResponseBuilder()
      .withTeams([
        new TeamDashboardResponseBuilder()
          .withTeamId('team-alpha')
          .withTeamName('Alpha')
          .build(),
        new TeamDashboardResponseBuilder()
          .withTeamId('team-bravo')
          .withTeamName('Bravo')
          .build(),
        new TeamDashboardResponseBuilder()
          .withTeamId('team-charlie')
          .withTeamName('Charlie')
          .build(),
      ])
      .build();
    const presenter = new DashboardPresenter('en', englishTranslations);

    const viewModel = presenter.present(dto, {
      persistedTeamId: 'team-bravo',
    });

    const selectedCount = viewModel.teams.filter(
      (team) => team.isSelected,
    ).length;
    expect(selectedCount).toBe(1);
    const selectedTeam = viewModel.teams.find((team) => team.isSelected);
    expect(selectedTeam?.teamId).toBe('team-bravo');
  });

  it('sets showEmptyTeamsMessage true with the English message when teams array is empty', () => {
    const dto = new WorkspaceDashboardResponseBuilder().withTeams([]).build();
    const presenter = new DashboardPresenter('en', englishTranslations);

    const viewModel = presenter.present(dto, { persistedTeamId: null });

    expect(viewModel.showEmptyTeamsMessage).toBe(true);
    expect(viewModel.emptyTeamsMessage).toBe(
      'No teams available. Connect Linear and select teams to sync first.',
    );
  });

  it('sets showEmptyTeamsMessage false with null message when teams are present', () => {
    const dto = new WorkspaceDashboardResponseBuilder().build();
    const presenter = new DashboardPresenter('en', englishTranslations);

    const viewModel = presenter.present(dto, { persistedTeamId: null });

    expect(viewModel.showEmptyTeamsMessage).toBe(false);
    expect(viewModel.emptyTeamsMessage).toBeNull();
  });

  it('uses the French emptyTeamsMessage when the locale is fr', () => {
    const dto = new WorkspaceDashboardResponseBuilder().withTeams([]).build();
    const presenter = new DashboardPresenter('fr', dashboardTranslations.fr);

    const viewModel = presenter.present(dto, { persistedTeamId: null });

    expect(viewModel.emptyTeamsMessage).toBe(
      "Aucune équipe disponible. Connectez Linear et sélectionnez des équipes à synchroniser d'abord.",
    );
  });
});
