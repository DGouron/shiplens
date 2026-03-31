import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { BlockedIssueAlertGateway } from '../../entities/blocked-issue-alert/blocked-issue-alert.gateway.js';
import { BlockedIssueAlert } from '../../entities/blocked-issue-alert/blocked-issue-alert.js';

@Injectable()
export class BlockedIssueAlertInPrismaGateway extends BlockedIssueAlertGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAllActive(): Promise<BlockedIssueAlert[]> {
    const records = await this.prisma.blockedIssueAlert.findMany({
      where: { active: true },
    });

    return records.map((record) =>
      BlockedIssueAlert.create({
        id: record.id,
        issueExternalId: record.issueExternalId,
        issueTitle: record.issueTitle,
        issueUuid: record.issueUuid,
        statusName: record.statusName,
        severity: record.severity,
        durationHours: record.durationHours,
        detectedAt: record.detectedAt,
        active: record.active,
        resolvedAt: record.resolvedAt,
      }),
    );
  }

  async findAll(): Promise<BlockedIssueAlert[]> {
    const records = await this.prisma.blockedIssueAlert.findMany({
      orderBy: { detectedAt: 'desc' },
    });

    return records.map((record) =>
      BlockedIssueAlert.create({
        id: record.id,
        issueExternalId: record.issueExternalId,
        issueTitle: record.issueTitle,
        issueUuid: record.issueUuid,
        statusName: record.statusName,
        severity: record.severity,
        durationHours: record.durationHours,
        detectedAt: record.detectedAt,
        active: record.active,
        resolvedAt: record.resolvedAt,
      }),
    );
  }

  async save(alert: BlockedIssueAlert): Promise<void> {
    await this.prisma.blockedIssueAlert.upsert({
      where: { id: alert.id },
      create: {
        id: alert.id,
        issueExternalId: alert.issueExternalId,
        issueTitle: alert.issueTitle,
        issueUuid: alert.issueUuid,
        statusName: alert.statusName,
        severity: alert.severity,
        durationHours: alert.durationHours,
        detectedAt: alert.detectedAt,
        active: alert.active,
        resolvedAt: alert.resolvedAt,
      },
      update: {
        issueTitle: alert.issueTitle,
        statusName: alert.statusName,
        severity: alert.severity,
        durationHours: alert.durationHours,
        active: alert.active,
        resolvedAt: alert.resolvedAt,
      },
    });
  }

  async saveMany(alerts: BlockedIssueAlert[]): Promise<void> {
    for (const alert of alerts) {
      await this.save(alert);
    }
  }
}
