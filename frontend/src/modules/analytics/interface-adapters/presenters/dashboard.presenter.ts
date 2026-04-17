import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import {
  type SynchronizationResponse,
  type TeamDashboardResponse,
  type WorkspaceDashboardDataResponse,
} from '../../entities/workspace-dashboard/workspace-dashboard.response.ts';
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

export interface DashboardPresenterContext {
  persistedTeamId: string | null;
}

export class DashboardPresenter
  implements Presenter<WorkspaceDashboardDataResponse, DashboardViewModel>
{
  constructor(
    private readonly locale: Locale,
    private readonly translations: DashboardTranslations,
  ) {}

  present(
    input: WorkspaceDashboardDataResponse,
    context: DashboardPresenterContext = { persistedTeamId: null },
  ): DashboardViewModel {
    const selectedTeamId = this.resolveSelectedTeamId(
      input.teams,
      context.persistedTeamId,
    );
    const showEmptyTeamsMessage = input.teams.length === 0;

    return {
      teams: input.teams.map((team) => this.presentTeam(team, selectedTeamId)),
      synchronization: this.presentSynchronization(input.synchronization),
      selectedTeamId,
      showEmptyTeamsMessage,
      emptyTeamsMessage: showEmptyTeamsMessage
        ? this.translations.emptyTeamsMessage
        : null,
    };
  }

  private resolveSelectedTeamId(
    teams: TeamDashboardResponse[],
    persistedTeamId: string | null,
  ): string | null {
    if (teams.length === 0) {
      return null;
    }
    if (
      persistedTeamId !== null &&
      teams.some((team) => team.teamId === persistedTeamId)
    ) {
      return persistedTeamId;
    }
    const alphabetical = [...teams].sort((leftTeam, rightTeam) =>
      leftTeam.teamName.localeCompare(rightTeam.teamName, this.locale),
    );
    return alphabetical[0].teamId;
  }

  private presentTeam(
    team: TeamDashboardResponse,
    selectedTeamId: string | null,
  ): TeamCardViewModel {
    const isSelected = team.teamId === selectedTeamId;

    if (!team.hasActiveCycle) {
      return {
        kind: 'idle',
        teamId: team.teamId,
        teamName: team.teamName,
        noActiveCycleMessage:
          team.noActiveCycleMessage ?? this.translations.noActiveCycle,
        isSelected,
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
      isSelected,
    };
  }

  private presentSynchronization(
    synchronization: SynchronizationResponse,
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
