import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertBlockedIssuesOnSlackUsecase } from '../../usecases/alert-blocked-issues-on-slack.usecase.js';

@Injectable()
export class BlockedIssueAlertScheduler {
  private readonly logger = new Logger(BlockedIssueAlertScheduler.name);

  constructor(
    private readonly alertBlockedIssues: AlertBlockedIssuesOnSlackUsecase,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleAlerts(): Promise<void> {
    try {
      await this.alertBlockedIssues.execute();
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(`Blocked issue alert skipped: ${error.message}`);
      }
    }
  }
}
