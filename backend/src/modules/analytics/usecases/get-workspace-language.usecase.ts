import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { type Locale } from '../entities/workspace-settings/workspace-language.schema.js';
import { WorkspaceSettingsGateway } from '../entities/workspace-settings/workspace-settings.gateway.js';

@Injectable()
export class GetWorkspaceLanguageUsecase implements Usecase<void, Locale> {
  constructor(
    private readonly workspaceSettingsGateway: WorkspaceSettingsGateway,
  ) {}

  async execute(): Promise<Locale> {
    return this.workspaceSettingsGateway.getLanguage();
  }
}
