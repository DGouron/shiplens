import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { DurationPredictionDataGateway } from '../../entities/duration-prediction/duration-prediction-data.gateway.js';

@Injectable()
export class DurationPredictionDataInPrismaGateway extends DurationPredictionDataGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async getCompletedCycleCount(teamId: string): Promise<number> {
    const now = new Date().toISOString();

    const count = await this.prisma.cycle.count({
      where: {
        teamId,
        endsAt: { lt: now },
      },
    });

    return count;
  }

  async getSimilarIssuesCycleTimes(
    teamId: string,
    issueExternalId: string,
  ): Promise<number[]> {
    const targetIssue = await this.prisma.issue.findFirst({
      where: { externalId: issueExternalId, teamId },
    });

    if (!targetIssue) return [];

    const targetLabelIds = targetIssue.labelIds.split(',').filter(Boolean);

    const now = new Date().toISOString();
    const completedCycles = await this.prisma.cycle.findMany({
      where: {
        teamId,
        endsAt: { lt: now },
      },
    });

    const completedIssueExternalIds = completedCycles.flatMap(
      (cycle) => JSON.parse(cycle.issueExternalIds) as string[],
    );

    const uniqueIssueExternalIds = [...new Set(completedIssueExternalIds)];

    if (uniqueIssueExternalIds.length === 0) return [];

    const candidateIssues = await this.prisma.issue.findMany({
      where: {
        externalId: { in: uniqueIssueExternalIds },
        teamId,
        NOT: { externalId: issueExternalId },
      },
    });

    const similarIssues = candidateIssues.filter((issue) => {
      const issueLabelIds = issue.labelIds.split(',').filter(Boolean);
      const hasCommonLabel = targetLabelIds.some((labelId) =>
        issueLabelIds.includes(labelId),
      );

      const hasSamePoints =
        targetIssue.points !== null &&
        issue.points !== null &&
        targetIssue.points === issue.points;

      const hasSameAssignee =
        targetIssue.assigneeName !== null &&
        issue.assigneeName !== null &&
        targetIssue.assigneeName === issue.assigneeName;

      return hasCommonLabel || hasSamePoints || hasSameAssignee;
    });

    if (similarIssues.length === 0) return [];

    const similarExternalIds = similarIssues.map((issue) => issue.externalId);

    const transitions = await this.prisma.stateTransition.findMany({
      where: {
        issueExternalId: { in: similarExternalIds },
        teamId,
      },
    });

    const cycleTimes: number[] = [];

    for (const issue of similarIssues) {
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

      if (!startedTransition || !completedTransition) continue;

      const startedAt = new Date(startedTransition.occurredAt);
      const completedAt = new Date(completedTransition.occurredAt);
      const cycleTimeInDays =
        (completedAt.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24);

      if (cycleTimeInDays > 0) {
        cycleTimes.push(cycleTimeInDays);
      }
    }

    return cycleTimes;
  }
}
