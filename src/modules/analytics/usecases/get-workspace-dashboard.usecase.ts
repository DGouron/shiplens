import { Injectable, Logger } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { WorkspaceDashboardDataGateway } from '../entities/workspace-dashboard/workspace-dashboard-data.gateway.js';
import { WorkspaceNotConnectedError, NoTeamsSynchronizedError } from '../entities/workspace-dashboard/workspace-dashboard.errors.js';

type VelocityTrend = 'hausse' | 'baisse' | 'stable' | 'insuffisant';

export interface TeamDashboard {
  teamId: string;
  teamName: string;
  hasActiveCycle: boolean;
  cycleName: string | null;
  completionRate: number;
  blockedIssuesCount: number;
  totalIssues: number;
  currentVelocity: number;
  velocityTrend: VelocityTrend;
}

export interface SynchronizationStatus {
  lastSyncDate: Date | null;
  isLate: boolean;
  nextSync: string;
}

export interface WorkspaceDashboardResult {
  teamDashboards: TeamDashboard[];
  synchronizationStatus: SynchronizationStatus;
}

const VELOCITY_TREND_THRESHOLD = 0.1;
const MINIMUM_PREVIOUS_CYCLES_FOR_TREND = 3;
const LATE_SYNC_THRESHOLD_HOURS = 24;

@Injectable()
export class GetWorkspaceDashboardUsecase
  implements Usecase<void, WorkspaceDashboardResult>
{
  private readonly logger = new Logger(GetWorkspaceDashboardUsecase.name);

  constructor(
    private readonly dashboardDataGateway: WorkspaceDashboardDataGateway,
  ) {}

  async execute(): Promise<WorkspaceDashboardResult> {
    this.logger.log('Workspace dashboard generation started');

    const isConnected = await this.dashboardDataGateway.isWorkspaceConnected();
    if (!isConnected) {
      throw new WorkspaceNotConnectedError();
    }

    const teams = await this.dashboardDataGateway.getSynchronizedTeams();
    if (teams.length === 0) {
      throw new NoTeamsSynchronizedError();
    }

    const teamDataList = await Promise.all(
      teams.map(async (team) => {
        const activeCycle = await this.dashboardDataGateway.getActiveCycle(team.teamId);
        const previousVelocities = await this.dashboardDataGateway.getPreviousCycleVelocities(team.teamId);
        const lastSyncDate = await this.dashboardDataGateway.getLastSyncDate(team.teamId);
        return { team, activeCycle, previousVelocities, lastSyncDate };
      }),
    );

    const syncDates = teamDataList
      .map((data) => data.lastSyncDate)
      .filter((date): date is Date => date !== null);

    const mostRecentSyncDate =
      syncDates.length > 0
        ? syncDates.reduce((latest, date) => (date > latest ? date : latest))
        : null;

    const teamDashboards: TeamDashboard[] = teamDataList.map(
      ({ team, activeCycle, previousVelocities }) => {
        if (activeCycle === null) {
          return {
            teamId: team.teamId,
            teamName: team.teamName,
            hasActiveCycle: false,
            cycleName: null,
            completionRate: 0,
            blockedIssuesCount: 0,
            totalIssues: 0,
            currentVelocity: 0,
            velocityTrend: 'insuffisant' satisfies VelocityTrend,
          };
        }

        const completionRate =
          activeCycle.totalIssues > 0
            ? Math.round((activeCycle.completedIssues / activeCycle.totalIssues) * 100)
            : 0;

        const currentVelocity = activeCycle.completedPoints;
        const velocityTrend = this.computeVelocityTrend(currentVelocity, previousVelocities);

        return {
          teamId: team.teamId,
          teamName: team.teamName,
          hasActiveCycle: true,
          cycleName: activeCycle.cycleName,
          completionRate,
          blockedIssuesCount: activeCycle.blockedIssues,
          totalIssues: activeCycle.totalIssues,
          currentVelocity,
          velocityTrend,
        };
      },
    );

    const isLate = this.isSynchronizationLate(mostRecentSyncDate);

    this.logger.log(`Workspace dashboard generated — teams: ${teamDashboards.length}`);

    return {
      teamDashboards,
      synchronizationStatus: {
        lastSyncDate: mostRecentSyncDate,
        isLate,
        nextSync: 'Synchronisation manuelle',
      },
    };
  }

  private computeVelocityTrend(
    currentVelocity: number,
    previousVelocities: number[],
  ): VelocityTrend {
    if (previousVelocities.length < MINIMUM_PREVIOUS_CYCLES_FOR_TREND) {
      return 'insuffisant';
    }

    const average =
      previousVelocities.reduce((sum, velocity) => sum + velocity, 0) /
      previousVelocities.length;

    if (average === 0) {
      return currentVelocity > 0 ? 'hausse' : 'stable';
    }

    const ratio = (currentVelocity - average) / average;

    if (ratio > VELOCITY_TREND_THRESHOLD) {
      return 'hausse';
    }
    if (ratio < -VELOCITY_TREND_THRESHOLD) {
      return 'baisse';
    }
    return 'stable';
  }

  private isSynchronizationLate(lastSyncDate: Date | null): boolean {
    if (lastSyncDate === null) {
      return true;
    }

    const hoursSinceLastSync =
      (Date.now() - lastSyncDate.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastSync > LATE_SYNC_THRESHOLD_HOURS;
  }
}
