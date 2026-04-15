import { type TeamDashboardResponse } from '@/modules/analytics/entities/workspace-dashboard/workspace-dashboard.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

export class TeamDashboardResponseBuilder extends EntityBuilder<
  TeamDashboardResponse,
  TeamDashboardResponse
> {
  constructor() {
    super({
      teamId: 'team-1',
      teamName: 'Team One',
      hasActiveCycle: true,
      cycleName: 'Cycle 12',
      completionRate: '75%',
      blockedIssuesCount: 0,
      blockedAlert: false,
      currentVelocity: 12,
      velocityTrendLabel: 'En hausse',
      reportLink: '/cycle-report?teamId=team-1',
      noActiveCycleMessage: null,
    });
  }

  withTeamId(teamId: string): this {
    this.props.teamId = teamId;
    return this;
  }

  withTeamName(teamName: string): this {
    this.props.teamName = teamName;
    return this;
  }

  withCompletionRate(completionRate: string): this {
    this.props.completionRate = completionRate;
    return this;
  }

  withBlockedIssuesCount(blockedIssuesCount: number): this {
    this.props.blockedIssuesCount = blockedIssuesCount;
    return this;
  }

  withBlockedAlert(blockedAlert: boolean): this {
    this.props.blockedAlert = blockedAlert;
    return this;
  }

  withoutActiveCycle(): this {
    this.props.hasActiveCycle = false;
    this.props.cycleName = null;
    this.props.reportLink = null;
    this.props.noActiveCycleMessage = 'Aucun cycle actif';
    return this;
  }

  build(): TeamDashboardResponse {
    return { ...this.props };
  }
}
