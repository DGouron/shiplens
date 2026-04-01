import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { SlackReportDataGateway, type SlackReportSummary } from '../../entities/slack-notification-config/slack-report-data.gateway.js';

@Injectable()
export class SlackReportDataInPrismaGateway extends SlackReportDataGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findLatestByCycleAndTeam(
    cycleId: string,
    teamId: string,
  ): Promise<SlackReportSummary | null> {
    const record = await this.prisma.sprintReport.findFirst({
      where: { cycleId, teamId },
      orderBy: { generatedAt: 'desc' },
    });

    if (!record) {
      return null;
    }

    return {
      reportId: record.id,
      cycleName: record.cycleName,
      teamId: record.teamId,
      executiveSummary: record.executiveSummary,
      highlights: record.highlights,
      risks: record.risks,
      generatedAt: record.generatedAt,
    };
  }
}
