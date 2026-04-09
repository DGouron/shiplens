import { WorkspaceDashboardController } from '@modules/analytics/interface-adapters/controllers/workspace-dashboard.controller.js';
import { WorkspaceDashboardPresenter } from '@modules/analytics/interface-adapters/presenters/workspace-dashboard.presenter.js';
import { StubWorkspaceDashboardDataGateway } from '@modules/analytics/testing/good-path/stub.workspace-dashboard-data.gateway.js';
import { StubWorkspaceSettingsGateway } from '@modules/analytics/testing/good-path/stub.workspace-settings.gateway.js';
import { GetWorkspaceDashboardUsecase } from '@modules/analytics/usecases/get-workspace-dashboard.usecase.js';
import { GetWorkspaceLanguageUsecase } from '@modules/analytics/usecases/get-workspace-language.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('WorkspaceDashboardController', () => {
  let gateway: StubWorkspaceDashboardDataGateway;
  let settingsGateway: StubWorkspaceSettingsGateway;
  let controller: WorkspaceDashboardController;

  beforeEach(() => {
    gateway = new StubWorkspaceDashboardDataGateway();
    settingsGateway = new StubWorkspaceSettingsGateway();
    const usecase = new GetWorkspaceDashboardUsecase(gateway);
    const presenter = new WorkspaceDashboardPresenter();
    const getLanguage = new GetWorkspaceLanguageUsecase(settingsGateway);
    controller = new WorkspaceDashboardController(
      usecase,
      presenter,
      getLanguage,
    );
  });

  it('returns formatted dashboard data via JSON endpoint', async () => {
    gateway.workspaceConnected = true;
    gateway.teams = [{ teamId: 'team-1', teamName: 'Frontend' }];
    gateway.activeCycles = {
      'team-1': {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
        totalIssues: 10,
        completedIssues: 8,
        blockedIssues: 1,
        totalPoints: 25,
        completedPoints: 20,
      },
    };
    gateway.previousCycleVelocities = { 'team-1': [18, 20, 22] };
    gateway.lastSyncDates = { 'team-1': new Date('2026-03-31T08:00:00Z') };

    const result = await controller.getDashboardData();

    expect('teams' in result).toBe(true);
    if (!('teams' in result)) return;
    expect(result.teams).toHaveLength(1);
    expect(result.teams[0].teamName).toBe('Frontend');
    expect(result.teams[0].completionRate).toBe('80%');
  });

  it('returns empty state when workspace is not connected', async () => {
    gateway.workspaceConnected = false;

    const result = await controller.getDashboardData();

    expect(result).toEqual({
      status: 'not_connected',
      message:
        'Aucun workspace connecté. Veuillez connecter votre workspace Linear.',
    });
  });

  it('returns empty state when no teams are synchronized', async () => {
    gateway.workspaceConnected = true;
    gateway.teams = [];

    const result = await controller.getDashboardData();

    expect(result).toEqual({
      status: 'no_teams',
      message:
        "Aucune équipe synchronisée. Veuillez d'abord sélectionner des équipes à synchroniser.",
    });
  });

  it('returns HTML page content with default english locale', async () => {
    const result = await controller.getDashboardPage();

    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('Dashboard');
    expect(result).toContain('lang="en"');
  });

  it('returns HTML with french locale when preference is french', async () => {
    settingsGateway.storedLanguage = 'fr';

    const result = await controller.getDashboardPage();

    expect(result).toContain('lang="fr"');
    expect(result).toContain('Changer de theme');
  });
});
