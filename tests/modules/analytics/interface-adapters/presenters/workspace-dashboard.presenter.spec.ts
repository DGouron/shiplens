import { describe, it, expect } from 'vitest';
import { WorkspaceDashboardPresenter } from '@modules/analytics/interface-adapters/presenters/workspace-dashboard.presenter.js';

describe('WorkspaceDashboardPresenter', () => {
  const presenter = new WorkspaceDashboardPresenter();

  it('formats completion rate as percentage string', () => {
    const result = presenter.present({
      teamDashboards: [
        {
          teamId: 'team-1',
          teamName: 'Frontend',
          hasActiveCycle: true,
          cycleName: 'Sprint 10',
          completionRate: 80,
          blockedIssuesCount: 1,
          totalIssues: 10,
          currentVelocity: 20,
          velocityTrend: 'stable',
        },
      ],
      synchronizationStatus: {
        lastSyncDate: new Date('2026-03-31T08:00:00Z'),
        isLate: false,
        nextSync: 'Synchronisation manuelle',
      },
    });

    expect(result.teams[0].completionRate).toBe('80%');
  });

  it('formats velocity trend as readable French label', () => {
    const result = presenter.present({
      teamDashboards: [
        {
          teamId: 'team-1',
          teamName: 'Frontend',
          hasActiveCycle: true,
          cycleName: 'Sprint 10',
          completionRate: 50,
          blockedIssuesCount: 0,
          totalIssues: 10,
          currentVelocity: 20,
          velocityTrend: 'hausse',
        },
      ],
      synchronizationStatus: {
        lastSyncDate: new Date('2026-03-31T08:00:00Z'),
        isLate: false,
        nextSync: 'Synchronisation manuelle',
      },
    });

    expect(result.teams[0].velocityTrendLabel).toBe('En hausse');
  });

  it('formats velocity trend baisse', () => {
    const result = presenter.present({
      teamDashboards: [
        {
          teamId: 'team-1',
          teamName: 'Frontend',
          hasActiveCycle: true,
          cycleName: 'Sprint 10',
          completionRate: 50,
          blockedIssuesCount: 0,
          totalIssues: 10,
          currentVelocity: 10,
          velocityTrend: 'baisse',
        },
      ],
      synchronizationStatus: {
        lastSyncDate: new Date('2026-03-31T08:00:00Z'),
        isLate: false,
        nextSync: 'Synchronisation manuelle',
      },
    });

    expect(result.teams[0].velocityTrendLabel).toBe('En baisse');
  });

  it('formats velocity trend stable', () => {
    const result = presenter.present({
      teamDashboards: [
        {
          teamId: 'team-1',
          teamName: 'Frontend',
          hasActiveCycle: true,
          cycleName: 'Sprint 10',
          completionRate: 50,
          blockedIssuesCount: 0,
          totalIssues: 10,
          currentVelocity: 20,
          velocityTrend: 'stable',
        },
      ],
      synchronizationStatus: {
        lastSyncDate: new Date('2026-03-31T08:00:00Z'),
        isLate: false,
        nextSync: 'Synchronisation manuelle',
      },
    });

    expect(result.teams[0].velocityTrendLabel).toBe('Stable');
  });

  it('formats velocity trend insuffisant', () => {
    const result = presenter.present({
      teamDashboards: [
        {
          teamId: 'team-1',
          teamName: 'Frontend',
          hasActiveCycle: true,
          cycleName: 'Sprint 10',
          completionRate: 50,
          blockedIssuesCount: 0,
          totalIssues: 10,
          currentVelocity: 20,
          velocityTrend: 'insuffisant',
        },
      ],
      synchronizationStatus: {
        lastSyncDate: new Date('2026-03-31T08:00:00Z'),
        isLate: false,
        nextSync: 'Synchronisation manuelle',
      },
    });

    expect(result.teams[0].velocityTrendLabel).toBe('Données insuffisantes');
  });

  it('sets blocked alert flag when blocked issues equal total issues', () => {
    const result = presenter.present({
      teamDashboards: [
        {
          teamId: 'team-1',
          teamName: 'Frontend',
          hasActiveCycle: true,
          cycleName: 'Sprint 10',
          completionRate: 0,
          blockedIssuesCount: 5,
          totalIssues: 5,
          currentVelocity: 0,
          velocityTrend: 'stable',
        },
      ],
      synchronizationStatus: {
        lastSyncDate: new Date('2026-03-31T08:00:00Z'),
        isLate: false,
        nextSync: 'Synchronisation manuelle',
      },
    });

    expect(result.teams[0].blockedAlert).toBe(true);
  });

  it('does not set blocked alert when some issues are not blocked', () => {
    const result = presenter.present({
      teamDashboards: [
        {
          teamId: 'team-1',
          teamName: 'Frontend',
          hasActiveCycle: true,
          cycleName: 'Sprint 10',
          completionRate: 50,
          blockedIssuesCount: 2,
          totalIssues: 10,
          currentVelocity: 20,
          velocityTrend: 'stable',
        },
      ],
      synchronizationStatus: {
        lastSyncDate: new Date('2026-03-31T08:00:00Z'),
        isLate: false,
        nextSync: 'Synchronisation manuelle',
      },
    });

    expect(result.teams[0].blockedAlert).toBe(false);
  });

  it('shows sync late warning when synchronization is late', () => {
    const result = presenter.present({
      teamDashboards: [],
      synchronizationStatus: {
        lastSyncDate: new Date('2026-03-29T06:00:00Z'),
        isLate: true,
        nextSync: 'Synchronisation manuelle',
      },
    });

    expect(result.synchronization.isLate).toBe(true);
    expect(result.synchronization.lateWarning).toBe('Synchronisation en retard');
  });

  it('does not show sync late warning when synchronization is recent', () => {
    const result = presenter.present({
      teamDashboards: [],
      synchronizationStatus: {
        lastSyncDate: new Date('2026-03-31T08:00:00Z'),
        isLate: false,
        nextSync: 'Synchronisation manuelle',
      },
    });

    expect(result.synchronization.isLate).toBe(false);
    expect(result.synchronization.lateWarning).toBeNull();
  });

  it('shows report link for team with active cycle', () => {
    const result = presenter.present({
      teamDashboards: [
        {
          teamId: 'team-1',
          teamName: 'Frontend',
          hasActiveCycle: true,
          cycleName: 'Sprint 10',
          completionRate: 80,
          blockedIssuesCount: 0,
          totalIssues: 10,
          currentVelocity: 20,
          velocityTrend: 'stable',
        },
      ],
      synchronizationStatus: {
        lastSyncDate: new Date('2026-03-31T08:00:00Z'),
        isLate: false,
        nextSync: 'Synchronisation manuelle',
      },
    });

    expect(result.teams[0].reportLink).toBe('/cycle-report?teamId=team-1');
  });

  it('shows no report message for team without active cycle', () => {
    const result = presenter.present({
      teamDashboards: [
        {
          teamId: 'team-1',
          teamName: 'Frontend',
          hasActiveCycle: false,
          cycleName: null,
          completionRate: 0,
          blockedIssuesCount: 0,
          totalIssues: 0,
          currentVelocity: 0,
          velocityTrend: 'insuffisant',
        },
      ],
      synchronizationStatus: {
        lastSyncDate: new Date('2026-03-31T08:00:00Z'),
        isLate: false,
        nextSync: 'Synchronisation manuelle',
      },
    });

    expect(result.teams[0].reportLink).toBeNull();
    expect(result.teams[0].noActiveCycleMessage).toBe('Aucun cycle actif');
  });
});
