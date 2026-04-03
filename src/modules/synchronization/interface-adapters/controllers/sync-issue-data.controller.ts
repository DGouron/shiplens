import { Body, Controller, Get, Post } from '@nestjs/common';
import { GetSyncProgressUsecase } from '../../usecases/get-sync-progress.usecase.js';
import { SyncIssueDataUsecase } from '../../usecases/sync-issue-data.usecase.js';
import {
  type SyncProgressDto,
  SyncProgressPresenter,
} from '../presenters/sync-progress.presenter.js';

interface SyncIssueDataBody {
  teamId: string;
}

@Controller('sync')
export class SyncIssueDataController {
  constructor(
    private readonly syncIssueDataUsecase: SyncIssueDataUsecase,
    private readonly getSyncProgressUsecase: GetSyncProgressUsecase,
    private readonly syncProgressPresenter: SyncProgressPresenter,
  ) {}

  @Post('issue-data')
  async syncIssueData(@Body() body: SyncIssueDataBody): Promise<void> {
    await this.syncIssueDataUsecase.execute({ teamId: body.teamId });
  }

  @Get('issue-data/progress')
  async getSyncProgress(
    @Body() body: { teamId: string },
  ): Promise<SyncProgressDto> {
    const result = await this.getSyncProgressUsecase.execute({
      teamId: body.teamId,
    });
    return this.syncProgressPresenter.present(result);
  }
}
