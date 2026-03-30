import { describe, it, expect, beforeEach } from 'vitest';
import { SyncReferenceDataController } from '@modules/synchronization/interface-adapters/controllers/sync-reference-data.controller.js';
import { SyncReferenceDataUsecase } from '@modules/synchronization/usecases/sync-reference-data.usecase.js';
import { StubLinearWorkspaceConnectionGateway } from '@modules/identity/testing/good-path/stub.linear-workspace-connection.gateway.js';
import { StubTokenEncryptionGateway } from '@modules/identity/testing/good-path/stub.token-encryption.gateway.js';
import { StubTeamSelectionGateway } from '@modules/synchronization/testing/good-path/stub.team-selection.gateway.js';
import { StubLinearReferenceDataGateway } from '@modules/synchronization/testing/good-path/stub.linear-reference-data.gateway.js';
import { StubReferenceDataGateway } from '@modules/synchronization/testing/good-path/stub.reference-data.gateway.js';
import { LinearWorkspaceConnectionBuilder } from '../../../../builders/linear-workspace-connection.builder.js';
import { TeamSelectionBuilder } from '../../../../builders/team-selection.builder.js';

describe('SyncReferenceDataController', () => {
  let controller: SyncReferenceDataController;

  beforeEach(() => {
    const connectionGateway = new StubLinearWorkspaceConnectionGateway();
    const tokenEncryptionGateway = new StubTokenEncryptionGateway();
    const teamSelectionGateway = new StubTeamSelectionGateway();
    const linearReferenceDataGateway = new StubLinearReferenceDataGateway();
    const referenceDataGateway = new StubReferenceDataGateway();

    connectionGateway.connection =
      new LinearWorkspaceConnectionBuilder().build();
    teamSelectionGateway.selection = new TeamSelectionBuilder()
      .withSelectedTeams([{ teamId: 'team-1', teamName: 'Engineering' }])
      .withSelectedProjects([])
      .build();

    const usecase = new SyncReferenceDataUsecase(
      connectionGateway,
      tokenEncryptionGateway,
      teamSelectionGateway,
      linearReferenceDataGateway,
      referenceDataGateway,
    );

    controller = new SyncReferenceDataController(usecase);
  });

  it('returns synced team count', async () => {
    const result = await controller.syncReferenceData();

    expect(result).toEqual({ syncedTeamCount: 1 });
  });
});
