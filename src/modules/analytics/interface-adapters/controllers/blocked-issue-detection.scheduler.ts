import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DetectBlockedIssuesUsecase } from '../../usecases/detect-blocked-issues.usecase.js';

@Injectable()
export class BlockedIssueDetectionScheduler {
  private readonly logger = new Logger(BlockedIssueDetectionScheduler.name);

  constructor(
    private readonly detectBlockedIssues: DetectBlockedIssuesUsecase,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleDetection(): Promise<void> {
    try {
      await this.detectBlockedIssues.execute();
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(`Blocked issue detection skipped: ${error.message}`);
      }
    }
  }
}
