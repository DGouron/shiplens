import { LinearWorkspaceConnectionGateway } from '@modules/identity/entities/linear-workspace-connection/linear-workspace-connection.gateway.js';
import { TokenEncryptionGateway } from '@modules/identity/entities/linear-workspace-connection/token-encryption.gateway.js';
import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { LinearTeamGateway } from '../entities/team-selection/linear-team.gateway.js';
import {
  NoTeamSelectedError,
  WorkspaceNotConnectedError,
} from '../entities/team-selection/team-selection.errors.js';
import { TeamSelectionGateway } from '../entities/team-selection/team-selection.gateway.js';
import { TeamSelection } from '../entities/team-selection/team-selection.js';
import { type TeamSelectionProps } from '../entities/team-selection/team-selection.schema.js';

interface SaveTeamSelectionResult {
  estimatedIssueCount: number;
}

@Injectable()
export class SaveTeamSelectionUsecase
  implements Usecase<TeamSelectionProps, SaveTeamSelectionResult>
{
  constructor(
    private readonly connectionGateway: LinearWorkspaceConnectionGateway,
    private readonly tokenEncryptionGateway: TokenEncryptionGateway,
    private readonly teamSelectionGateway: TeamSelectionGateway,
    private readonly linearTeamGateway: LinearTeamGateway,
  ) {}

  async execute(params: TeamSelectionProps): Promise<SaveTeamSelectionResult> {
    if (params.selectedTeams.length === 0) {
      throw new NoTeamSelectedError();
    }

    const connection = await this.connectionGateway.get();
    if (!connection) {
      throw new WorkspaceNotConnectedError();
    }

    const selection = TeamSelection.create(params);
    await this.teamSelectionGateway.save(selection);

    const accessToken = await this.tokenEncryptionGateway.decrypt(
      connection.encryptedAccessToken,
    );

    const teamIds = params.selectedTeams.map((team) => team.teamId);
    const projectIds = params.selectedProjects.map(
      (project) => project.projectId,
    );

    const estimatedIssueCount =
      await this.linearTeamGateway.getIssueCountEstimate(
        accessToken,
        teamIds,
        projectIds,
      );

    return { estimatedIssueCount };
  }
}
