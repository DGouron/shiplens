import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
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
}
