import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { TeamAlertChannelGateway } from '../../entities/team-alert-channel/team-alert-channel.gateway.js';
import { TeamAlertChannel } from '../../entities/team-alert-channel/team-alert-channel.js';

@Injectable()
export class TeamAlertChannelInPrismaGateway extends TeamAlertChannelGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByTeamId(teamId: string): Promise<TeamAlertChannel | null> {
    const record = await this.prisma.teamAlertChannel.findUnique({
      where: { teamId },
    });

    if (!record) {
      return null;
    }

    return TeamAlertChannel.create({
      id: record.id,
      teamId: record.teamId,
      webhookUrl: record.webhookUrl,
    });
  }

  async save(channel: TeamAlertChannel): Promise<void> {
    await this.prisma.teamAlertChannel.upsert({
      where: { teamId: channel.teamId },
      update: { webhookUrl: channel.webhookUrl },
      create: {
        id: channel.id,
        teamId: channel.teamId,
        webhookUrl: channel.webhookUrl,
      },
    });
  }
}
