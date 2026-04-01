import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { SlackAlertLogGateway } from '../../entities/team-alert-channel/slack-alert-log.gateway.js';

@Injectable()
export class SlackAlertLogInPrismaGateway extends SlackAlertLogGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async wasAlertSentToday(
    issueExternalId: string,
    today: string,
  ): Promise<boolean> {
    const count = await this.prisma.slackAlertLog.count({
      where: {
        issueExternalId,
        sentAt: { gte: `${today}T00:00:00`, lt: `${today}T23:59:60` },
      },
    });

    return count > 0;
  }

  async recordAlertSent(
    issueExternalId: string,
    sentAt: string,
  ): Promise<void> {
    await this.prisma.slackAlertLog.create({
      data: {
        issueExternalId,
        sentAt,
      },
    });
  }
}
