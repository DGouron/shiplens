import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import {
  type MemberCycleContext,
  MemberDigestDataGateway,
} from '../../entities/member-digest/member-digest-data.gateway.js';

@Injectable()
export class MemberDigestDataInPrismaGateway extends MemberDigestDataGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async getMemberCycleContext(
    cycleId: string,
    teamId: string,
    memberName: string,
  ): Promise<MemberCycleContext> {
    const cycle = await this.prisma.cycle.findFirst({
      where: { externalId: cycleId, teamId },
    });

    if (!cycle) {
      return {
        memberName,
        cycleName: '',
        issues: [],
        blockedIssues: [],
      };
    }

    const issueExternalIds: string[] = cycle.issueExternalIds
      ? JSON.parse(cycle.issueExternalIds)
      : [];

    if (issueExternalIds.length === 0) {
      return {
        memberName,
        cycleName: cycle.name ?? '',
        issues: [],
        blockedIssues: [],
      };
    }

    const issues = await this.prisma.issue.findMany({
      where: {
        externalId: { in: issueExternalIds },
        teamId,
        assigneeName: memberName,
      },
    });

    const memberIssueExternalIds = issues.map((issue) => issue.externalId);

    const issuesWithTime = await Promise.all(
      issues.map(async (issue) => {
        const lastTransition = await this.prisma.stateTransition.findFirst({
          where: {
            issueExternalId: issue.externalId,
            teamId,
          },
          orderBy: { occurredAt: 'desc' },
        });

        const timeInCurrentStatusHours = lastTransition
          ? Math.round(
              (Date.now() - new Date(lastTransition.occurredAt).getTime()) /
                (1000 * 60 * 60),
            )
          : 0;

        return {
          title: issue.title,
          statusName: issue.statusName,
          points: issue.points,
          timeInCurrentStatusHours,
        };
      }),
    );

    const blockedAlerts = await this.prisma.blockedIssueAlert.findMany({
      where: {
        issueExternalId: { in: memberIssueExternalIds },
        teamId,
        active: true,
      },
    });

    const blockedIssues = blockedAlerts.map((alert) => ({
      title: alert.issueTitle,
      statusName: alert.statusName,
      durationHours: alert.durationHours,
    }));

    return {
      memberName,
      cycleName: cycle.name ?? '',
      issues: issuesWithTime,
      blockedIssues,
    };
  }
}
