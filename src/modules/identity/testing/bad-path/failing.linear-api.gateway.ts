import {
  LinearApiGateway,
  type ExchangeCodeResult,
  type RefreshTokenResult,
  type WorkspaceInfo,
} from '../../entities/linear-workspace-connection/linear-api.gateway.js';
import { GatewayError } from '@shared/foundation/gateway-error.js';

export class FailingLinearApiGateway extends LinearApiGateway {
  async exchangeCode(_code: string, _redirectUri: string): Promise<ExchangeCodeResult> {
    throw new GatewayError('Linear API request failed');
  }

  async refreshToken(_refreshToken: string): Promise<RefreshTokenResult> {
    throw new GatewayError('Linear API request failed');
  }

  async revokeToken(_accessToken: string): Promise<void> {
    throw new GatewayError('Linear API request failed');
  }

  async getWorkspaceInfo(_accessToken: string): Promise<WorkspaceInfo> {
    throw new GatewayError('Linear API request failed');
  }
}
