import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type WorkspaceLanguageGateway } from '../entities/workspace-language/workspace-language.gateway.ts';

interface SetWorkspaceLanguageParams {
  language: string;
}

export class SetWorkspaceLanguageUsecase
  implements Usecase<SetWorkspaceLanguageParams, void>
{
  constructor(private readonly gateway: WorkspaceLanguageGateway) {}

  async execute(params: SetWorkspaceLanguageParams): Promise<void> {
    await this.gateway.setLanguage(params.language);
  }
}
