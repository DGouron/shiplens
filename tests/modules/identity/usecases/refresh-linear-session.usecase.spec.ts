import { describe, it, expect, beforeEach } from 'vitest';
import { RefreshLinearSessionUsecase } from '@modules/identity/usecases/refresh-linear-session.usecase.js';
import { StubLinearWorkspaceConnectionGateway } from '@modules/identity/testing/good-path/stub.linear-workspace-connection.gateway.js';
import { StubLinearApiGateway } from '@modules/identity/testing/good-path/stub.linear-api.gateway.js';
import { StubTokenEncryptionGateway } from '@modules/identity/testing/good-path/stub.token-encryption.gateway.js';
import { FailingLinearApiGateway } from '@modules/identity/testing/bad-path/failing.linear-api.gateway.js';
import { LinearWorkspaceConnectionBuilder } from '../../../builders/linear-workspace-connection.builder.js';

describe('RefreshLinearSessionUsecase', () => {
  let connectionGateway: StubLinearWorkspaceConnectionGateway;
  let linearApiGateway: StubLinearApiGateway;
  let tokenEncryptionGateway: StubTokenEncryptionGateway;
  let usecase: RefreshLinearSessionUsecase;

  beforeEach(() => {
    connectionGateway = new StubLinearWorkspaceConnectionGateway();
    linearApiGateway = new StubLinearApiGateway();
    tokenEncryptionGateway = new StubTokenEncryptionGateway();
    usecase = new RefreshLinearSessionUsecase(
      connectionGateway,
      linearApiGateway,
      tokenEncryptionGateway,
    );
  });

  it('refreshes tokens and updates the connection', async () => {
    connectionGateway.connection = new LinearWorkspaceConnectionBuilder().build();

    await usecase.execute();

    const updated = await connectionGateway.get();
    expect(updated).not.toBeNull();
    expect(updated?.status).toBe('connected');
    expect(updated?.encryptedAccessToken).toBe('encrypted:refreshed-access-token');
    expect(updated?.encryptedRefreshToken).toBe('encrypted:refreshed-refresh-token');
  });

  it('throws when no connection exists', async () => {
    await expect(usecase.execute()).rejects.toThrow(
      'Aucun workspace Linear n\'est connecté.',
    );
  });

  it('throws session expired error when refresh fails', async () => {
    connectionGateway.connection = new LinearWorkspaceConnectionBuilder().build();
    const failingApi = new FailingLinearApiGateway();
    const failingUsecase = new RefreshLinearSessionUsecase(
      connectionGateway,
      failingApi,
      tokenEncryptionGateway,
    );

    await expect(failingUsecase.execute()).rejects.toThrow(
      'Votre session Linear a expiré. Veuillez vous reconnecter.',
    );
  });
});
