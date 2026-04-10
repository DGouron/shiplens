import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import {
  BlockedIssueDetectionDataGateway,
  type IssueWithCurrentStatus,
} from '../../entities/blocked-issue-alert/blocked-issue-detection-data.gateway.js';

@Injectable()
export class BlockedIssueDetectionDataInPrismaGateway extends BlockedIssueDetectionDataGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async hasSynchronizedData(): Promise<boolean> {
    const count = await this.prisma.issue.count();
    return count > 0;
  }

  async getIssuesWithCurrentStatus(): Promise<IssueWithCurrentStatus[]> {
    const issues = await this.prisma.issue.findMany({
      where: { deletedAt: null },
    });

    const results: IssueWithCurrentStatus[] = [];

    for (const issue of issues) {
      const lastTransition = await this.prisma.stateTransition.findFirst({
        where: {
          issueExternalId: issue.externalId,
          teamId: issue.teamId,
        },
        orderBy: { occurredAt: 'desc' },
      });

      if (!lastTransition) continue;

      results.push({
        issueExternalId: issue.externalId,
        issueTitle: issue.title,
        issueUuid: issue.externalId,
        statusName: lastTransition.toStatusName,
        statusEnteredAt: lastTransition.occurredAt,
        teamId: issue.teamId,
      });
    }

    return results;
  }
}
