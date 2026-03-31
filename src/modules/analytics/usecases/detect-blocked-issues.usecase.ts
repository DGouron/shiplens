import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { StatusThresholdGateway } from '../entities/status-threshold/status-threshold.gateway.js';
import { StatusThreshold } from '../entities/status-threshold/status-threshold.js';
import { BlockedIssueAlertGateway } from '../entities/blocked-issue-alert/blocked-issue-alert.gateway.js';
import { BlockedIssueAlert } from '../entities/blocked-issue-alert/blocked-issue-alert.js';
import { BlockedIssueDetectionDataGateway } from '../entities/blocked-issue-alert/blocked-issue-detection-data.gateway.js';
import { NoSynchronizedDataError } from '../entities/blocked-issue-alert/blocked-issue-alert.errors.js';

@Injectable()
export class DetectBlockedIssuesUsecase implements Usecase<void, void> {
  constructor(
    private readonly statusThresholdGateway: StatusThresholdGateway,
    private readonly blockedIssueAlertGateway: BlockedIssueAlertGateway,
    private readonly detectionDataGateway: BlockedIssueDetectionDataGateway,
  ) {}

  async execute(): Promise<void> {
    const hasSyncData = await this.detectionDataGateway.hasSynchronizedData();
    if (!hasSyncData) {
      throw new NoSynchronizedDataError();
    }

    const thresholdMap = await this.buildThresholdMap();
    const issues = await this.detectionDataGateway.getIssuesWithCurrentStatus();
    const existingAlerts = await this.blockedIssueAlertGateway.findAllActive();

    const now = new Date();
    const detectedIssueIds = new Set<string>();

    for (const issue of issues) {
      const threshold = thresholdMap.get(issue.statusName);
      if (!threshold) continue;

      const statusEnteredAt = new Date(issue.statusEnteredAt);
      const durationHours = Math.floor(
        (now.getTime() - statusEnteredAt.getTime()) / (1000 * 60 * 60),
      );

      const severity = threshold.computeSeverity(durationHours);
      if (!severity) continue;

      detectedIssueIds.add(issue.issueExternalId);

      const existingAlert = existingAlerts.find(
        (alert) => alert.issueExternalId === issue.issueExternalId,
      );

      if (existingAlert) {
        const updatedAlert = BlockedIssueAlert.create({
          id: existingAlert.id,
          issueExternalId: issue.issueExternalId,
          issueTitle: issue.issueTitle,
          issueUuid: issue.issueUuid,
          statusName: issue.statusName,
          severity,
          durationHours,
          detectedAt: existingAlert.detectedAt,
          active: true,
          resolvedAt: null,
        });
        await this.blockedIssueAlertGateway.save(updatedAlert);
      } else {
        const newAlert = BlockedIssueAlert.create({
          id: crypto.randomUUID(),
          issueExternalId: issue.issueExternalId,
          issueTitle: issue.issueTitle,
          issueUuid: issue.issueUuid,
          statusName: issue.statusName,
          severity,
          durationHours,
          detectedAt: now.toISOString(),
          active: true,
          resolvedAt: null,
        });
        await this.blockedIssueAlertGateway.save(newAlert);
      }
    }

    for (const alert of existingAlerts) {
      if (!detectedIssueIds.has(alert.issueExternalId)) {
        const resolvedAlert = alert.resolve(now.toISOString());
        await this.blockedIssueAlertGateway.save(resolvedAlert);
      }
    }
  }

  private async buildThresholdMap(): Promise<Map<string, StatusThreshold>> {
    const defaults = StatusThreshold.defaults();
    const customs = await this.statusThresholdGateway.findAll();

    const map = new Map<string, StatusThreshold>();
    for (const threshold of defaults) {
      map.set(threshold.statusName, threshold);
    }
    for (const threshold of customs) {
      map.set(threshold.statusName, threshold);
    }
    return map;
  }
}
