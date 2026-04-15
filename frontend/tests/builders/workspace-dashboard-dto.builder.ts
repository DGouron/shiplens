import {
  type SynchronizationDto,
  type TeamDashboardDto,
  type WorkspaceDashboardDataDto,
} from '@/modules/analytics/entities/workspace-dashboard/workspace-dashboard.dto.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';
import { SynchronizationDtoBuilder } from './synchronization-dto.builder.ts';
import { TeamDashboardDtoBuilder } from './team-dashboard-dto.builder.ts';

export class WorkspaceDashboardDtoBuilder extends EntityBuilder<
  WorkspaceDashboardDataDto,
  WorkspaceDashboardDataDto
> {
  constructor() {
    super({
      teams: [new TeamDashboardDtoBuilder().build()],
      synchronization: new SynchronizationDtoBuilder().build(),
    });
  }

  withTeams(teams: TeamDashboardDto[]): this {
    this.props.teams = teams;
    return this;
  }

  withSynchronization(synchronization: SynchronizationDto): this {
    this.props.synchronization = synchronization;
    return this;
  }

  build(): WorkspaceDashboardDataDto {
    return {
      teams: [...this.props.teams],
      synchronization: { ...this.props.synchronization },
    };
  }
}
