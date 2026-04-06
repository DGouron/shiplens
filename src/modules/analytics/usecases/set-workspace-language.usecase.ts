import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { workspaceLanguageSchema } from '../entities/workspace-settings/workspace-language.schema.js';
import { UnsupportedLocaleError } from '../entities/workspace-settings/workspace-settings.errors.js';
import { WorkspaceSettingsGateway } from '../entities/workspace-settings/workspace-settings.gateway.js';

interface SetWorkspaceLanguageParams {
  language: string;
}

@Injectable()
export class SetWorkspaceLanguageUsecase
  implements Usecase<SetWorkspaceLanguageParams, void>
{
  constructor(
    private readonly workspaceSettingsGateway: WorkspaceSettingsGateway,
  ) {}

  async execute(params: SetWorkspaceLanguageParams): Promise<void> {
    const result = workspaceLanguageSchema.safeParse(params.language);
    if (!result.success) {
      throw new UnsupportedLocaleError(params.language);
    }
    await this.workspaceSettingsGateway.setLanguage(result.data);
  }
}
