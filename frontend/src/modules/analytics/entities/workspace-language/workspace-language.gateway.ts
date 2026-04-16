import { type WorkspaceLanguageResponse } from './workspace-language.response.ts';

export abstract class WorkspaceLanguageGateway {
  abstract getLanguage(): Promise<WorkspaceLanguageResponse>;
  abstract setLanguage(language: string): Promise<void>;
}
