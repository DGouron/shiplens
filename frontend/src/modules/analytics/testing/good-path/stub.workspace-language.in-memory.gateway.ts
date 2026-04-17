import { WorkspaceLanguageGateway } from '../../entities/workspace-language/workspace-language.gateway.ts';
import { type WorkspaceLanguageResponse } from '../../entities/workspace-language/workspace-language.response.ts';

export class StubWorkspaceLanguageGateway extends WorkspaceLanguageGateway {
  storedLanguage = 'en';

  async getLanguage(): Promise<WorkspaceLanguageResponse> {
    return { language: this.storedLanguage };
  }

  async setLanguage(language: string): Promise<void> {
    this.storedLanguage = language;
  }
}
