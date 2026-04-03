import { Body, Controller, Get, Post } from '@nestjs/common';
import { DetectBlockedIssuesUsecase } from '../../usecases/detect-blocked-issues.usecase.js';
import { GetAlertHistoryUsecase } from '../../usecases/get-alert-history.usecase.js';
import { GetBlockedIssuesUsecase } from '../../usecases/get-blocked-issues.usecase.js';
import { SetStatusThresholdUsecase } from '../../usecases/set-status-threshold.usecase.js';
import {
  type AlertHistoryDto,
  AlertHistoryPresenter,
} from '../presenters/alert-history.presenter.js';
import {
  type BlockedIssueAlertDto,
  BlockedIssuesPresenter,
} from '../presenters/blocked-issues.presenter.js';

@Controller('analytics/blocked-issues')
export class BlockedIssuesController {
  constructor(
    private readonly getBlockedIssues: GetBlockedIssuesUsecase,
    private readonly getAlertHistory: GetAlertHistoryUsecase,
    private readonly setStatusThreshold: SetStatusThresholdUsecase,
    private readonly detectBlockedIssues: DetectBlockedIssuesUsecase,
    private readonly blockedIssuesPresenter: BlockedIssuesPresenter,
    private readonly alertHistoryPresenter: AlertHistoryPresenter,
  ) {}

  @Get()
  async listBlockedIssues(): Promise<BlockedIssueAlertDto[]> {
    const alerts = await this.getBlockedIssues.execute();
    return this.blockedIssuesPresenter.present(alerts);
  }

  @Get('history')
  async listAlertHistory(): Promise<AlertHistoryDto[]> {
    const alerts = await this.getAlertHistory.execute();
    return this.alertHistoryPresenter.present(alerts);
  }

  @Post('thresholds')
  async updateThreshold(
    @Body() body: { statusName: string; thresholdHours: number },
  ): Promise<void> {
    await this.setStatusThreshold.execute(body);
  }

  @Post('detect')
  async runDetection(): Promise<void> {
    await this.detectBlockedIssues.execute();
  }
}
