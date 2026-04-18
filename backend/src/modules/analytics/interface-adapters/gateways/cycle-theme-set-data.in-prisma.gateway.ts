import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import {
  type ActiveCycleLocator,
  type ThemeCandidateIssue,
} from '../../entities/cycle-theme-set/cycle-theme-set.schema.js';
import { CycleThemeSetDataGateway } from '../../entities/cycle-theme-set/cycle-theme-set-data.gateway.js';

interface StoredIssue {
  externalId: string;
  title: string;
  statusName: string;
  points: number | null;
  assigneeName: string | null;
  labelIds: string;
}

interface StoredTransition {
  issueExternalId: string;
  toStatusName: string;
  toStatusType: string;
  occurredAt: string;
}

const HOURS_IN_MILLISECOND = 1 / (1000 * 60 * 60);

@Injectable()
export class CycleThemeSetDataInPrismaGateway extends CycleThemeSetDataGateway {
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

  async getCycleIssuesForThemeDetection(
    teamId: string,
    cycleId: string,
  ): Promise<ThemeCandidateIssue[]> {
    const issues = await this.findCycleIssues(teamId, cycleId);

    if (issues.length === 0) {
      return [];
    }

    const labelNameById = await this.resolveLabelNames(teamId, issues);
    const transitions = await this.findCycleTransitions(teamId, issues);

    return issues.map((issue) => ({
      externalId: issue.externalId,
      title: issue.title,
      labels: parseLabelIds(issue.labelIds)
        .map((labelId) => labelNameById.get(labelId))
        .filter((name): name is string => name !== undefined),
      points: issue.points,
      statusName: issue.statusName,
      assigneeName: issue.assigneeName,
      totalCycleTimeInHours: computeCycleTimeInHours(
        issue.externalId,
        transitions,
      ),
      linearUrl: null,
    }));
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
      labelIds: record.labelIds,
    }));
  }

  private async resolveLabelNames(
    teamId: string,
    issues: StoredIssue[],
  ): Promise<Map<string, string>> {
    const labelIds = new Set(
      issues.flatMap((issue) => parseLabelIds(issue.labelIds)),
    );

    if (labelIds.size === 0) {
      return new Map();
    }

    const labels = await this.prisma.label.findMany({
      where: { externalId: { in: Array.from(labelIds) }, teamId },
    });

    return new Map(labels.map((label) => [label.externalId, label.name]));
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

function parseLabelIds(rawLabelIds: string): string[] {
  if (rawLabelIds === '' || rawLabelIds === '[]') {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(rawLabelIds);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((value): value is string => typeof value === 'string');
  } catch {
    return [];
  }
}

function computeCycleTimeInHours(
  issueExternalId: string,
  transitions: StoredTransition[],
): number | null {
  const issueTransitions = transitions.filter(
    (transition) => transition.issueExternalId === issueExternalId,
  );

  const startedTransition = issueTransitions.find(
    (transition) => transition.toStatusType === 'started',
  );

  const completedTransition = issueTransitions.find(
    (transition) => transition.toStatusType === 'completed',
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
