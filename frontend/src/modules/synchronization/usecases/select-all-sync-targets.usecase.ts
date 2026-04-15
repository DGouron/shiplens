import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type SyncGateway } from '../entities/sync/sync.gateway.ts';
import {
  type SyncAvailableTeamResponse,
  type SyncSelectedProjectResponse,
  type SyncSelectedTeamResponse,
} from '../entities/sync/sync.response.ts';

export interface SelectAllSyncTargetsInput {
  availableTeams: SyncAvailableTeamResponse[];
}

export class SelectAllSyncTargetsUsecase
  implements Usecase<SelectAllSyncTargetsInput, void>
{
  constructor(private readonly gateway: SyncGateway) {}

  async execute(input: SelectAllSyncTargetsInput): Promise<void> {
    const selectedTeams: SyncSelectedTeamResponse[] = input.availableTeams.map(
      (team) => ({ teamId: team.teamId, teamName: team.teamName }),
    );
    const selectedProjects = this.dedupProjectsByProjectId(
      input.availableTeams,
    );
    await this.gateway.saveSelection({ selectedTeams, selectedProjects });
  }

  private dedupProjectsByProjectId(
    availableTeams: SyncAvailableTeamResponse[],
  ): SyncSelectedProjectResponse[] {
    const seenProjectIds = new Set<string>();
    const selectedProjects: SyncSelectedProjectResponse[] = [];
    for (const team of availableTeams) {
      for (const project of team.projects) {
        if (seenProjectIds.has(project.projectId)) continue;
        seenProjectIds.add(project.projectId);
        selectedProjects.push({
          projectId: project.projectId,
          projectName: project.projectName,
          teamId: team.teamId,
        });
      }
    }
    return selectedProjects;
  }
}
