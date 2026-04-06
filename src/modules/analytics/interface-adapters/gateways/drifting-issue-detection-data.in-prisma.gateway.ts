import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { type CompletedIssueDrift } from '../../entities/drifting-issue/completed-issue-drift.schema.js';
import { type DriftingIssueInput } from '../../entities/drifting-issue/drifting-issue.schema.js';
import { DriftingIssueDetectionDataGateway } from '../../entities/drifting-issue/drifting-issue-detection-data.gateway.js';

@Injectable()
export class DriftingIssueDetectionDataInPrismaGateway extends DriftingIssueDetectionDataGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async getInProgressIssues(teamId: string): Promise<DriftingIssueInput[]> {
    const issues = await this.prisma.issue.findMany({
      where: {
        teamId,
        deletedAt: null,
        statusType: { notIn: ['completed', 'canceled'] },
      },
    });

    const results: DriftingIssueInput[] = [];

    for (const issue of issues) {
      const firstStartedTransition =
        await this.prisma.stateTransition.findFirst({
          where: {
            issueExternalId: issue.externalId,
            teamId: issue.teamId,
            toStatusType: 'started',
          },
          orderBy: { occurredAt: 'asc' },
        });

      results.push({
        issueExternalId: issue.externalId,
        issueTitle: issue.title,
        issueUuid: issue.externalId,
        teamId: issue.teamId,
        points: issue.points,
        statusName: issue.statusName,
        statusType: issue.statusType,
        startedAt: firstStartedTransition?.occurredAt ?? null,
      });
    }

    return results;
  }

  async getCompletedCycleDriftData(
    teamId: string,
    cycleId: string,
  ): Promise<CompletedIssueDrift[]> {
    const cycle = await this.prisma.cycle.findFirst({
      where: { externalId: cycleId, teamId },
    });

    if (!cycle?.issueExternalIds) return [];

    const issueExternalIds: string[] = JSON.parse(cycle.issueExternalIds);

    if (issueExternalIds.length === 0) return [];

    const issues = await this.prisma.issue.findMany({
      where: { externalId: { in: issueExternalIds }, teamId },
    });

    const results: CompletedIssueDrift[] = [];

    for (const issue of issues) {
      const firstStartedTransition =
        await this.prisma.stateTransition.findFirst({
          where: {
            issueExternalId: issue.externalId,
            teamId,
            toStatusType: 'started',
          },
          orderBy: { occurredAt: 'asc' },
        });

      const firstCompletedTransition =
        await this.prisma.stateTransition.findFirst({
          where: {
            issueExternalId: issue.externalId,
            teamId,
            toStatusType: 'completed',
          },
          orderBy: { occurredAt: 'asc' },
        });

      results.push({
        issueExternalId: issue.externalId,
        assigneeName: issue.assigneeName ?? null,
        points: issue.points,
        startedAt: firstStartedTransition?.occurredAt ?? null,
        completedAt: firstCompletedTransition?.occurredAt ?? null,
      });
    }

    return results;
  }
}
