import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { SlackNotificationConfigGateway } from '../../entities/slack-notification-config/slack-notification-config.gateway.js';
import { SlackNotificationConfig } from '../../entities/slack-notification-config/slack-notification-config.js';

@Injectable()
export class SlackNotificationConfigInPrismaGateway extends SlackNotificationConfigGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByTeamId(teamId: string): Promise<SlackNotificationConfig | null> {
    const record = await this.prisma.slackNotificationConfig.findUnique({
      where: { teamId },
    });

    if (!record) {
      return null;
    }

    return SlackNotificationConfig.create({
      id: record.id,
      teamId: record.teamId,
      webhookUrl: record.webhookUrl,
      enabled: record.enabled,
    });
  }

  async save(config: SlackNotificationConfig): Promise<void> {
    await this.prisma.slackNotificationConfig.upsert({
      where: { teamId: config.teamId },
      update: {
        webhookUrl: config.webhookUrl,
        enabled: config.enabled,
      },
      create: {
        id: config.id,
        teamId: config.teamId,
        webhookUrl: config.webhookUrl,
        enabled: config.enabled,
      },
    });
  }
}
