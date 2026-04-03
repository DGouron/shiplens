import { LinearWorkspaceConnectionGateway } from '@modules/identity/entities/linear-workspace-connection/linear-workspace-connection.gateway.js';
import { TokenEncryptionGateway } from '@modules/identity/entities/linear-workspace-connection/token-encryption.gateway.js';
import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { LinearReferenceDataGateway } from '../entities/reference-data/linear-reference-data.gateway.js';
import { NoTeamSelectedForSyncError } from '../entities/reference-data/reference-data.errors.js';
import { ReferenceDataGateway } from '../entities/reference-data/reference-data.gateway.js';
import { WorkspaceNotConnectedError } from '../entities/team-selection/team-selection.errors.js';
import { TeamSelectionGateway } from '../entities/team-selection/team-selection.gateway.js';

interface SyncReferenceDataResult {
  syncedTeamCount: number;
}

@Injectable()
export class SyncReferenceDataUsecase
  implements Usecase<void, SyncReferenceDataResult>
{
  constructor(
    private readonly connectionGateway: LinearWorkspaceConnectionGateway,
    private readonly tokenEncryptionGateway: TokenEncryptionGateway,
    private readonly teamSelectionGateway: TeamSelectionGateway,
    private readonly linearReferenceDataGateway: LinearReferenceDataGateway,
    private readonly referenceDataGateway: ReferenceDataGateway,
  ) {}

  async execute(): Promise<SyncReferenceDataResult> {
    const connection = await this.connectionGateway.get();
    if (!connection) {
      throw new WorkspaceNotConnectedError();
    }

    const selection = await this.teamSelectionGateway.get();
    if (!selection) {
      throw new NoTeamSelectedForSyncError();
    }

    const accessToken = await this.tokenEncryptionGateway.decrypt(
      connection.encryptedAccessToken,
    );

    const selectedTeams = selection.selectedTeams;

    for (const team of selectedTeams) {
      const referenceData =
        await this.linearReferenceDataGateway.getTeamReferenceData(
          accessToken,
          team.teamId,
        );
      await this.referenceDataGateway.upsertForTeam(team.teamId, referenceData);
    }

    return { syncedTeamCount: selectedTeams.length };
  }
}
