import { LinearWorkspaceConnection } from '@modules/identity/entities/linear-workspace-connection/linear-workspace-connection.js';
import { describe, expect, it } from 'vitest';

describe('LinearWorkspaceConnection', () => {
  const validProps = {
    id: 'connection-1',
    workspaceId: 'workspace-123',
    workspaceName: 'My Workspace',
    encryptedAccessToken: 'encrypted-access',
    encryptedRefreshToken: 'encrypted-refresh',
    grantedScopes: ['read', 'write', 'issues:create'],
    status: 'connected' as const,
    connectedAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  it('creates a connection with valid props', () => {
    const connection = LinearWorkspaceConnection.create(validProps);

    expect(connection.id).toBe('connection-1');
    expect(connection.workspaceId).toBe('workspace-123');
    expect(connection.workspaceName).toBe('My Workspace');
    expect(connection.encryptedAccessToken).toBe('encrypted-access');
    expect(connection.encryptedRefreshToken).toBe('encrypted-refresh');
    expect(connection.grantedScopes).toEqual([
      'read',
      'write',
      'issues:create',
    ]);
    expect(connection.status).toBe('connected');
    expect(connection.connectedAt).toEqual(new Date('2026-01-01'));
  });

  it('rejects creation with empty workspace name', () => {
    expect(() =>
      LinearWorkspaceConnection.create({ ...validProps, workspaceName: '' }),
    ).toThrow();
  });

  it('rejects creation with empty scopes', () => {
    expect(() =>
      LinearWorkspaceConnection.create({ ...validProps, grantedScopes: [] }),
    ).toThrow();
  });

  it('rejects creation with invalid status', () => {
    expect(() =>
      LinearWorkspaceConnection.create({
        ...validProps,
        status: 'invalid' as 'connected',
      }),
    ).toThrow();
  });
});
