import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import {
  type BottleneckAnalysisProps,
  type CompletedIssue,
} from '../../entities/bottleneck-analysis/bottleneck-analysis.schema.js';
import { BottleneckAnalysisDataGateway } from '../../entities/bottleneck-analysis/bottleneck-analysis-data.gateway.js';

@Injectable()
export class BottleneckAnalysisDataInPrismaGateway extends BottleneckAnalysisDataGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async getBottleneckData(
    cycleId: string,
    teamId: string,
    completedStatuses: readonly string[],
  ): Promise<BottleneckAnalysisProps> {
    const cycle = await this.prisma.cycle.findFirstOrThrow({
      where: { externalId: cycleId, teamId },
    });

    const issueExternalIds = cycle.issueExternalIds
      ? JSON.parse(cycle.issueExternalIds)
      : [];

    const issues = await this.prisma.issue.findMany({
      where: {
        externalId: { in: issueExternalIds },
        teamId,
      },
    });

    const transitions = await this.prisma.stateTransition.findMany({
      where: {
        issueExternalId: { in: issueExternalIds },
        teamId,
      },
      orderBy: { occurredAt: 'asc' },
    });

    const completedIssues: CompletedIssue[] = issues
      .filter((issue) => {
        return transitions.some(
          (transition) =>
            transition.issueExternalId === issue.externalId &&
            completedStatuses.includes(transition.toStatusName),
        );
      })
      .map((issue) => ({
        externalId: issue.externalId,
        assigneeName: issue.assigneeName,
        transitions: transitions
          .filter(
            (transition) => transition.issueExternalId === issue.externalId,
          )
          .map((transition) => ({
            toStatusName: transition.toStatusName,
            occurredAt: transition.occurredAt,
          })),
      }));

    return {
      cycleId: cycle.externalId,
      teamId: cycle.teamId,
      completedIssues,
    };
  }

  async getPreviousCycleId(
    cycleId: string,
    teamId: string,
  ): Promise<string | null> {
    const currentCycle = await this.prisma.cycle.findFirstOrThrow({
      where: { externalId: cycleId, teamId },
    });

    const previousCycle = await this.prisma.cycle.findFirst({
      where: {
        teamId,
        endsAt: { lt: currentCycle.startsAt },
      },
      orderBy: { endsAt: 'desc' },
    });

    return previousCycle?.externalId ?? null;
  }

  async hasSynchronizedData(teamId: string): Promise<boolean> {
    const issueCount = await this.prisma.issue.count({
      where: { teamId },
    });

    return issueCount > 0;
  }
}
