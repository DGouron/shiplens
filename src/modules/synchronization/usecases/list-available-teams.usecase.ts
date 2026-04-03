import { LinearWorkspaceConnectionGateway } from '@modules/identity/entities/linear-workspace-connection/linear-workspace-connection.gateway.js';
import { TokenEncryptionGateway } from '@modules/identity/entities/linear-workspace-connection/token-encryption.gateway.js';
import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import {
  type LinearTeam,
  LinearTeamGateway,
} from '../entities/team-selection/linear-team.gateway.js';
import {
  NoTeamsFoundError,
  WorkspaceNotConnectedError,
} from '../entities/team-selection/team-selection.errors.js';

@Injectable()
export class ListAvailableTeamsUsecase implements Usecase<void, LinearTeam[]> {
  constructor(
    private readonly connectionGateway: LinearWorkspaceConnectionGateway,
    private readonly tokenEncryptionGateway: TokenEncryptionGateway,
    private readonly linearTeamGateway: LinearTeamGateway,
  ) {}

  async execute(): Promise<LinearTeam[]> {
    const connection = await this.connectionGateway.get();
    if (!connection) {
      throw new WorkspaceNotConnectedError();
    }

    const accessToken = await this.tokenEncryptionGateway.decrypt(
      connection.encryptedAccessToken,
    );

    const teams = await this.linearTeamGateway.getTeams(accessToken);
    if (teams.length === 0) {
      throw new NoTeamsFoundError();
    }

    return teams;
  }
}
