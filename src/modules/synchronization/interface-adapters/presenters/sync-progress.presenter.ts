import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';

interface SyncProgressInput {
  teamId: string;
  progressPercentage: number;
  status: string;
}

export interface SyncProgressDto {
  teamId: string;
  progressPercentage: number;
  status: string;
}

@Injectable()
export class SyncProgressPresenter
  implements Presenter<SyncProgressInput, SyncProgressDto>
{
  present(input: SyncProgressInput): SyncProgressDto {
    return {
      teamId: input.teamId,
      progressPercentage: input.progressPercentage,
      status: input.status,
    };
  }
}
