import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import {
  type SynchronizationDto,
  type TeamDashboardDto,
  type WorkspaceDashboardDataDto,
} from '../../entities/workspace-dashboard/workspace-dashboard.dto.ts';
import {
  type DashboardTranslations,
  type Locale,
} from './dashboard.translations.ts';
import {
  type DashboardViewModel,
  type HealthTier,
  type SyncStatusViewModel,
  type TeamCardViewModel,
} from './dashboard.view-model.schema.ts';

export class DashboardPresenter
  implements Presenter<WorkspaceDashboardDataDto, DashboardViewModel>
{
  constructor(
    private readonly locale: Locale,
    private readonly translations: DashboardTranslations,
  ) {}

  present(input: WorkspaceDashboardDataDto): DashboardViewModel {
    return {
      teams: input.teams.map((team) => this.presentTeam(team)),
      synchronization: this.presentSynchronization(input.synchronization),
    };
  }

  private presentTeam(team: TeamDashboardDto): TeamCardViewModel {
    if (!team.hasActiveCycle) {
      return {
        kind: 'idle',
        teamId: team.teamId,
        teamName: team.teamName,
        noActiveCycleMessage:
          team.noActiveCycleMessage ?? this.translations.noActiveCycle,
      };
    }

    const completionPercentage = this.parseCompletionPercentage(
      team.completionRate,
    );
    const healthTier = this.computeHealthTier(
      completionPercentage,
      team.blockedAlert,
    );

    return {
      kind: 'active',
      teamId: team.teamId,
      teamName: team.teamName,
      cycleName: team.cycleName ?? '',
      completionPercentage,
      healthTier,
      ringStrokeColor: this.ringStrokeColorFor(healthTier),
      ringDashOffset: 100 - completionPercentage,
      velocityText: `${team.currentVelocity} pts (${team.velocityTrendLabel})`,
      blockedIssuesCount: team.blockedIssuesCount,
      blockedAlert: team.blockedAlert,
      reportLink: team.reportLink,
    };
  }

  private presentSynchronization(
    synchronization: SynchronizationDto,
  ): SyncStatusViewModel {
    const hasSyncHistory = synchronization.lastSyncDate !== null;
    const lastSyncLabel = hasSyncHistory
      ? `${this.translations.lastSync}${this.formatDate(synchronization.lastSyncDate)}`
      : this.translations.neverSynced;

    return {
      lastSyncLabel,
      isLate: synchronization.isLate,
      lateWarning: synchronization.isLate
        ? this.translations.lateWarning
        : null,
      hasSyncHistory,
    };
  }

  private parseCompletionPercentage(completionRate: string): number {
    const parsed = Number.parseInt(completionRate, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private computeHealthTier(
    completionPercentage: number,
    blockedAlert: boolean,
  ): HealthTier {
    if (blockedAlert) return 'danger';
    if (completionPercentage >= 60) return 'healthy';
    if (completionPercentage >= 30) return 'warning';
    return 'danger';
  }

  private ringStrokeColorFor(healthTier: HealthTier): string {
    if (healthTier === 'healthy') return 'var(--success)';
    if (healthTier === 'warning') return 'var(--warning)';
    return 'var(--danger)';
  }

  private formatDate(isoDate: string | null): string {
    if (isoDate === null) return '';
    return new Intl.DateTimeFormat(this.locale).format(new Date(isoDate));
  }
}
