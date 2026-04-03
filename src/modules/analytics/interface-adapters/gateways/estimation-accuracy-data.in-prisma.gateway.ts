import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { EstimationAccuracyDataGateway } from '../../entities/estimation-accuracy/estimation-accuracy-data.gateway.js';
import { type EstimationAccuracyProps } from '../../entities/estimation-accuracy/estimation-accuracy.schema.js';

@Injectable()
export class EstimationAccuracyDataInPrismaGateway extends EstimationAccuracyDataGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async getEstimationData(cycleId: string, teamId: string): Promise<EstimationAccuracyProps> {
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

    const labelIds = new Set(issues.flatMap((issue) => issue.labelIds.split(',').filter(Boolean)));
    const labels = labelIds.size > 0
      ? await this.prisma.label.findMany({
          where: { externalId: { in: Array.from(labelIds) }, teamId },
        })
      : [];

    const labelNameById = new Map(labels.map((label) => [label.externalId, label.name]));

    let excludedWithoutEstimation = 0;
    let excludedWithoutCycleTime = 0;
    const estimatedIssues: EstimationAccuracyProps['issues'] = [];

    for (const issue of issues) {
      if (issue.points === null) {
        excludedWithoutEstimation++;
        continue;
      }

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

      if (!startedTransition || !completedTransition) {
        excludedWithoutCycleTime++;
        continue;
      }

      const startedAt = new Date(startedTransition.occurredAt);
      const completedAt = new Date(completedTransition.occurredAt);
      const cycleTimeInDays = (completedAt.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24);

      if (cycleTimeInDays <= 0) {
        excludedWithoutCycleTime++;
        continue;
      }

      const issueLabelIds = issue.labelIds.split(',').filter(Boolean);
      const labelNames = issueLabelIds
        .map((labelId) => labelNameById.get(labelId))
        .filter((name): name is string => name !== undefined);

      estimatedIssues.push({
        externalId: issue.externalId,
        title: issue.title,
        points: issue.points,
        cycleTimeInDays,
        assigneeName: issue.assigneeName ?? null,
        labelNames,
      });
    }

    return {
      cycleId,
      teamId,
      issues: estimatedIssues,
      excludedWithoutEstimation,
      excludedWithoutCycleTime,
    };
  }

  async getCompletedCycleIds(teamId: string): Promise<string[]> {
    const now = new Date().toISOString();

    const cycles = await this.prisma.cycle.findMany({
      where: {
        teamId,
        endsAt: { lt: now },
      },
      orderBy: { endsAt: 'asc' },
    });

    return cycles.map((cycle) => cycle.externalId);
  }
}
