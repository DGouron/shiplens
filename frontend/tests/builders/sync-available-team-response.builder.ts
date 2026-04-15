import {
  type SyncAvailableTeamResponse,
  type SyncProjectResponse,
} from '@/modules/synchronization/entities/sync/sync.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

export class SyncAvailableTeamResponseBuilder extends EntityBuilder<
  SyncAvailableTeamResponse,
  SyncAvailableTeamResponse
> {
  constructor() {
    super({
      teamId: 'team-1',
      teamName: 'Team One',
      projects: [{ projectId: 'project-1', projectName: 'Project One' }],
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

  withProjects(projects: SyncProjectResponse[]): this {
    this.props.projects = projects;
    return this;
  }

  build(): SyncAvailableTeamResponse {
    return {
      teamId: this.props.teamId,
      teamName: this.props.teamName,
      projects: this.props.projects.map((project) => ({ ...project })),
    };
  }
}
