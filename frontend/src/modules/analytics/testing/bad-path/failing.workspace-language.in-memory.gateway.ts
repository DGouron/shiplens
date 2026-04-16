import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { WorkspaceLanguageGateway } from '../../entities/workspace-language/workspace-language.gateway.ts';

export class FailingWorkspaceLanguageGateway extends WorkspaceLanguageGateway {
  async getLanguage(): Promise<never> {
    throw new GatewayError('Failed to fetch workspace language');
  }

  async setLanguage(): Promise<never> {
    throw new GatewayError('Failed to set workspace language');
  }
}
