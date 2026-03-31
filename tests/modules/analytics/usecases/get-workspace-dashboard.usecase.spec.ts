import { describe, it, expect, beforeEach } from 'vitest';
import { GetWorkspaceDashboardUsecase } from '@modules/analytics/usecases/get-workspace-dashboard.usecase.js';
import { StubWorkspaceDashboardDataGateway } from '@modules/analytics/testing/good-path/stub.workspace-dashboard-data.gateway.js';
import { WorkspaceNotConnectedError } from '@modules/analytics/entities/workspace-dashboard/workspace-dashboard.errors.js';
import { NoTeamsSynchronizedError } from '@modules/analytics/entities/workspace-dashboard/workspace-dashboard.errors.js';

describe('GetWorkspaceDashboardUsecase', () => {
  let gateway: StubWorkspaceDashboardDataGateway;
  let usecase: GetWorkspaceDashboardUsecase;

  beforeEach(() => {
    gateway = new StubWorkspaceDashboardDataGateway();
    usecase = new GetWorkspaceDashboardUsecase(gateway);
  });

  it('throws WorkspaceNotConnectedError when workspace is not connected', async () => {
    gateway.workspaceConnected = false;

    await expect(usecase.execute()).rejects.toThrow(WorkspaceNotConnectedError);
  });

  it('throws NoTeamsSynchronizedError when no teams are synchronized', async () => {
    gateway.workspaceConnected = true;
    gateway.teams = [];

    await expect(usecase.execute()).rejects.toThrow(NoTeamsSynchronizedError);
  });

  it('returns team dashboard with KPIs for team with active cycle', async () => {
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

    const result = await usecase.execute();

    expect(result.teamDashboards).toHaveLength(1);
    const team = result.teamDashboards[0];
    expect(team.teamId).toBe('team-1');
    expect(team.teamName).toBe('Frontend');
    expect(team.hasActiveCycle).toBe(true);
    expect(team.completionRate).toBe(80);
    expect(team.blockedIssuesCount).toBe(1);
    expect(team.totalIssues).toBe(10);
    expect(team.currentVelocity).toBe(20);
  });

  it('returns team dashboard without KPIs for team without active cycle', async () => {
    gateway.workspaceConnected = true;
    gateway.teams = [{ teamId: 'team-1', teamName: 'Frontend' }];
    gateway.lastSyncDates = { 'team-1': new Date('2026-03-31T08:00:00Z') };

    const result = await usecase.execute();

    expect(result.teamDashboards).toHaveLength(1);
    const team = result.teamDashboards[0];
    expect(team.hasActiveCycle).toBe(false);
    expect(team.completionRate).toBe(0);
    expect(team.blockedIssuesCount).toBe(0);
  });

  it('computes velocity trend hausse when current velocity exceeds average', async () => {
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
    gateway.previousCycleVelocities = { 'team-1': [18, 20, 22] };
    gateway.lastSyncDates = { 'team-1': new Date('2026-03-31T08:00:00Z') };

    const result = await usecase.execute();

    expect(result.teamDashboards[0].velocityTrend).toBe('hausse');
  });

  it('computes velocity trend baisse when current velocity is below average', async () => {
    gateway.workspaceConnected = true;
    gateway.teams = [{ teamId: 'team-1', teamName: 'Frontend' }];
    gateway.activeCycles = {
      'team-1': {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
        totalIssues: 10,
        completedIssues: 2,
        blockedIssues: 0,
        totalPoints: 25,
        completedPoints: 10,
      },
    };
    gateway.previousCycleVelocities = { 'team-1': [18, 20, 22] };
    gateway.lastSyncDates = { 'team-1': new Date('2026-03-31T08:00:00Z') };

    const result = await usecase.execute();

    expect(result.teamDashboards[0].velocityTrend).toBe('baisse');
  });

  it('computes velocity trend stable when current velocity is close to average', async () => {
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
    gateway.previousCycleVelocities = { 'team-1': [18, 20, 22] };
    gateway.lastSyncDates = { 'team-1': new Date('2026-03-31T08:00:00Z') };

    const result = await usecase.execute();

    expect(result.teamDashboards[0].velocityTrend).toBe('stable');
  });

  it('computes velocity trend insuffisant when less than 3 previous cycles', async () => {
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
    gateway.previousCycleVelocities = { 'team-1': [18] };
    gateway.lastSyncDates = { 'team-1': new Date('2026-03-31T08:00:00Z') };

    const result = await usecase.execute();

    expect(result.teamDashboards[0].velocityTrend).toBe('insuffisant');
  });

  it('marks synchronization as late when last sync is over 24h ago', async () => {
    gateway.workspaceConnected = true;
    gateway.teams = [{ teamId: 'team-1', teamName: 'Frontend' }];
    gateway.activeCycles = {
      'team-1': {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
        totalIssues: 5,
        completedIssues: 2,
        blockedIssues: 0,
        totalPoints: 10,
        completedPoints: 5,
      },
    };
    gateway.previousCycleVelocities = { 'team-1': [10, 12, 14] };
    gateway.lastSyncDates = {
      'team-1': new Date('2026-03-29T06:00:00Z'),
    };

    const result = await usecase.execute();

    expect(result.synchronizationStatus.isLate).toBe(true);
  });

  it('marks synchronization as not late when last sync is within 24h', async () => {
    gateway.workspaceConnected = true;
    gateway.teams = [{ teamId: 'team-1', teamName: 'Frontend' }];
    gateway.activeCycles = {
      'team-1': {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
        totalIssues: 5,
        completedIssues: 2,
        blockedIssues: 0,
        totalPoints: 10,
        completedPoints: 5,
      },
    };
    gateway.previousCycleVelocities = { 'team-1': [10, 12, 14] };
    gateway.lastSyncDates = {
      'team-1': new Date(Date.now() - 1000 * 60 * 60),
    };

    const result = await usecase.execute();

    expect(result.synchronizationStatus.isLate).toBe(false);
  });
});
