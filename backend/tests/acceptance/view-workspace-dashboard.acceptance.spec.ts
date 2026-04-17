import { StubWorkspaceDashboardDataGateway } from '@modules/analytics/testing/good-path/stub.workspace-dashboard-data.gateway.js';
import { GetWorkspaceDashboardUsecase } from '@modules/analytics/usecases/get-workspace-dashboard.usecase.js';
import { LinearWorkspaceConnection } from '@modules/identity/entities/linear-workspace-connection/linear-workspace-connection.js';
import { StubLinearWorkspaceConnectionGateway } from '@modules/identity/testing/good-path/stub.linear-workspace-connection.gateway.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('View Workspace Dashboard (acceptance)', () => {
  let gateway: StubWorkspaceDashboardDataGateway;
  let usecase: GetWorkspaceDashboardUsecase;

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
    usecase = new GetWorkspaceDashboardUsecase(gateway, connectionGateway);
  });

  describe('dashboard displays all teams with active cycles and KPIs', () => {
    it('dashboard nominal: 3 teams with active cycles display KPIs and sync status', async () => {
      gateway.workspaceConnected = true;
      gateway.teams = [
        { teamId: 'team-1', teamName: 'Frontend' },
        { teamId: 'team-2', teamName: 'Backend' },
        { teamId: 'team-3', teamName: 'Mobile' },
      ];
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
        'team-2': {
          cycleId: 'cycle-2',
          cycleName: 'Sprint 5',
          totalIssues: 6,
          completedIssues: 3,
          blockedIssues: 0,
          totalPoints: 15,
          completedPoints: 8,
        },
        'team-3': {
          cycleId: 'cycle-3',
          cycleName: 'Sprint 3',
          totalIssues: 4,
          completedIssues: 4,
          blockedIssues: 0,
          totalPoints: 10,
          completedPoints: 10,
        },
      };
      gateway.previousCycleVelocities = {
        'team-1': [18, 20, 22],
        'team-2': [10, 12, 14],
        'team-3': [8, 9, 10],
      };
      gateway.lastSyncDates = {
        'team-1': new Date('2026-03-31T08:00:00Z'),
        'team-2': new Date('2026-03-31T07:00:00Z'),
        'team-3': new Date('2026-03-31T06:00:00Z'),
      };

      const result = await usecase.execute();

      expect(result.teamDashboards).toHaveLength(3);

      const frontend = result.teamDashboards.find(
        (team) => team.teamId === 'team-1',
      );
      expect(frontend).toBeDefined();
      expect(frontend?.completionRate).toBe(80);
      expect(frontend?.blockedIssuesCount).toBe(1);
      expect(frontend?.velocityTrend).toBe('stable');

      const backend = result.teamDashboards.find(
        (team) => team.teamId === 'team-2',
      );
      expect(backend).toBeDefined();
      expect(backend?.completionRate).toBe(50);
      expect(backend?.blockedIssuesCount).toBe(0);

      expect(result.synchronizationStatus).toBeDefined();
    });

    it('team without active cycle: displays mention instead of KPIs', async () => {
      gateway.workspaceConnected = true;
      gateway.teams = [
        { teamId: 'team-1', teamName: 'Frontend' },
        { teamId: 'team-2', teamName: 'Backend' },
        { teamId: 'team-3', teamName: 'Mobile' },
      ];
      gateway.activeCycles = {
        'team-1': {
          cycleId: 'cycle-1',
          cycleName: 'Sprint 10',
          totalIssues: 10,
          completedIssues: 8,
          blockedIssues: 0,
          totalPoints: 25,
          completedPoints: 20,
        },
        'team-2': {
          cycleId: 'cycle-2',
          cycleName: 'Sprint 5',
          totalIssues: 6,
          completedIssues: 3,
          blockedIssues: 0,
          totalPoints: 15,
          completedPoints: 8,
        },
      };
      gateway.previousCycleVelocities = {
        'team-1': [18, 20, 22],
        'team-2': [10, 12, 14],
      };
      gateway.lastSyncDates = {
        'team-1': new Date('2026-03-31T08:00:00Z'),
        'team-2': new Date('2026-03-31T07:00:00Z'),
        'team-3': new Date('2026-03-31T06:00:00Z'),
      };

      const result = await usecase.execute();

      expect(result.teamDashboards).toHaveLength(3);

      const mobile = result.teamDashboards.find(
        (team) => team.teamId === 'team-3',
      );
      expect(mobile).toBeDefined();
      expect(mobile?.hasActiveCycle).toBe(false);
    });
  });

  describe('velocity trend compares active cycle to previous cycles', () => {
    it('velocity trend hausse when current velocity exceeds average of last 3 cycles', async () => {
      gateway.workspaceConnected = true;
      gateway.teams = [{ teamId: 'team-1', teamName: 'Frontend' }];
      gateway.activeCycles = {
        'team-1': {
          cycleId: 'cycle-1',
          cycleName: 'Sprint 10',
          totalIssues: 10,
          completedIssues: 8,
          blockedIssues: 0,
          totalPoints: 30,
          completedPoints: 30,
        },
      };
      gateway.previousCycleVelocities = {
        'team-1': [18, 20, 22],
      };
      gateway.lastSyncDates = {
        'team-1': new Date('2026-03-31T08:00:00Z'),
      };

      const result = await usecase.execute();

      expect(result.teamDashboards[0].velocityTrend).toBe('hausse');
    });

    it('velocity trend insuffisant when less than 3 previous cycles', async () => {
      gateway.workspaceConnected = true;
      gateway.teams = [{ teamId: 'team-1', teamName: 'Frontend' }];
      gateway.activeCycles = {
        'team-1': {
          cycleId: 'cycle-1',
          cycleName: 'Sprint 10',
          totalIssues: 10,
          completedIssues: 8,
          blockedIssues: 0,
          totalPoints: 25,
          completedPoints: 20,
        },
      };
      gateway.previousCycleVelocities = {
        'team-1': [18],
      };
      gateway.lastSyncDates = {
        'team-1': new Date('2026-03-31T08:00:00Z'),
      };

      const result = await usecase.execute();

      expect(result.teamDashboards[0].velocityTrend).toBe('insuffisant');
    });
  });

  describe('error scenarios', () => {
    it('no teams synchronized: rejects with error', async () => {
      gateway.workspaceConnected = true;
      gateway.teams = [];

      await expect(usecase.execute()).rejects.toThrow(
        "Aucune équipe synchronisée. Veuillez d'abord sélectionner des équipes à synchroniser.",
      );
    });

    it('workspace not connected: rejects with error', async () => {
      gateway.workspaceConnected = false;

      await expect(usecase.execute()).rejects.toThrow(
        'Aucun workspace connecté. Veuillez connecter votre workspace Linear.',
      );
    });
  });

  describe('synchronization status visibility', () => {
    it('synchronization late when last sync > 24h ago', async () => {
      gateway.workspaceConnected = true;
      gateway.teams = [{ teamId: 'team-1', teamName: 'Frontend' }];
      gateway.activeCycles = {
        'team-1': {
          cycleId: 'cycle-1',
          cycleName: 'Sprint 10',
          totalIssues: 10,
          completedIssues: 5,
          blockedIssues: 0,
          totalPoints: 20,
          completedPoints: 10,
        },
      };
      gateway.previousCycleVelocities = { 'team-1': [10, 12, 14] };
      gateway.lastSyncDates = {
        'team-1': new Date('2026-03-29T06:00:00Z'),
      };

      const result = await usecase.execute();

      expect(result.synchronizationStatus.isLate).toBe(true);
    });
  });

  describe('blocked issues alert', () => {
    it('all issues blocked: blockedIssuesCount equals totalIssues', async () => {
      gateway.workspaceConnected = true;
      gateway.teams = [{ teamId: 'team-1', teamName: 'Frontend' }];
      gateway.activeCycles = {
        'team-1': {
          cycleId: 'cycle-1',
          cycleName: 'Sprint 10',
          totalIssues: 5,
          completedIssues: 0,
          blockedIssues: 5,
          totalPoints: 10,
          completedPoints: 0,
        },
      };
      gateway.previousCycleVelocities = { 'team-1': [10, 12, 14] };
      gateway.lastSyncDates = {
        'team-1': new Date('2026-03-31T08:00:00Z'),
      };

      const result = await usecase.execute();
      const team = result.teamDashboards[0];

      expect(team.blockedIssuesCount).toBe(5);
      expect(team.blockedIssuesCount).toBe(team.totalIssues);
    });
  });
});
