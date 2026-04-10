import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type TeamSelection } from '../../entities/team-selection/team-selection.js';

export interface TeamSelectionDto {
  selectedTeams: Array<{
    teamId: string;
    teamName: string;
  }>;
  selectedProjects: Array<{
    projectId: string;
    projectName: string;
    teamId: string;
  }>;
}

@Injectable()
export class TeamSelectionPresenter
  implements Presenter<TeamSelection | null, TeamSelectionDto | null>
{
  present(selection: TeamSelection | null): TeamSelectionDto | null {
    if (!selection) {
      return null;
    }

    return {
      selectedTeams: selection.selectedTeams,
      selectedProjects: selection.selectedProjects,
    };
  }
}
