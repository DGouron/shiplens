import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { WorkspaceLanguageGateway } from '../../entities/workspace-language/workspace-language.gateway.ts';
import { type WorkspaceLanguageResponse } from '../../entities/workspace-language/workspace-language.response.ts';
import { workspaceLanguageResponseGuard } from './workspace-language.response.guard.ts';

export class WorkspaceLanguageInHttpGateway extends WorkspaceLanguageGateway {
  async getLanguage(): Promise<WorkspaceLanguageResponse> {
    const response = await fetch('/settings/language');

    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch workspace language: HTTP ${response.status}`,
      );
    }

    const payload: unknown = await response.json();
    const parsed = workspaceLanguageResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid workspace language response: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }

  async setLanguage(language: string): Promise<void> {
    const response = await fetch('/settings/language', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language }),
    });

    if (!response.ok) {
      throw new GatewayError(
        `Failed to set workspace language: HTTP ${response.status}`,
      );
    }
  }
}
