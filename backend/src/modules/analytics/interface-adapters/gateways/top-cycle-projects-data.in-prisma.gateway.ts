import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import {
  type ActiveCycleLocator,
  type CycleProjectAggregate,
  type CycleProjectIssuesResult,
} from '../../entities/top-cycle-projects/top-cycle-projects.schema.js';
import { TopCycleProjectsDataGateway } from '../../entities/top-cycle-projects/top-cycle-projects-data.gateway.js';

interface StoredIssue {
  externalId: string;
  title: string;
  statusName: string;
  points: number | null;
  assigneeName: string | null;
  projectExternalId: string | null;
}

interface StoredTransition {
  issueExternalId: string;
  toStatusName: string;
  toStatusType: string;
  occurredAt: string;
}

const HOURS_IN_MILLISECOND = 1 / (1000 * 60 * 60);

@Injectable()
export class TopCycleProjectsDataInPrismaGateway extends TopCycleProjectsDataGateway {
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

  async getCycleProjectAggregates(
    teamId: string,
    cycleId: string,
    startedStatuses: string[],
    completedStatuses: string[],
  ): Promise<CycleProjectAggregate[]> {
    const issues = await this.findCycleIssues(teamId, cycleId);

    if (issues.length === 0) {
      return [];
    }

    const transitions = await this.findCycleTransitions(teamId, issues);

    const projectNames = await this.findProjectNames(teamId, issues);

    const aggregatesByProjectId = new Map<
      string | null,
      CycleProjectAggregate
    >();

    for (const issue of issues) {
      const existing = aggregatesByProjectId.get(issue.projectExternalId);
      const cycleTimeInHours = computeCycleTimeInHours(
        issue.externalId,
        transitions,
        startedStatuses,
        completedStatuses,
      );

      if (existing) {
        existing.issueCount += 1;
        existing.totalPoints += issue.points ?? 0;
        existing.totalCycleTimeInHours = accumulateCycleTime(
          existing.totalCycleTimeInHours,
          cycleTimeInHours,
        );
      } else {
        aggregatesByProjectId.set(issue.projectExternalId, {
          projectExternalId: issue.projectExternalId,
          projectName:
            issue.projectExternalId === null
              ? null
              : (projectNames.get(issue.projectExternalId) ?? null),
          issueCount: 1,
          totalPoints: issue.points ?? 0,
          totalCycleTimeInHours: cycleTimeInHours,
        });
      }
    }

    return Array.from(aggregatesByProjectId.values());
  }

  async getCycleIssuesForProject(
    teamId: string,
    cycleId: string,
    projectExternalIdOrNull: string | null,
  ): Promise<CycleProjectIssuesResult> {
    const issues = await this.findCycleIssues(teamId, cycleId);

    const filtered = issues.filter(
      (issue) => issue.projectExternalId === projectExternalIdOrNull,
    );

    const projectName =
      projectExternalIdOrNull === null
        ? null
        : ((await this.findProjectName(teamId, projectExternalIdOrNull)) ??
          null);

    return {
      projectName,
      issues: filtered.map((issue) => ({
        externalId: issue.externalId,
        title: issue.title,
        assigneeName: issue.assigneeName,
        points: issue.points,
        statusName: issue.statusName,
      })),
    };
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
      projectExternalId: record.projectExternalId,
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

  private async findProjectNames(
    teamId: string,
    issues: StoredIssue[],
  ): Promise<Map<string, string>> {
    const projectExternalIds = Array.from(
      new Set(
        issues
          .map((issue) => issue.projectExternalId)
          .filter((value): value is string => value !== null),
      ),
    );

    if (projectExternalIds.length === 0) {
      return new Map();
    }

    const records = await this.prisma.project.findMany({
      where: {
        teamId,
        externalId: { in: projectExternalIds },
      },
    });

    const names = new Map<string, string>();
    for (const record of records) {
      names.set(record.externalId, record.name);
    }
    return names;
  }

  private async findProjectName(
    teamId: string,
    projectExternalId: string,
  ): Promise<string | null> {
    const record = await this.prisma.project.findFirst({
      where: { teamId, externalId: projectExternalId },
    });

    return record?.name ?? null;
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
