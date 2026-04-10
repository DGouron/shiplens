import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type SyncResult } from '../../usecases/sync-packmind-rules.usecase.js';

export interface SyncPackmindRulesViewModel {
  createdRulesCount: number;
  updatedRulesCount: number;
  checklistItemsCount: number;
  fromCache: boolean;
  warning?: string;
}

@Injectable()
export class SyncPackmindRulesPresenter
  implements Presenter<SyncResult, SyncPackmindRulesViewModel>
{
  present(input: SyncResult): SyncPackmindRulesViewModel {
    return {
      createdRulesCount: input.createdRulesCount,
      updatedRulesCount: input.updatedRulesCount,
      checklistItemsCount: input.checklistItemsCount,
      fromCache: input.fromCache,
      warning: input.warning,
    };
  }
}
