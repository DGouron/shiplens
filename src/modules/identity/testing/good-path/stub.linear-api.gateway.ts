import {
  LinearApiGateway,
  type ExchangeCodeResult,
  type RefreshTokenResult,
  type WorkspaceInfo,
} from '../../entities/linear-workspace-connection/linear-api.gateway.js';
import { REQUIRED_SCOPES } from '../../usecases/connect-linear-workspace.usecase.js';

export class StubLinearApiGateway extends LinearApiGateway {
  grantedScopes: string[] = [...REQUIRED_SCOPES];
  revokedTokens: string[] = [];

  async exchangeCode(_code: string, _redirectUri: string): Promise<ExchangeCodeResult> {
    return {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      scopes: this.grantedScopes,
    };
  }

  async refreshToken(_refreshToken: string): Promise<RefreshTokenResult> {
    return {
      accessToken: 'refreshed-access-token',
      refreshToken: 'refreshed-refresh-token',
    };
  }

  async revokeToken(accessToken: string): Promise<void> {
    this.revokedTokens.push(accessToken);
  }

  async getWorkspaceInfo(_accessToken: string): Promise<WorkspaceInfo> {
    return {
      id: 'workspace-123',
      name: 'My Workspace',
    };
  }
}
