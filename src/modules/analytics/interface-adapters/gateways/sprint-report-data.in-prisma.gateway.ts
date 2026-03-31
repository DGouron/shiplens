import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { SprintReportDataGateway, type SprintContext, type TrendContext } from '../../entities/sprint-report/sprint-report-data.gateway.js';
import { type CycleIssue } from '../../entities/cycle-snapshot/cycle-snapshot.schema.js';

@Injectable()
export class SprintReportDataInPrismaGateway extends SprintReportDataGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isSynchronized(teamId: string): Promise<boolean> {
    const syncProgress = await this.prisma.syncProgress.findFirst({
      where: { teamId, status: 'completed' },
    });

    return syncProgress !== null;
  }

  async getSprintContext(cycleId: string, teamId: string): Promise<SprintContext> {
    const cycle = await this.prisma.cycle.findFirstOrThrow({
      where: { externalId: cycleId, teamId },
    });

    const issueExternalIds = cycle.issueExternalIds
      ? cycle.issueExternalIds.split(',').filter(Boolean)
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
      cycleName: cycle.name ?? `Cycle ${cycle.externalId}`,
      startsAt: cycle.startsAt,
      endsAt: cycle.endsAt,
      issues: cycleIssues,
    };
  }

  async getTrendContext(cycleId: string, teamId: string): Promise<TrendContext | null> {
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

    if (previousCycles.length === 0) {
      return null;
    }

    const previousVelocities: number[] = [];

    for (const cycle of previousCycles) {
      const issueExternalIds = cycle.issueExternalIds
        ? cycle.issueExternalIds.split(',').filter(Boolean)
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

    return { previousVelocities };
  }
}
