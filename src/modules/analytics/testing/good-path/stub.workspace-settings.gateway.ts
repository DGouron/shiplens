import { type Locale } from '../../entities/workspace-settings/workspace-language.schema.js';
import { WorkspaceSettingsGateway } from '../../entities/workspace-settings/workspace-settings.gateway.js';

export class StubWorkspaceSettingsGateway extends WorkspaceSettingsGateway {
  storedLanguage: Locale = 'en';

  async getLanguage(): Promise<Locale> {
    return this.storedLanguage;
  }

  async setLanguage(locale: Locale): Promise<void> {
    this.storedLanguage = locale;
  }
}
