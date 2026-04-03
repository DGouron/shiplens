import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { WorkspaceDashboardDataGateway } from '../../entities/workspace-dashboard/workspace-dashboard-data.gateway.js';
import { type TeamSummary, type ActiveCycleData } from '../../entities/workspace-dashboard/workspace-dashboard.schema.js';

@Injectable()
export class WorkspaceDashboardDataInPrismaGateway extends WorkspaceDashboardDataGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isWorkspaceConnected(): Promise<boolean> {
    const connection = await this.prisma.linearWorkspaceConnection.findFirst({
      where: { status: 'connected' },
    });
    return connection !== null;
  }

  async getSynchronizedTeams(): Promise<TeamSummary[]> {
    const teams = await this.prisma.selectedTeam.findMany();
    return teams.map((team) => ({
      teamId: team.teamId,
      teamName: team.teamName,
    }));
  }

  async getActiveCycle(teamId: string): Promise<ActiveCycleData | null> {
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

    const issueExternalIds: string[] = activeCycle.issueExternalIds
      ? JSON.parse(activeCycle.issueExternalIds)
      : [];

    if (issueExternalIds.length === 0) {
      return {
        cycleId: activeCycle.externalId,
        cycleName: activeCycle.name ?? `Cycle ${activeCycle.externalId}`,
        totalIssues: 0,
        completedIssues: 0,
        blockedIssues: 0,
        totalPoints: 0,
        completedPoints: 0,
      };
    }

    const issues = await this.prisma.issue.findMany({
      where: {
        externalId: { in: issueExternalIds },
        teamId,
      },
    });

    const completedIssues = issues.filter(
      (issue) => issue.statusName.toLowerCase() === 'done',
    );
    const blockedIssues = issues.filter((issue) =>
      issue.statusName.toLowerCase().includes('blocked'),
    );

    const totalPoints = issues.reduce(
      (sum, issue) => sum + (issue.points ?? 0),
      0,
    );
    const completedPoints = completedIssues.reduce(
      (sum, issue) => sum + (issue.points ?? 0),
      0,
    );

    return {
      cycleId: activeCycle.externalId,
      cycleName: activeCycle.name ?? `Cycle ${activeCycle.externalId}`,
      totalIssues: issues.length,
      completedIssues: completedIssues.length,
      blockedIssues: blockedIssues.length,
      totalPoints,
      completedPoints,
    };
  }

  async getPreviousCycleVelocities(teamId: string): Promise<number[]> {
    const now = new Date().toISOString();

    const completedCycles = await this.prisma.cycle.findMany({
      where: {
        teamId,
        endsAt: { lte: now },
      },
      orderBy: { endsAt: 'desc' },
      take: 3,
    });

    const velocities: number[] = [];

    for (const cycle of completedCycles) {
      const issueExternalIds: string[] = cycle.issueExternalIds
        ? JSON.parse(cycle.issueExternalIds)
        : [];

      if (issueExternalIds.length === 0) {
        velocities.push(0);
        continue;
      }

      const completedIssues = await this.prisma.issue.findMany({
        where: {
          externalId: { in: issueExternalIds },
          teamId,
          statusName: 'Done',
        },
      });

      const velocity = completedIssues.reduce(
        (sum, issue) => sum + (issue.points ?? 0),
        0,
      );
      velocities.push(velocity);
    }

    return velocities;
  }

  async getLastSyncDate(teamId: string): Promise<Date | null> {
    const syncProgress = await this.prisma.syncProgress.findFirst({
      where: { teamId, status: 'completed' },
    });

    return syncProgress?.updatedAt ?? null;
  }
}
