import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { CycleMetricsDataGateway, type TrendData } from '../../entities/cycle-snapshot/cycle-metrics-data.gateway.js';
import { type CycleSnapshotProps, type CycleIssue } from '../../entities/cycle-snapshot/cycle-snapshot.schema.js';

@Injectable()
export class CycleMetricsDataInPrismaGateway extends CycleMetricsDataGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async getSnapshotData(cycleId: string, teamId: string): Promise<CycleSnapshotProps> {
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
    });

    const cycleIssues: CycleIssue[] = issues.map((issue) => {
      const issueTransitions = transitions.filter(
        (transition) => transition.issueExternalId === issue.externalId,
      );

      const startedTransition = issueTransitions.find(
        (transition) =>
          transition.toStatusName === 'In Progress' ||
          transition.toStatusName === 'Started',
      );

      const completedTransition = issueTransitions.find(
        (transition) =>
          transition.toStatusName === 'Done' ||
          transition.toStatusName === 'Completed',
      );

      return {
        externalId: issue.externalId,
        title: issue.title,
        statusName: issue.statusName,
        points: issue.points,
        createdAt: issue.createdAt,
        completedAt: completedTransition?.occurredAt ?? null,
        startedAt: startedTransition?.occurredAt ?? null,
      };
    });

    return {
      cycleId: cycle.externalId,
      teamId: cycle.teamId,
      cycleName: cycle.name ?? (cycle.number ? `Cycle ${cycle.number}` : 'Cycle sans nom'),
      startsAt: cycle.startsAt,
      endsAt: cycle.endsAt,
      issues: cycleIssues,
    };
  }

  async getTrendData(cycleId: string, teamId: string): Promise<TrendData> {
    const now = new Date().toISOString();

    const previousCycles = await this.prisma.cycle.findMany({
      where: {
        teamId,
        endsAt: { lt: now },
        externalId: { not: cycleId },
      },
      orderBy: { endsAt: 'desc' },
      take: 3,
    });

    const previousVelocities: number[] = [];

    for (const cycle of previousCycles) {
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
      });

      const completedPoints = issues
        .filter((issue) =>
          transitions.some(
            (transition) =>
              transition.issueExternalId === issue.externalId &&
              (transition.toStatusName === 'Done' ||
                transition.toStatusName === 'Completed'),
          ),
        )
        .reduce((sum, issue) => sum + (issue.points ?? 0), 0);

      previousVelocities.push(completedPoints);
    }

    return {
      previousCompletedCycleCount: previousCycles.length,
      previousVelocities,
    };
  }
}
