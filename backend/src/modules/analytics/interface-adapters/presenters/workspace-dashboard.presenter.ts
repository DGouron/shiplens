import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type WorkspaceDashboardResult } from '../../usecases/get-workspace-dashboard.usecase.js';

interface TeamDashboardDto {
  teamId: string;
  teamName: string;
  hasActiveCycle: boolean;
  cycleName: string | null;
  completionRate: string;
  blockedIssuesCount: number;
  blockedAlert: boolean;
  currentVelocity: number;
  velocityTrendLabel: string;
  reportLink: string | null;
  noActiveCycleMessage: string | null;
}

interface SynchronizationDto {
  lastSyncDate: string | null;
  isLate: boolean;
  lateWarning: string | null;
  nextSync: string;
}

export interface WorkspaceDashboardDto {
  teams: TeamDashboardDto[];
  synchronization: SynchronizationDto;
}

const VELOCITY_TREND_LABELS: Record<string, string> = {
  hausse: 'En hausse',
  baisse: 'En baisse',
  stable: 'Stable',
  insuffisant: 'Données insuffisantes',
};

@Injectable()
export class WorkspaceDashboardPresenter
  implements Presenter<WorkspaceDashboardResult, WorkspaceDashboardDto>
{
  present(input: WorkspaceDashboardResult): WorkspaceDashboardDto {
    return {
      teams: input.teamDashboards.map((team) => ({
        teamId: team.teamId,
        teamName: team.teamName,
        hasActiveCycle: team.hasActiveCycle,
        cycleName: team.cycleName,
        completionRate: `${team.completionRate}%`,
        blockedIssuesCount: team.blockedIssuesCount,
        blockedAlert:
          team.blockedIssuesCount > 0 &&
          team.blockedIssuesCount === team.totalIssues,
        currentVelocity: team.currentVelocity,
        velocityTrendLabel:
          VELOCITY_TREND_LABELS[team.velocityTrend] ?? team.velocityTrend,
        reportLink: team.hasActiveCycle
          ? `/cycle-report?teamId=${team.teamId}`
          : null,
        noActiveCycleMessage: team.hasActiveCycle ? null : 'Aucun cycle actif',
      })),
      synchronization: {
        lastSyncDate:
          input.synchronizationStatus.lastSyncDate?.toISOString() ?? null,
        isLate: input.synchronizationStatus.isLate,
        lateWarning: input.synchronizationStatus.isLate
          ? 'Synchronisation en retard'
          : null,
        nextSync: input.synchronizationStatus.nextSync,
      },
    };
  }
}
