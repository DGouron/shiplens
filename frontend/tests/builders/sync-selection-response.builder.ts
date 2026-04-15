import {
  type SyncSelectedProjectResponse,
  type SyncSelectedTeamResponse,
  type SyncSelectionResponse,
} from '@/modules/synchronization/entities/sync/sync.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

interface SyncSelectionProps {
  selectedTeams: SyncSelectedTeamResponse[];
  selectedProjects: SyncSelectedProjectResponse[];
}

export class SyncSelectionResponseBuilder extends EntityBuilder<
  SyncSelectionProps,
  SyncSelectionResponse
> {
  constructor() {
    super({
      selectedTeams: [{ teamId: 'team-1', teamName: 'Team One' }],
      selectedProjects: [
        {
          projectId: 'project-1',
          projectName: 'Project One',
          teamId: 'team-1',
        },
      ],
    });
  }

  withSelectedTeams(selectedTeams: SyncSelectedTeamResponse[]): this {
    this.props.selectedTeams = selectedTeams;
    return this;
  }

  withSelectedProjects(selectedProjects: SyncSelectedProjectResponse[]): this {
    this.props.selectedProjects = selectedProjects;
    return this;
  }

  build(): SyncSelectionResponse {
    return {
      selectedTeams: this.props.selectedTeams.map((team) => ({ ...team })),
      selectedProjects: this.props.selectedProjects.map((project) => ({
        ...project,
      })),
    };
  }
}
