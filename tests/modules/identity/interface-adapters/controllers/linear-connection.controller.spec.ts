import { describe, it, expect, beforeEach } from 'vitest';
import { LinearConnectionController } from '@modules/identity/interface-adapters/controllers/linear-connection.controller.js';
import { GetConnectionStatusUsecase } from '@modules/identity/usecases/get-connection-status.usecase.js';
import { ConnectLinearWorkspaceUsecase } from '@modules/identity/usecases/connect-linear-workspace.usecase.js';
import { DisconnectLinearWorkspaceUsecase } from '@modules/identity/usecases/disconnect-linear-workspace.usecase.js';
import { RefreshLinearSessionUsecase } from '@modules/identity/usecases/refresh-linear-session.usecase.js';
import { ConnectionStatusPresenter } from '@modules/identity/interface-adapters/presenters/connection-status.presenter.js';
import { StubLinearWorkspaceConnectionGateway } from '@modules/identity/testing/good-path/stub.linear-workspace-connection.gateway.js';
import { StubLinearApiGateway } from '@modules/identity/testing/good-path/stub.linear-api.gateway.js';
import { StubTokenEncryptionGateway } from '@modules/identity/testing/good-path/stub.token-encryption.gateway.js';
import { LinearWorkspaceConnectionBuilder } from '../../../../builders/linear-workspace-connection.builder.js';

describe('LinearConnectionController', () => {
  let controller: LinearConnectionController;
  let connectionGateway: StubLinearWorkspaceConnectionGateway;
  let linearApiGateway: StubLinearApiGateway;
  let tokenEncryptionGateway: StubTokenEncryptionGateway;

  beforeEach(() => {
    connectionGateway = new StubLinearWorkspaceConnectionGateway();
    linearApiGateway = new StubLinearApiGateway();
    tokenEncryptionGateway = new StubTokenEncryptionGateway();

    controller = new LinearConnectionController(
      new GetConnectionStatusUsecase(connectionGateway),
      new ConnectLinearWorkspaceUsecase(connectionGateway, linearApiGateway, tokenEncryptionGateway),
      new DisconnectLinearWorkspaceUsecase(connectionGateway, linearApiGateway, tokenEncryptionGateway),
      new RefreshLinearSessionUsecase(connectionGateway, linearApiGateway, tokenEncryptionGateway),
      new ConnectionStatusPresenter(),
    );
  });

  it('returns disconnected status when no connection exists', async () => {
    const result = await controller.getStatus();

    expect(result).toEqual({ connected: false, workspace: null });
  });

  it('returns connected status with workspace info', async () => {
    connectionGateway.connection = new LinearWorkspaceConnectionBuilder()
      .withWorkspaceName('Acme Corp')
      .withWorkspaceId('ws-42')
      .build();

    const result = await controller.getStatus();

    expect(result).toEqual({
      connected: true,
      workspace: { id: 'ws-42', name: 'Acme Corp' },
    });
  });

  it('connects a workspace and returns success', async () => {
    await controller.connect({ code: 'oauth-code', redirectUri: 'http://localhost/callback' });

    const status = await controller.getStatus();
    expect(status.connected).toBe(true);
  });

  it('disconnects the workspace', async () => {
    connectionGateway.connection = new LinearWorkspaceConnectionBuilder().build();

    await controller.disconnect();

    const status = await controller.getStatus();
    expect(status.connected).toBe(false);
  });

  it('refreshes the session', async () => {
    connectionGateway.connection = new LinearWorkspaceConnectionBuilder().build();

    await controller.refresh();

    const status = await controller.getStatus();
    expect(status.connected).toBe(true);
  });
});
