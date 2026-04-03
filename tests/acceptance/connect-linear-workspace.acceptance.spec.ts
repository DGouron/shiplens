import { FailingLinearApiGateway } from '@modules/identity/testing/bad-path/failing.linear-api.gateway.js';
import { StubLinearApiGateway } from '@modules/identity/testing/good-path/stub.linear-api.gateway.js';
import { StubLinearWorkspaceConnectionGateway } from '@modules/identity/testing/good-path/stub.linear-workspace-connection.gateway.js';
import { StubTokenEncryptionGateway } from '@modules/identity/testing/good-path/stub.token-encryption.gateway.js';
import { ConnectLinearWorkspaceUsecase } from '@modules/identity/usecases/connect-linear-workspace.usecase.js';
import { DisconnectLinearWorkspaceUsecase } from '@modules/identity/usecases/disconnect-linear-workspace.usecase.js';
import { GetConnectionStatusUsecase } from '@modules/identity/usecases/get-connection-status.usecase.js';
import { RefreshLinearSessionUsecase } from '@modules/identity/usecases/refresh-linear-session.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { LinearWorkspaceConnectionBuilder } from '../builders/linear-workspace-connection.builder.js';

describe('Connect Linear Workspace (acceptance)', () => {
  let connectionGateway: StubLinearWorkspaceConnectionGateway;
  let linearApiGateway: StubLinearApiGateway;
  let tokenEncryptionGateway: StubTokenEncryptionGateway;

  beforeEach(() => {
    connectionGateway = new StubLinearWorkspaceConnectionGateway();
    linearApiGateway = new StubLinearApiGateway();
    tokenEncryptionGateway = new StubTokenEncryptionGateway();
  });

  describe('a user can only have one Linear workspace connected at a time', () => {
    it('successful connection: returns connected status with workspace name', async () => {
      const connectUsecase = new ConnectLinearWorkspaceUsecase(
        connectionGateway,
        linearApiGateway,
        tokenEncryptionGateway,
      );
      const getStatusUsecase = new GetConnectionStatusUsecase(
        connectionGateway,
      );

      await connectUsecase.execute({
        code: 'valid-oauth-code',
        redirectUri: 'http://localhost:3000/callback',
      });

      const status = await getStatusUsecase.execute();

      expect(status).not.toBeNull();
      expect(status?.status).toBe('connected');
      expect(status?.workspaceName).toBe('My Workspace');
    });

    it('workspace already connected: replaces old workspace with new one', async () => {
      const existingConnection = new LinearWorkspaceConnectionBuilder().build();
      connectionGateway.connection = existingConnection;

      const connectUsecase = new ConnectLinearWorkspaceUsecase(
        connectionGateway,
        linearApiGateway,
        tokenEncryptionGateway,
      );
      const getStatusUsecase = new GetConnectionStatusUsecase(
        connectionGateway,
      );

      await connectUsecase.execute({
        code: 'new-oauth-code',
        redirectUri: 'http://localhost:3000/callback',
      });

      const status = await getStatusUsecase.execute();

      expect(status).not.toBeNull();
      expect(status?.status).toBe('connected');
      expect(status?.workspaceName).toBe('My Workspace');
    });
  });

  describe('credentials are never exposed in plain text', () => {
    it('tokens are encrypted before being persisted', async () => {
      const connectUsecase = new ConnectLinearWorkspaceUsecase(
        connectionGateway,
        linearApiGateway,
        tokenEncryptionGateway,
      );

      await connectUsecase.execute({
        code: 'valid-oauth-code',
        redirectUri: 'http://localhost:3000/callback',
      });

      const saved = await connectionGateway.get();
      expect(saved).not.toBeNull();
      expect(saved?.encryptedAccessToken).not.toBe('test-access-token');
      expect(saved?.encryptedRefreshToken).not.toBe('test-refresh-token');
    });
  });

  describe('authorization denied rejects with error', () => {
    it('authorization refused: rejects with french error message', async () => {
      const failingApi = new FailingLinearApiGateway();
      const connectUsecase = new ConnectLinearWorkspaceUsecase(
        connectionGateway,
        failingApi,
        tokenEncryptionGateway,
      );

      await expect(
        connectUsecase.execute({
          code: 'invalid-code',
          redirectUri: 'http://localhost:3000/callback',
        }),
      ).rejects.toThrow(
        'La connexion à Linear a été refusée. Veuillez réessayer.',
      );
    });
  });

  describe('insufficient permissions rejects with error', () => {
    it('partial permissions: rejects with french error message', async () => {
      const partialApi = new StubLinearApiGateway();
      partialApi.grantedScopes = ['read'];

      const connectUsecase = new ConnectLinearWorkspaceUsecase(
        connectionGateway,
        partialApi,
        tokenEncryptionGateway,
      );

      await expect(
        connectUsecase.execute({
          code: 'valid-oauth-code',
          redirectUri: 'http://localhost:3000/callback',
        }),
      ).rejects.toThrow(
        'Les permissions accordées sont insuffisantes. Veuillez autoriser tous les accès demandés.',
      );
    });
  });

  describe('Linear session stays active without manual intervention', () => {
    it('expired session: automatic renewal keeps connected status', async () => {
      const existingConnection = new LinearWorkspaceConnectionBuilder().build();
      connectionGateway.connection = existingConnection;

      const refreshUsecase = new RefreshLinearSessionUsecase(
        connectionGateway,
        linearApiGateway,
        tokenEncryptionGateway,
      );

      await refreshUsecase.execute();

      const getStatusUsecase = new GetConnectionStatusUsecase(
        connectionGateway,
      );
      const status = await getStatusUsecase.execute();

      expect(status?.status).toBe('connected');
    });

    it('renewal impossible: status becomes disconnected with error', async () => {
      const existingConnection = new LinearWorkspaceConnectionBuilder().build();
      connectionGateway.connection = existingConnection;

      const failingApi = new FailingLinearApiGateway();
      const refreshUsecase = new RefreshLinearSessionUsecase(
        connectionGateway,
        failingApi,
        tokenEncryptionGateway,
      );

      await expect(refreshUsecase.execute()).rejects.toThrow(
        'Votre session Linear a expiré. Veuillez vous reconnecter.',
      );
    });
  });

  describe('disconnection removes all access on both sides', () => {
    it('disconnects: revokes Linear access and deletes local data', async () => {
      const existingConnection = new LinearWorkspaceConnectionBuilder().build();
      connectionGateway.connection = existingConnection;

      const disconnectUsecase = new DisconnectLinearWorkspaceUsecase(
        connectionGateway,
        linearApiGateway,
        tokenEncryptionGateway,
      );

      await disconnectUsecase.execute();

      const getStatusUsecase = new GetConnectionStatusUsecase(
        connectionGateway,
      );
      const status = await getStatusUsecase.execute();

      expect(status).toBeNull();
      expect(linearApiGateway.revokedTokens).toContain('test-access-token');
    });
  });
});
