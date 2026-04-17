import { WorkspaceDashboardController } from '@modules/analytics/interface-adapters/controllers/workspace-dashboard.controller.js';
import { WorkspaceDashboardPresenter } from '@modules/analytics/interface-adapters/presenters/workspace-dashboard.presenter.js';
import { StubWorkspaceDashboardDataGateway } from '@modules/analytics/testing/good-path/stub.workspace-dashboard-data.gateway.js';
import { GetWorkspaceDashboardUsecase } from '@modules/analytics/usecases/get-workspace-dashboard.usecase.js';
import { LinearWorkspaceConnection } from '@modules/identity/entities/linear-workspace-connection/linear-workspace-connection.js';
import { StubLinearWorkspaceConnectionGateway } from '@modules/identity/testing/good-path/stub.linear-workspace-connection.gateway.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('WorkspaceDashboardController', () => {
  let gateway: StubWorkspaceDashboardDataGateway;
  let controller: WorkspaceDashboardController;

  beforeEach(() => {
    gateway = new StubWorkspaceDashboardDataGateway();
    const connectionGateway = new StubLinearWorkspaceConnectionGateway();
    connectionGateway.connection = LinearWorkspaceConnection.create({
      id: 'connection-1',
      workspaceId: 'workspace-1',
      workspaceName: 'Test workspace',
      encryptedAccessToken: 'encrypted-access',
      encryptedRefreshToken: 'encrypted-refresh',
      grantedScopes: ['read'],
      status: 'connected',
      connectedAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    });
    const usecase = new GetWorkspaceDashboardUsecase(
      gateway,
      connectionGateway,
    );
    const presenter = new WorkspaceDashboardPresenter();
    controller = new WorkspaceDashboardController(usecase, presenter);
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
});
