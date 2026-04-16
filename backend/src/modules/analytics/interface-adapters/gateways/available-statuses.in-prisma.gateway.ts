import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { AvailableStatusesGateway } from '../../entities/team-settings/available-statuses.gateway.js';

@Injectable()
export class AvailableStatusesInPrismaGateway extends AvailableStatusesGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async getDistinctStatusNames(teamId: string): Promise<string[]> {
    const results = await this.prisma.issue.findMany({
      where: { teamId, deletedAt: null },
      distinct: ['statusName'],
      select: { statusName: true },
      orderBy: { statusName: 'asc' },
    });
    return results.map((row) => row.statusName);
  }

  async getDistinctTransitionStatusNames(teamId: string): Promise<string[]> {
    const results = await this.prisma.stateTransition.findMany({
      where: { teamId },
      distinct: ['toStatusName'],
      select: { toStatusName: true },
      orderBy: { toStatusName: 'asc' },
    });
    return results.map((row) => row.toStatusName);
  }
}
