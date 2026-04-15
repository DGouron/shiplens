import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type SyncGateway } from '../entities/sync/sync.gateway.ts';
import { type SyncSelectionResponse } from '../entities/sync/sync.response.ts';

export class GetSyncSelectionUsecase
  implements Usecase<void, SyncSelectionResponse>
{
  constructor(private readonly gateway: SyncGateway) {}

  async execute(): Promise<SyncSelectionResponse> {
    return this.gateway.fetchSelection();
  }
}
