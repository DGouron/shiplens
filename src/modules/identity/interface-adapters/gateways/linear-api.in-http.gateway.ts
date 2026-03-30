import { Injectable } from '@nestjs/common';
import { GatewayError } from '@shared/foundation/gateway-error.js';
import {
  LinearApiGateway,
  type ExchangeCodeResult,
  type RefreshTokenResult,
  type WorkspaceInfo,
} from '../../entities/linear-workspace-connection/linear-api.gateway.js';

interface LinearTokenResponse {
  access_token: string;
  refresh_token: string;
  scope?: string;
}

@Injectable()
export class LinearApiInHttpGateway extends LinearApiGateway {
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(clientId: string, clientSecret: string) {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<ExchangeCodeResult> {
    const response = await this.postForm<LinearTokenResponse>('https://api.linear.app/oauth/token', {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      scopes: typeof response.scope === 'string' ? response.scope.split(',') : [],
    };
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResult> {
    const response = await this.postForm<LinearTokenResponse>('https://api.linear.app/oauth/token', {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
    };
  }

  async revokeToken(accessToken: string): Promise<void> {
    const response = await fetch('https://api.linear.app/oauth/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token: accessToken }),
    });

    if (!response.ok) {
      throw new GatewayError('Échec de la révocation du token Linear', {
        status: response.status,
      });
    }
  }

  async getWorkspaceInfo(accessToken: string): Promise<WorkspaceInfo> {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessToken,
      },
      body: JSON.stringify({
        query: '{ organization { id name } }',
      }),
    });

    if (!response.ok) {
      throw new GatewayError('Échec de la récupération des informations workspace', {
        status: response.status,
      });
    }

    const body = await response.json() as { data: { organization: { id: string; name: string } } };
    return {
      id: body.data.organization.id,
      name: body.data.organization.name,
    };
  }

  private async postForm<T>(url: string, params: Record<string, string>): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
    });

    if (!response.ok) {
      throw new GatewayError('Échec de la requête Linear API', {
        status: response.status,
      });
    }

    return response.json() as Promise<T>;
  }
}
