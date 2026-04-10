import { type Locale } from './workspace-language.schema.js';

export abstract class WorkspaceSettingsGateway {
  abstract getLanguage(): Promise<Locale>;
  abstract setLanguage(locale: Locale): Promise<void>;
}
