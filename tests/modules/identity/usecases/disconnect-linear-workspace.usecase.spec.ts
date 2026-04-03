import { StubLinearApiGateway } from '@modules/identity/testing/good-path/stub.linear-api.gateway.js';
import { StubLinearWorkspaceConnectionGateway } from '@modules/identity/testing/good-path/stub.linear-workspace-connection.gateway.js';
import { StubTokenEncryptionGateway } from '@modules/identity/testing/good-path/stub.token-encryption.gateway.js';
import { DisconnectLinearWorkspaceUsecase } from '@modules/identity/usecases/disconnect-linear-workspace.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { LinearWorkspaceConnectionBuilder } from '../../../builders/linear-workspace-connection.builder.js';

describe('DisconnectLinearWorkspaceUsecase', () => {
  let connectionGateway: StubLinearWorkspaceConnectionGateway;
  let linearApiGateway: StubLinearApiGateway;
  let tokenEncryptionGateway: StubTokenEncryptionGateway;
  let usecase: DisconnectLinearWorkspaceUsecase;

  beforeEach(() => {
    connectionGateway = new StubLinearWorkspaceConnectionGateway();
    linearApiGateway = new StubLinearApiGateway();
    tokenEncryptionGateway = new StubTokenEncryptionGateway();
    usecase = new DisconnectLinearWorkspaceUsecase(
      connectionGateway,
      linearApiGateway,
      tokenEncryptionGateway,
    );
  });

  it('revokes token on Linear API and deletes local connection', async () => {
    const connection = new LinearWorkspaceConnectionBuilder()
      .withEncryptedAccessToken('encrypted:my-access-token')
      .build();
    connectionGateway.connection = connection;

    await usecase.execute();

    expect(await connectionGateway.get()).toBeNull();
    expect(linearApiGateway.revokedTokens).toContain('my-access-token');
  });

  it('throws when no connection exists', async () => {
    await expect(usecase.execute()).rejects.toThrow(
      "Aucun workspace Linear n'est connecté.",
    );
  });
});
