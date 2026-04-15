import {
  type SynchronizationResponse,
  type TeamDashboardResponse,
  type WorkspaceDashboardDataResponse,
} from '@/modules/analytics/entities/workspace-dashboard/workspace-dashboard.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';
import { SynchronizationResponseBuilder } from './synchronization-response.builder.ts';
import { TeamDashboardResponseBuilder } from './team-dashboard-response.builder.ts';

export class WorkspaceDashboardResponseBuilder extends EntityBuilder<
  WorkspaceDashboardDataResponse,
  WorkspaceDashboardDataResponse
> {
  constructor() {
    super({
      teams: [new TeamDashboardResponseBuilder().build()],
      synchronization: new SynchronizationResponseBuilder().build(),
    });
  }

  withTeams(teams: TeamDashboardResponse[]): this {
    this.props.teams = teams;
    return this;
  }

  withSynchronization(synchronization: SynchronizationResponse): this {
    this.props.synchronization = synchronization;
    return this;
  }

  build(): WorkspaceDashboardDataResponse {
    return {
      teams: [...this.props.teams],
      synchronization: { ...this.props.synchronization },
    };
  }
}
