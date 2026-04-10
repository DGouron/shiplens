import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { SyncProgressGateway } from '../entities/sync-progress/sync-progress.gateway.js';

interface GetSyncProgressParams {
  teamId: string;
}

interface SyncProgressResult {
  teamId: string;
  progressPercentage: number;
  status: string;
}

@Injectable()
export class GetSyncProgressUsecase
  implements Usecase<GetSyncProgressParams, SyncProgressResult>
{
  constructor(private readonly syncProgressGateway: SyncProgressGateway) {}

  async execute(params: GetSyncProgressParams): Promise<SyncProgressResult> {
    const progress = await this.syncProgressGateway.getByTeamId(params.teamId);

    if (!progress) {
      return {
        teamId: params.teamId,
        progressPercentage: 0,
        status: 'not_started',
      };
    }

    return {
      teamId: progress.teamId,
      progressPercentage: progress.progressPercentage,
      status: progress.status,
    };
  }
}
