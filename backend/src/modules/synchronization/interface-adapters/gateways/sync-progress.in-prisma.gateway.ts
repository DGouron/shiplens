import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { SyncProgressGateway } from '../../entities/sync-progress/sync-progress.gateway.js';
import { SyncProgress } from '../../entities/sync-progress/sync-progress.js';

@Injectable()
export class SyncProgressInPrismaGateway extends SyncProgressGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(progress: SyncProgress): Promise<void> {
    await this.prisma.syncProgress.upsert({
      where: { teamId: progress.teamId },
      update: {
        totalIssues: progress.totalIssues,
        syncedIssues: progress.syncedIssues,
        status: progress.status,
        cursor: progress.cursor,
      },
      create: {
        teamId: progress.teamId,
        totalIssues: progress.totalIssues,
        syncedIssues: progress.syncedIssues,
        status: progress.status,
        cursor: progress.cursor,
      },
    });
  }

  async getByTeamId(teamId: string): Promise<SyncProgress | null> {
    const record = await this.prisma.syncProgress.findUnique({
      where: { teamId },
    });

    if (!record) {
      return null;
    }

    return SyncProgress.create({
      teamId: record.teamId,
      totalIssues: record.totalIssues,
      syncedIssues: record.syncedIssues,
      status: record.status,
      cursor: record.cursor,
    });
  }

  async getAll(): Promise<SyncProgress[]> {
    const records = await this.prisma.syncProgress.findMany();

    return records.map((record) =>
      SyncProgress.create({
        teamId: record.teamId,
        totalIssues: record.totalIssues,
        syncedIssues: record.syncedIssues,
        status: record.status,
        cursor: record.cursor,
      }),
    );
  }
}
