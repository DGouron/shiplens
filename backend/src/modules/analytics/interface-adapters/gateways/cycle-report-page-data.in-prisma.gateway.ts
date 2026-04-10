import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import {
  type CycleIssueDetail,
  type CycleSummary,
} from '../../entities/cycle-report-page/cycle-report-page.schema.js';
import { CycleReportPageDataGateway } from '../../entities/cycle-report-page/cycle-report-page-data.gateway.js';

@Injectable()
export class CycleReportPageDataInPrismaGateway extends CycleReportPageDataGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async listCycles(teamId: string): Promise<CycleSummary[]> {
    const now = new Date().toISOString();

    const cycles = await this.prisma.cycle.findMany({
      where: { teamId },
      orderBy: { startsAt: 'desc' },
    });

    return cycles.map((cycle) => {
      const issueExternalIds = cycle.issueExternalIds
        ? JSON.parse(cycle.issueExternalIds)
        : [];

      return {
        externalId: cycle.externalId,
        teamId: cycle.teamId,
        name:
          cycle.name ??
          (cycle.number ? `Cycle ${cycle.number}` : 'Cycle sans nom'),
        startsAt: cycle.startsAt,
        endsAt: cycle.endsAt,
        issueCount: issueExternalIds.length,
        isActive: new Date(cycle.endsAt) > new Date(now),
      };
    });
  }

  async getCycleIssues(
    cycleId: string,
    teamId: string,
  ): Promise<CycleIssueDetail[]> {
    const cycle = await this.prisma.cycle.findFirstOrThrow({
      where: { externalId: cycleId, teamId },
    });

    const issueExternalIds = cycle.issueExternalIds
      ? JSON.parse(cycle.issueExternalIds)
      : [];

    if (issueExternalIds.length === 0) {
      return [];
    }

    const issues = await this.prisma.issue.findMany({
      where: {
        externalId: { in: issueExternalIds },
        teamId,
      },
    });

    return issues.map((issue) => ({
      externalId: issue.externalId,
      title: issue.title,
      statusName: issue.statusName,
      points: issue.points,
      assigneeName: issue.assigneeName,
    }));
  }

  async isSynchronized(teamId: string): Promise<boolean> {
    const syncProgress = await this.prisma.syncProgress.findFirst({
      where: { teamId, status: 'completed' },
    });

    return syncProgress !== null;
  }
}
