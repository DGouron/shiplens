import { Controller, Post } from '@nestjs/common';
import { SyncReferenceDataUsecase } from '../../usecases/sync-reference-data.usecase.js';

interface SyncReferenceDataResponse {
  syncedTeamCount: number;
}

@Controller('sync')
export class SyncReferenceDataController {
  constructor(
    private readonly syncReferenceDataUsecase: SyncReferenceDataUsecase,
  ) {}

  @Post('reference-data')
  async syncReferenceData(): Promise<SyncReferenceDataResponse> {
    return this.syncReferenceDataUsecase.execute();
  }
}
