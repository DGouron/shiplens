import { GatewayError } from '@shared/foundation/gateway-error.js';
import { type Locale } from '../../entities/workspace-settings/workspace-language.schema.js';
import { WorkspaceSettingsGateway } from '../../entities/workspace-settings/workspace-settings.gateway.js';

export class FailingWorkspaceSettingsGateway extends WorkspaceSettingsGateway {
  async getLanguage(): Promise<Locale> {
    throw new GatewayError('Gateway error: unable to read workspace language');
  }

  async setLanguage(): Promise<void> {
    throw new GatewayError('Gateway error: unable to save workspace language');
  }
}
