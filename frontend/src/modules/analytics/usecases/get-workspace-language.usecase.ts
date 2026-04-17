import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type WorkspaceLanguageGateway } from '../entities/workspace-language/workspace-language.gateway.ts';
import { type WorkspaceLanguageResponse } from '../entities/workspace-language/workspace-language.response.ts';

export class GetWorkspaceLanguageUsecase
  implements Usecase<void, WorkspaceLanguageResponse>
{
  constructor(private readonly gateway: WorkspaceLanguageGateway) {}

  async execute(): Promise<WorkspaceLanguageResponse> {
    return this.gateway.getLanguage();
  }
}
