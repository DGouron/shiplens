export interface ExchangeCodeResult {
  accessToken: string;
  refreshToken: string;
  scopes: string[];
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

export interface WorkspaceInfo {
  id: string;
  name: string;
}

export abstract class LinearApiGateway {
  abstract exchangeCode(
    code: string,
    redirectUri: string,
  ): Promise<ExchangeCodeResult>;
  abstract refreshToken(refreshToken: string): Promise<RefreshTokenResult>;
  abstract revokeToken(accessToken: string): Promise<void>;
  abstract getWorkspaceInfo(accessToken: string): Promise<WorkspaceInfo>;
}
