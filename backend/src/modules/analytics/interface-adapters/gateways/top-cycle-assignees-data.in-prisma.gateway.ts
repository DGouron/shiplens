import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import {
  type ActiveCycleLocator,
  type CycleAssigneeAggregate,
  type CycleAssigneeIssueDetail,
  type CycleAssigneeIssuesResult,
} from '../../entities/top-cycle-assignees/top-cycle-assignees.schema.js';
import { TopCycleAssigneesDataGateway } from '../../entities/top-cycle-assignees/top-cycle-assignees-data.gateway.js';

interface StoredIssue {
  externalId: string;
  title: string;
  statusName: string;
  points: number | null;
  assigneeName: string | null;
}

interface StoredTransition {
  issueExternalId: string;
  toStatusName: string;
  toStatusType: string;
  occurredAt: string;
}

const HOURS_IN_MILLISECOND = 1 / (1000 * 60 * 60);

@Injectable()
export class TopCycleAssigneesDataInPrismaGateway extends TopCycleAssigneesDataGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async getActiveCycleLocator(
    teamId: string,
  ): Promise<ActiveCycleLocator | null> {
    const now = new Date().toISOString();

    const activeCycle = await this.prisma.cycle.findFirst({
      where: {
        teamId,
        startsAt: { lte: now },
        endsAt: { gt: now },
      },
      orderBy: { startsAt: 'desc' },
    });

    if (activeCycle === null) {
      return null;
    }

    return {
      cycleId: activeCycle.externalId,
      cycleName:
        activeCycle.name ??
        (activeCycle.number ? `Cycle ${activeCycle.number}` : 'Cycle'),
    };
  }

  async getCycleAssigneeAggregates(
    teamId: string,
    cycleId: string,
    startedStatuses: string[],
    completedStatuses: string[],
  ): Promise<CycleAssigneeAggregate[]> {
    const issues = await this.findCycleIssues(teamId, cycleId);

    if (issues.length === 0) {
      return [];
    }

    const completedIssues = issues.filter(
      (issue) =>
        issue.assigneeName !== null &&
        completedStatuses.includes(issue.statusName),
    );

    if (completedIssues.length === 0) {
      return [];
    }

    const transitions = await this.findCycleTransitions(
      teamId,
      completedIssues,
    );

    const aggregatesByAssignee = new Map<string, CycleAssigneeAggregate>();

    for (const issue of completedIssues) {
      if (issue.assigneeName === null) {
        continue;
      }

      const cycleTimeInHours = computeCycleTimeInHours(
        issue.externalId,
        transitions,
        startedStatuses,
        completedStatuses,
      );

      const existing = aggregatesByAssignee.get(issue.assigneeName);

      if (existing) {
        existing.issueCount += 1;
        existing.totalPoints += issue.points ?? 0;
        existing.totalCycleTimeInHours = accumulateCycleTime(
          existing.totalCycleTimeInHours,
          cycleTimeInHours,
        );
      } else {
        aggregatesByAssignee.set(issue.assigneeName, {
          assigneeName: issue.assigneeName,
          issueCount: 1,
          totalPoints: issue.points ?? 0,
          totalCycleTimeInHours: cycleTimeInHours,
        });
      }
    }

    return Array.from(aggregatesByAssignee.values());
  }

  async getCycleIssuesForAssignee(
    teamId: string,
    cycleId: string,
    assigneeName: string,
    startedStatuses: string[],
    completedStatuses: string[],
  ): Promise<CycleAssigneeIssuesResult> {
    const issues = await this.findCycleIssues(teamId, cycleId);

    const filtered = issues.filter(
      (issue) =>
        issue.assigneeName === assigneeName &&
        completedStatuses.includes(issue.statusName),
    );

    if (filtered.length === 0) {
      return { assigneeName, issues: [] };
    }

    const transitions = await this.findCycleTransitions(teamId, filtered);

    const details: CycleAssigneeIssueDetail[] = filtered.map((issue) => ({
      externalId: issue.externalId,
      title: issue.title,
      points: issue.points,
      totalCycleTimeInHours: computeCycleTimeInHours(
        issue.externalId,
        transitions,
        startedStatuses,
        completedStatuses,
      ),
      statusName: issue.statusName,
    }));

    return { assigneeName, issues: details };
  }

  private async findCycleIssues(
    teamId: string,
    cycleId: string,
  ): Promise<StoredIssue[]> {
    const cycle = await this.prisma.cycle.findFirst({
      where: { externalId: cycleId, teamId },
    });

    if (cycle === null) {
      return [];
    }

    const issueExternalIds: string[] = cycle.issueExternalIds
      ? JSON.parse(cycle.issueExternalIds)
      : [];

    if (issueExternalIds.length === 0) {
      return [];
    }

    const records = await this.prisma.issue.findMany({
      where: {
        externalId: { in: issueExternalIds },
        teamId,
        deletedAt: null,
      },
    });

    return records.map((record) => ({
      externalId: record.externalId,
      title: record.title,
      statusName: record.statusName,
      points: record.points,
      assigneeName: record.assigneeName,
    }));
  }

  private async findCycleTransitions(
    teamId: string,
    issues: StoredIssue[],
  ): Promise<StoredTransition[]> {
    const records = await this.prisma.stateTransition.findMany({
      where: {
        teamId,
        issueExternalId: { in: issues.map((issue) => issue.externalId) },
      },
    });

    return records.map((record) => ({
      issueExternalId: record.issueExternalId,
      toStatusName: record.toStatusName,
      toStatusType: record.toStatusType,
      occurredAt: record.occurredAt,
    }));
  }
}

function computeCycleTimeInHours(
  issueExternalId: string,
  transitions: StoredTransition[],
  startedStatuses: string[],
  completedStatuses: string[],
): number | null {
  const issueTransitions = transitions.filter(
    (transition) => transition.issueExternalId === issueExternalId,
  );

  const startedTransition = issueTransitions.find(
    (transition) =>
      transition.toStatusType === 'started' ||
      startedStatuses.includes(transition.toStatusName),
  );

  const completedTransition = issueTransitions.find(
    (transition) =>
      transition.toStatusType === 'completed' ||
      completedStatuses.includes(transition.toStatusName),
  );

  if (!startedTransition || !completedTransition) {
    return null;
  }

  const startedAt = new Date(startedTransition.occurredAt).getTime();
  const completedAt = new Date(completedTransition.occurredAt).getTime();

  if (completedAt <= startedAt) {
    return null;
  }

  return (completedAt - startedAt) * HOURS_IN_MILLISECOND;
}

function accumulateCycleTime(
  current: number | null,
  addition: number | null,
): number | null {
  if (current === null) {
    return addition;
  }
  if (addition === null) {
    return current;
  }
  return current + addition;
}
