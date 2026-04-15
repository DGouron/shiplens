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
    const assigneeByIssueKey = await this.loadAssigneeNames(records);

    return records.map((record) =>
      BlockedIssueAlert.create({
        id: record.id,
        issueExternalId: record.issueExternalId,
        issueTitle: record.issueTitle,
        issueUuid: record.issueUuid,
        teamId: record.teamId,
        statusName: record.statusName,
        severity: record.severity,
        durationHours: record.durationHours,
        detectedAt: record.detectedAt,
        active: record.active,
        resolvedAt: record.resolvedAt,
        assigneeName:
          assigneeByIssueKey.get(
            `${record.issueExternalId}:${record.teamId}`,
          ) ?? null,
      }),
    );
  }

  async findAll(): Promise<BlockedIssueAlert[]> {
    const records = await this.prisma.blockedIssueAlert.findMany({
      orderBy: { detectedAt: 'desc' },
    });
    const assigneeByIssueKey = await this.loadAssigneeNames(records);

    return records.map((record) =>
      BlockedIssueAlert.create({
        id: record.id,
        issueExternalId: record.issueExternalId,
        issueTitle: record.issueTitle,
        issueUuid: record.issueUuid,
        teamId: record.teamId,
        statusName: record.statusName,
        severity: record.severity,
        durationHours: record.durationHours,
        detectedAt: record.detectedAt,
        active: record.active,
        resolvedAt: record.resolvedAt,
        assigneeName:
          assigneeByIssueKey.get(
            `${record.issueExternalId}:${record.teamId}`,
          ) ?? null,
      }),
    );
  }

  private async loadAssigneeNames(
    records: Array<{ issueExternalId: string; teamId: string }>,
  ): Promise<Map<string, string>> {
    if (records.length === 0) return new Map();

    const issueKeys = records.map((record) => ({
      externalId: record.issueExternalId,
      teamId: record.teamId,
    }));

    const issues = await this.prisma.issue.findMany({
      where: { OR: issueKeys },
      select: { externalId: true, teamId: true, assigneeName: true },
    });

    const map = new Map<string, string>();
    for (const issue of issues) {
      if (issue.assigneeName) {
        map.set(`${issue.externalId}:${issue.teamId}`, issue.assigneeName);
      }
    }
    return map;
  }

  async save(alert: BlockedIssueAlert): Promise<void> {
    await this.prisma.blockedIssueAlert.upsert({
      where: { id: alert.id },
      create: {
        id: alert.id,
        issueExternalId: alert.issueExternalId,
        issueTitle: alert.issueTitle,
        issueUuid: alert.issueUuid,
        teamId: alert.teamId,
        statusName: alert.statusName,
        severity: alert.severity,
        durationHours: alert.durationHours,
        detectedAt: alert.detectedAt,
        active: alert.active,
        resolvedAt: alert.resolvedAt,
      },
      update: {
        issueTitle: alert.issueTitle,
        teamId: alert.teamId,
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
