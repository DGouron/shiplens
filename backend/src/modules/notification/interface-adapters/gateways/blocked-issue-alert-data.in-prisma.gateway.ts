import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import {
  BlockedIssueAlertDataGateway,
  type BlockedIssueForAlert,
} from '../../entities/team-alert-channel/blocked-issue-alert-data.gateway.js';

@Injectable()
export class BlockedIssueAlertDataInPrismaGateway extends BlockedIssueAlertDataGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findActiveWithContext(): Promise<BlockedIssueForAlert[]> {
    const alerts = await this.prisma.blockedIssueAlert.findMany({
      where: { active: true },
    });

    const results: BlockedIssueForAlert[] = [];

    for (const alert of alerts) {
      const issue = await this.prisma.issue.findFirst({
        where: { externalId: alert.issueExternalId },
      });

      results.push({
        issueExternalId: alert.issueExternalId,
        issueTitle: alert.issueTitle,
        issueUuid: alert.issueUuid,
        statusName: alert.statusName,
        severity: alert.severity,
        durationHours: alert.durationHours,
        assigneeName: issue?.assigneeName ?? null,
        teamId: issue?.teamId ?? '',
      });
    }

    return results.filter((result) => result.teamId !== '');
  }
}
