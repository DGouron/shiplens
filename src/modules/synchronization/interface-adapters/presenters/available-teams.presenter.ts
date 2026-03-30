import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type LinearTeam } from '../../entities/team-selection/linear-team.gateway.js';

export interface AvailableTeamDto {
  teamId: string;
  teamName: string;
  projects: Array<{
    projectId: string;
    projectName: string;
  }>;
}

@Injectable()
export class AvailableTeamsPresenter
  implements Presenter<LinearTeam[], AvailableTeamDto[]>
{
  present(teams: LinearTeam[]): AvailableTeamDto[] {
    return teams.map((team) => ({
      teamId: team.teamId,
      teamName: team.teamName,
      projects: team.projects.map((project) => ({
        projectId: project.projectId,
        projectName: project.projectName,
      })),
    }));
  }
}
