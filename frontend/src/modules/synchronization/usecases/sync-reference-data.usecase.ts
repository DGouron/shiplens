import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type SyncGateway } from '../entities/sync/sync.gateway.ts';

export class SyncReferenceDataUsecase implements Usecase<void, void> {
  constructor(private readonly gateway: SyncGateway) {}

  async execute(): Promise<void> {
    await this.gateway.syncReferenceData();
  }
}
